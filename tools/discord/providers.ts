/**
 * Where the wiki pass gets its inference.
 *
 * One provider: the Anthropic Messages API, driven by `anthropic.ts`. It is billed per
 * token against a Console API key, and a Claude chat subscription does not pay for it.
 * What bounds a run is `--max-usd`, checked against the usage the API reports.
 */

/**
 * The default model is Claude Opus 5.5. It lives here, beside the key's name, so this
 * module needs no SDK; `anthropic.ts` re-exports it.
 */
export const ANTHROPIC_DEFAULT_MODEL = "claude-opus-5-5";

/** The variable the key is read from by default. */
export const ANTHROPIC_KEY_ENV = "ANTHROPIC_API_KEY";

/**
 * Find the key in the environment, and say which variable answered.
 *
 * The canonical name is tried first and the host's account-wide `DCWG_`-prefixed name
 * second, mirroring how the capture bot's token resolves: Zo secrets are account-wide, so a
 * bare `ANTHROPIC_API_KEY` on this host may belong to another project, and the workflow
 * uses the bare name because repository secrets are already scoped.
 */
export function resolveApiKey(
  env: (name: string) => string | undefined,
): { name: string; value: string } | undefined {
  for (const name of [ANTHROPIC_KEY_ENV, `DCWG_${ANTHROPIC_KEY_ENV}`]) {
    const value = env(name);
    if (value) return { name, value };
  }
  return undefined;
}

/** The message a run gives when the key is absent, naming the fix. */
export function missingKeyMessage(): string {
  return `the wiki pass needs an Anthropic API key: set ${ANTHROPIC_KEY_ENV} ` +
    `(or DCWG_${ANTHROPIC_KEY_ENV} on this host), or pass --skip-wiki`;
}

/** One line for the run report, so a log says which model the pass runs. */
export function describeModel(modelId: string): string {
  return `anthropic (${modelId}), metered`;
}
