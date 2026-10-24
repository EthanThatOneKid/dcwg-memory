import { assertEquals, assertThrows } from "@std/assert";
import {
  describeModel,
  missingKeyMessage,
  parseProviderName,
  PROVIDERS,
  resolveApiKey,
  resolveProvider,
} from "./providers.ts";

Deno.test("a provider name is taken as written and anything else is refused by name", () => {
  assertEquals(parseProviderName("gemini"), "gemini");
  assertEquals(parseProviderName("  anthropic "), "anthropic");
  assertThrows(
    () => parseProviderName("openrouter"),
    Error,
    "--provider must be one of anthropic, gemini, not 'openrouter'",
  );
});

Deno.test("no provider named means Anthropic, which is the shipped default", () => {
  assertEquals(resolveProvider(undefined).name, "anthropic");
  assertEquals(resolveProvider("gemini").name, "gemini");
});

Deno.test("each provider reads its own key and has its own default model", () => {
  assertEquals(PROVIDERS.anthropic.keyEnv, "ANTHROPIC_API_KEY");
  assertEquals(PROVIDERS.anthropic.defaultModel, "claude-opus-5-5");
  assertEquals(PROVIDERS.gemini.keyEnv, "GEMINI_API_KEY");
  assertEquals(PROVIDERS.gemini.defaultModel, "gemini-2.5-flash");
});

Deno.test("the canonical key name is tried before the host's prefixed one", () => {
  const env = (name: string) =>
    name === "GEMINI_API_KEY" ? "canonical" : name === "DCWG_GEMINI_API_KEY" ? "prefixed" : undefined;
  assertEquals(resolveApiKey(PROVIDERS.gemini, env), { name: "GEMINI_API_KEY", value: "canonical" });
});

Deno.test("with only the host's prefixed name set, that is what a run reports", () => {
  const env = (name: string) => name === "DCWG_ANTHROPIC_API_KEY" ? "prefixed" : undefined;
  assertEquals(resolveApiKey(PROVIDERS.anthropic, env), { name: "DCWG_ANTHROPIC_API_KEY", value: "prefixed" });
});

Deno.test("a provider's key is never borrowed from another provider's variable", () => {
  const env = (name: string) => name === "ANTHROPIC_API_KEY" ? "anthropic-key" : undefined;
  assertEquals(resolveApiKey(PROVIDERS.gemini, env), undefined);
});

Deno.test("an absent key resolves to nothing rather than to an empty string", () => {
  assertEquals(resolveApiKey(PROVIDERS.anthropic, () => undefined), undefined);
  assertEquals(resolveApiKey(PROVIDERS.anthropic, () => ""), undefined);
});

Deno.test("the missing-key message names both variables and the way out", () => {
  const message = missingKeyMessage(PROVIDERS.gemini);
  assertEquals(message.includes("GEMINI_API_KEY"), true);
  assertEquals(message.includes("DCWG_GEMINI_API_KEY"), true);
  assertEquals(message.includes("--skip-wiki"), true);
});

Deno.test("the run report says who answered and what it costs", () => {
  assertEquals(
    describeModel(PROVIDERS.anthropic, "claude-haiku-5-5"),
    "anthropic (claude-haiku-5-5), billed per token",
  );
  assertEquals(
    describeModel(PROVIDERS.gemini, "gemini-2.5-flash"),
    "gemini (gemini-2.5-flash), free tier unless the key's project is billed",
  );
});
