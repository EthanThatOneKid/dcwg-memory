/**
 * The wiki gates, embedded rather than shelled out to the CLI.
 *
 * The repo used to run the `wiki` command, which is the Python engine frozen at
 * `wazootech-wiki==0.1.23`. The engine was rewritten in Deno (PR #317, merged
 * 2026-10-08) and the Python line receives no further fixes, so the connector
 * embeds `@wazoo/wiki` directly: same engine the CLI drives, no subprocess, and
 * no Python on the ingest path.
 *
 * `build.py` is the one holdout and cannot move yet: it imports the Python
 * engine as a library (`from wiki.site.build import build_site`), and the
 * wikipedia theme has no Deno port in `wazootech/wiki-templates`. That is why
 * `wiki.yml` sets no `fmt:` block: the two engines spell those keys
 * differently, each rejects the other's, and leaving them at the defaults is
 * the only config both accept.
 */

import { Wiki } from "@wazoo/wiki";
import type { AuditReport } from "@wazoo/wiki";

/** One gate's verdict, with the text a retry should hand back to the model. */
export interface GateOutcome {
  name: string;
  ok: boolean;
  output: string;
}

/** Keep a gate's report small enough to sit inside a retry prompt. */
const MAX_OUTPUT = 2_000;

function clip(text: string): string {
  const trimmed = text.trim();
  return trimmed.length <= MAX_OUTPUT
    ? trimmed
    : `${trimmed.slice(0, MAX_OUTPUT)}\n… (truncated)`;
}

/** An audit report as `errors` then `warnings`, which is what the CLI prints. */
function auditOutput(report: AuditReport): string {
  const [errors, warnings] = report.messages();
  const lines: string[] = [];
  if (errors.length > 0) {
    lines.push(`${errors.length} error(s):`);
    for (const message of errors) lines.push(`  - ${message}`);
  }
  if (warnings.length > 0) {
    lines.push(`${warnings.length} warning(s):`);
    for (const message of warnings) lines.push(`  - ${message}`);
  }
  return lines.join("\n") || "no issues";
}

/**
 * Run the four wiki gates against a checkout.
 *
 * `fmt` runs first and writes, because it is the canonicalizer: a page the pass
 * wrote with different spacing should be normalized before it is judged. The
 * three checks then run in strict mode, so a warning is a failure.
 */
export async function runWikiGates(configPath: string): Promise<GateOutcome[]> {
  const outcomes: GateOutcome[] = [];

  let wiki: Wiki;
  try {
    wiki = Wiki.load(configPath);
  } catch (error) {
    return [{
      name: "load config",
      ok: false,
      output: clip(`${(error as Error).message}`),
    }];
  }

  try {
    const formatted = wiki.format(null, {});
    outcomes.push({
      name: "fmt",
      ok: formatted.ok,
      output: formatted.error_message ?? `${formatted.formatted_count} file(s) formatted`,
    });
  } catch (error) {
    outcomes.push({ name: "fmt", ok: false, output: clip(`${(error as Error).message}`) });
  }

  try {
    const check = await wiki.check(null, { strict: true });
    outcomes.push({ name: "check --strict", ok: check.ok, output: auditOutput(check) });
  } catch (error) {
    outcomes.push({
      name: "check --strict",
      ok: false,
      output: clip(`${(error as Error).message}`),
    });
  }

  try {
    const lint = await wiki.lint(null, { strict: true });
    outcomes.push({ name: "lint --strict", ok: lint.ok, output: auditOutput(lint) });
  } catch (error) {
    outcomes.push({
      name: "lint --strict",
      ok: false,
      output: clip(`${(error as Error).message}`),
    });
  }

  try {
    const render = await wiki.render(null, { check: true });
    const parts: string[] = [];
    if (render.stale_files.length > 0) {
      parts.push(`stale SPARQL block(s): ${render.stale_files.join(", ")}`);
    }
    for (const message of render.render_errors) parts.push(message);
    outcomes.push({
      name: "render --check",
      ok: render.ok,
      output: clip(parts.join("\n") || "no issues"),
    });
  } catch (error) {
    outcomes.push({
      name: "render --check",
      ok: false,
      output: clip(`${(error as Error).message}`),
    });
  }

  return outcomes;
}

/** A compact failure summary for the retry prompt: what failed, and why. */
export function gateFeedback(outcomes: GateOutcome[]): string {
  return outcomes
    .filter((outcome) => !outcome.ok)
    .map((outcome) => `${outcome.name} FAILED\n${outcome.output}`)
    .join("\n\n");
}
