import { assertEquals, assertThrows } from "@std/assert";
import {
  describeProvider,
  fxProviderProblems,
  parseProviderName,
  PROVIDERS,
  resolveApiKey,
  resolveProvider,
} from "./providers.ts";

Deno.test("a provider name is taken as written and anything else is refused by name", () => {
  assertEquals(parseProviderName("gemini"), "gemini");
  assertEquals(parseProviderName("  gateway "), "gateway");
  assertThrows(
    () => parseProviderName("openrouter"),
    Error,
    "--provider must be one of gateway, gemini, not 'openrouter'",
  );
});

Deno.test("no provider named means the Gateway, which is the shipped default", () => {
  assertEquals(resolveProvider(undefined).name, "gateway");
  assertEquals(resolveProvider("gemini").name, "gemini");
});

Deno.test("the Gateway is metered and Gemini is not, which is what the budget reads", () => {
  assertEquals(PROVIDERS.gateway.metered, true);
  assertEquals(PROVIDERS.gemini.metered, false);
});

Deno.test("a gemini pass talks to the shim, not to Google", () => {
  // The endpoint is OpenAI-compatible but not consistently, and fx is a pinned binary,
  // so the loopback address is the whole reason the shim exists. A base URL that drifted
  // back to Google's would make every fx pass fail without saying why.
  assertEquals(PROVIDERS.gemini.baseUrl, "http://127.0.0.1:8787/v1");
  assertEquals(PROVIDERS.gemini.protocol, "openai-compatible");
  assertEquals(PROVIDERS.gateway.protocol, "gateway");
});

Deno.test("the canonical key name is tried before the host's prefixed one", () => {
  const env = (name: string) =>
    name === "GEMINI_API_KEY"
      ? "canonical"
      : name === "DCWG_GEMINI_API_KEY"
      ? "prefixed"
      : undefined;
  assertEquals(resolveApiKey(PROVIDERS.gemini, env)?.name, "GEMINI_API_KEY");
  assertEquals(resolveApiKey(PROVIDERS.gemini, env)?.value, "canonical");
});

Deno.test("with only the host's prefixed name set, that is what a run reports", () => {
  // Zo secrets are account-wide, so the host carries DCWG_GEMINI_API_KEY. The name has to
  // come back out because fx reads the key from the variable its own settings name.
  const env = (name: string) => name === "DCWG_GEMINI_API_KEY" ? "prefixed" : undefined;
  assertEquals(resolveApiKey(PROVIDERS.gemini, env), {
    name: "DCWG_GEMINI_API_KEY",
    value: "prefixed",
  });
});

Deno.test("an absent key resolves to nothing rather than to an empty string", () => {
  assertEquals(resolveApiKey(PROVIDERS.gemini, () => undefined), undefined);
  assertEquals(resolveApiKey(PROVIDERS.gemini, () => ""), undefined);
});

Deno.test("the default Gateway provider is never checked against a machine's settings", () => {
  // fx ships the Gateway built in, so a runner with no settings file still runs it.
  assertEquals(fxProviderProblems(undefined, PROVIDERS.gateway, "AI_GATEWAY_API_KEY"), []);
  assertEquals(fxProviderProblems({}, PROVIDERS.gateway, "AI_GATEWAY_API_KEY"), []);
});

Deno.test("a missing gemini block is one problem, naming the file and the block", () => {
  const problems = fxProviderProblems({ provider: "gemini" }, PROVIDERS.gemini, "GEMINI_API_KEY");
  assertEquals(problems.length, 1);
  assertEquals(problems[0].includes("~/.fx/settings.json"), true);
  assertEquals(problems[0].includes("providers.gemini"), true);
  assertEquals(problems[0].includes("GEMINI_API_KEY"), true);
});

Deno.test("a settings file that reads the key from another variable is refused", () => {
  // This is the failure that would otherwise look like an unauthenticated request: the
  // connector exports the key under one name and fx reads another.
  const settings = {
    providers: {
      gemini: {
        base_url: PROVIDERS.gemini.baseUrl,
        auth: { env: "DCWG_GEMINI_API_KEY" },
      },
    },
  };
  const problems = fxProviderProblems(settings, PROVIDERS.gemini, "GEMINI_API_KEY");
  assertEquals(problems.length, 1);
  assertEquals(problems[0].includes("DCWG_GEMINI_API_KEY"), true);
  assertEquals(problems[0].includes("GEMINI_API_KEY"), true);
});

Deno.test("a settings file pointing somewhere else is refused, and a matching one is not", () => {
  const matching = {
    providers: {
      gemini: { base_url: PROVIDERS.gemini.baseUrl, auth: { env: "GEMINI_API_KEY" } },
    },
  };
  assertEquals(fxProviderProblems(matching, PROVIDERS.gemini, "GEMINI_API_KEY"), []);

  const elsewhere = {
    providers: {
      gemini: {
        base_url: "https://generativelanguage.googleapis.com/v1beta/openai",
        auth: { env: "GEMINI_API_KEY" },
      },
    },
  };
  const problems = fxProviderProblems(elsewhere, PROVIDERS.gemini, "GEMINI_API_KEY");
  assertEquals(problems.length, 1);
  assertEquals(problems[0].includes("127.0.0.1:8787"), true);
});

Deno.test("the run report says which provider paid for the pass", () => {
  assertEquals(
    describeProvider(PROVIDERS.gateway, "nvidia/nemotron-3.5-lightning-free"),
    "gateway (nvidia/nemotron-3.5-lightning-free), metered",
  );
  assertEquals(
    describeProvider(PROVIDERS.gemini, "gemini-2.5-flash"),
    "gemini (gemini-2.5-flash), unmetered",
  );
});
