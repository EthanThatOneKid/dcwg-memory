import { assertEquals } from "@std/assert";
import {
  ANTHROPIC_DEFAULT_MODEL,
  ANTHROPIC_KEY_ENV,
  describeModel,
  missingKeyMessage,
  resolveApiKey,
} from "./providers.ts";

Deno.test("the key is read from ANTHROPIC_API_KEY and the model defaults to Opus 5.5", () => {
  assertEquals(ANTHROPIC_KEY_ENV, "ANTHROPIC_API_KEY");
  assertEquals(ANTHROPIC_DEFAULT_MODEL, "claude-opus-5-5");
});

Deno.test("the canonical key name is tried before the host's prefixed one", () => {
  const env = (name: string) =>
    name === "ANTHROPIC_API_KEY" ? "canonical" : name === "DCWG_ANTHROPIC_API_KEY" ? "prefixed" : undefined;
  assertEquals(resolveApiKey(env), { name: "ANTHROPIC_API_KEY", value: "canonical" });
});

Deno.test("with only the host's prefixed name set, that is what a run reports", () => {
  const env = (name: string) => name === "DCWG_ANTHROPIC_API_KEY" ? "prefixed" : undefined;
  assertEquals(resolveApiKey(env), { name: "DCWG_ANTHROPIC_API_KEY", value: "prefixed" });
});

Deno.test("an absent key resolves to nothing rather than to an empty string", () => {
  assertEquals(resolveApiKey(() => undefined), undefined);
  assertEquals(resolveApiKey(() => ""), undefined);
});

Deno.test("the missing-key message names both variables and the way out", () => {
  const message = missingKeyMessage();
  assertEquals(message.includes("ANTHROPIC_API_KEY"), true);
  assertEquals(message.includes("DCWG_ANTHROPIC_API_KEY"), true);
  assertEquals(message.includes("--skip-wiki"), true);
});

Deno.test("the run report says which model paid for the pass", () => {
  assertEquals(describeModel("claude-haiku-5-5"), "anthropic (claude-haiku-5-5), metered");
});
