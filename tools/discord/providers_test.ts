import { assertEquals, assertThrows } from "@std/assert";
import {
  describeProvider,
  describeRotation,
  fxProviderProblems,
  GATEWAY_DEFAULT_MODEL,
  GATEWAY_FALLBACK_MODELS,
  GEMINI_DEFAULT_MODEL,
  modelRotation,
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
    describeProvider(PROVIDERS.gateway, GATEWAY_DEFAULT_MODEL),
    `gateway (${GATEWAY_DEFAULT_MODEL}), metered`,
  );
  assertEquals(
    describeProvider(PROVIDERS.gemini, "gemini-2.5-flash"),
    "gemini (gemini-2.5-flash), unmetered",
  );
});

Deno.test("the Gateway default is the free model that was measured on this pass", () => {
  // Pinned rather than derived: the whole point of the default is which model it is, and a
  // silent change to it is what put a model that cannot honour the schema in the cron.
  assertEquals(GATEWAY_DEFAULT_MODEL, "minimax/minimax-m3.1-flash");
  assertEquals(GATEWAY_FALLBACK_MODELS, ["stealth/cat-jam"]);
});

Deno.test("the rotation starts at the model the run named and keeps its order", () => {
  assertEquals(modelRotation(PROVIDERS.gateway, GATEWAY_DEFAULT_MODEL), [
    GATEWAY_DEFAULT_MODEL,
    ...GATEWAY_FALLBACK_MODELS,
  ]);
  // A run pointed at a fallback directly does not then repeat it.
  assertEquals(modelRotation(PROVIDERS.gateway, "stealth/cat-jam"), ["stealth/cat-jam"]);
  // A run pointed at something outside the free list keeps its own choice and adds the
  // free models behind it, because a paid model that is rate-limited is the same problem.
  assertEquals(modelRotation(PROVIDERS.gateway, "alibaba/qwen3.7-flash"), [
    "alibaba/qwen3.7-flash",
    ...GATEWAY_FALLBACK_MODELS,
  ]);
});

Deno.test("a provider with nowhere to go has a rotation of one", () => {
  assertEquals(modelRotation(PROVIDERS.gemini, GEMINI_DEFAULT_MODEL), [GEMINI_DEFAULT_MODEL]);
});

Deno.test("the run report names every model a pass may reach", () => {
  assertEquals(describeRotation([GATEWAY_DEFAULT_MODEL]), GATEWAY_DEFAULT_MODEL);
  assertEquals(
    describeRotation([GATEWAY_DEFAULT_MODEL, "stealth/cat-jam"]),
    `${GATEWAY_DEFAULT_MODEL}, then stealth/cat-jam`,
  );
  // The list is read as prose, so it has to stay readable when a provider ever has more
  // than one model behind it.
  assertEquals(describeRotation(["a", "b", "c"]), "a, then b, c");
});
