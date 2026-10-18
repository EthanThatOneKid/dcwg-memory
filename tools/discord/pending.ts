/**
 * The wiki fold queue: what the archive committed but the wiki has not absorbed.
 *
 * `raw/` and `wiki/` fail differently, so they need different guarantees. A capture is
 * evidence: it is written once and committed unconditionally, and the cursor advances
 * with it, because "the archive is complete through here" is true the moment the file
 * exists. The wiki is derived, and a model call, a gate, or a rate limit can stop it
 * folding a capture in. That lag has to be remembered somewhere durable, or the
 * material is dropped in silence.
 *
 * The queue lives under `_pending` in the connector's own cursor file
 * (`raw/discord/.cursor`), which the hub already treats as mutable connector state, so
 * remembering the lag needs no new file and no new invariant. An entry is a capture
 * path plus how many characters of it have been folded in, which is how a capture too
 * long for one prompt is drained over several runs instead of losing its head.
 *
 * Order is oldest first and a new capture is appended: material the model could not
 * fold is retried on the next run rather than skipped in favour of newer material, and
 * a queue that stops draining is visible in a committed file rather than implied.
 *
 * An entry belongs to the venue that captured it, and a run drains only its own. That
 * is what keeps a fold honest: the pass names the channel it is folding and counts the
 * messages in it, and those are facts about the run's own venue, not about whichever
 * capture happens to be oldest in a shared list. A venue removed from the workflow
 * leaves its entries queued rather than having another venue fold them under the wrong
 * heading.
 */

/** A capture committed to `raw/` that the wiki has not fully absorbed. */
export interface PendingFold {
  /** Repo-relative path, e.g. `raw/discord/2026-10-11_dcwg-brainstorm.md`. */
  capture: string;
  /** The venue that captured it, matching the workflow's `VENUES` slug. */
  venue: string;
  /** Messages it holds, so a fold staged later still reports the real count. */
  messages: number;
  /** Characters of it already folded in; the next fold resumes here. */
  offset: number;
  /**
   * How many consecutive runs have failed to fold it.
   *
   * Not a retry cap: the queue is deliberately ordered and never skips, so that material
   * the wiki never absorbed is never silently passed over in favour of newer material.
   * This is the number that makes a stuck venue diagnosable at a glance instead of
   * making someone diff `.cursor` against the previous day to count the failures.
   */
  stalls: number;
}

/** What a run knows about a capture at the moment it queues it. */
export interface FoldRequest {
  capture: string;
  venue: string;
  messages: number;
}

/** The key the queue occupies in the connector's cursor file. */
export const PENDING_KEY = "_pending";

/** Read the queue, dropping anything malformed rather than failing the run. */
export function readPending(store: Record<string, unknown>): PendingFold[] {
  const raw = store[PENDING_KEY];
  if (!Array.isArray(raw)) return [];
  const folds: PendingFold[] = [];
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const { capture, venue, messages, offset, stalls } = entry as Record<string, unknown>;
    if (typeof capture !== "string" || !capture) continue;
    if (typeof venue !== "string" || !venue) continue;
    folds.push({
      capture,
      venue,
      messages: typeof messages === "number" && Number.isInteger(messages) && messages >= 0
        ? messages
        : 0,
      offset: typeof offset === "number" && Number.isInteger(offset) && offset >= 0 ? offset : 0,
      stalls: typeof stalls === "number" && Number.isInteger(stalls) && stalls >= 0 ? stalls : 0,
    });
  }
  return folds;
}

/** Write the queue back. An empty queue removes the key rather than leaving `[]`. */
export function setPending(store: Record<string, unknown>, folds: PendingFold[]): void {
  if (folds.length) store[PENDING_KEY] = folds;
  else delete store[PENDING_KEY];
}

/** Append a capture, unless the queue already holds it. */
export function enqueue(folds: PendingFold[], request: FoldRequest): PendingFold[] {
  if (folds.some((fold) => fold.capture === request.capture)) return folds;
  return [...folds, { ...request, offset: 0, stalls: 0 }];
}

/** The entries one venue's run may fold, oldest first. */
export function pendingFor(folds: PendingFold[], venue: string): PendingFold[] {
  return folds.filter((fold) => fold.venue === venue);
}

/**
 * Record how far a fold read through the capture.
 *
 * The pass reads a capture forward, so `absorbed` never moves an entry backwards: a
 * smaller value would claim the wiki carries less than this run already folded in. An
 * entry whose offset reaches the capture's length is done and leaves the queue.
 */
export function advance(
  folds: PendingFold[],
  capture: string,
  absorbed: number,
  total: number,
): PendingFold[] {
  return folds.flatMap((fold) => {
    if (fold.capture !== capture) return [fold];
    const offset = Math.max(fold.offset, Math.min(absorbed, total));
    // A fold that reached the gates made progress, so a run that absorbed part of a
    // long capture is not the same as one that could not touch it: the stall count
    // measures consecutive runs that moved nothing, not runs that have not finished.
    return offset >= total ? [] : [{ ...fold, offset, stalls: 0 }];
  });
}

/**
 * Count a run that could not fold this capture at all.
 *
 * Nothing else changes: the entry keeps its offset and its place in the queue, because
 * the next run has to retry this material rather than skip it.
 */
export function stall(folds: PendingFold[], capture: string): PendingFold[] {
  return folds.map((fold) =>
    fold.capture === capture ? { ...fold, stalls: fold.stalls + 1 } : fold
  );
}

/** Forget an entry, for a capture that is no longer on disk. */
export function drop(folds: PendingFold[], capture: string): PendingFold[] {
  return folds.filter((fold) => fold.capture !== capture);
}
