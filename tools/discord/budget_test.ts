/**
 * The provider's own budget, on its own.
 *
 * This is the number the daily automation actually runs out of. The OpenRouter free
 * tier meters *requests*, not tokens, so one agentic step is one unit whatever it
 * carries: a 594-message backfill and a three-message day cost the same until the
 * steps run out. Measured 2026-10-17, that is how the `#brainstorm` fold spent a
 * whole day and left the next run answering 429 to its first request.
 *
 * The counters below are the real ones that key returned, including `used: 51`
 * against `limit: 50`, which is what a run that overshoots its cap looks like.
 */

import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import {
  describeModelBudget,
  type ModelBudget,
  OPENROUTER_KEY_URL,
  parseModelBudget,
  probeModelBudget,
} from "./budget.ts";

const SPENT: ModelBudget = { limit: 50, used: 51, remaining: 0 };
const FRESH: ModelBudget = { limit: 50, used: 12, remaining: 38 };

/** A fetch that answers one body, for the probe's happy path. */
function jsonFetch(body: unknown): typeof fetch {
  return (() => Promise.resolve(Response.json(body))) as unknown as typeof fetch;
}

/** A fetch that answers a status, for the probe's rejected-key path. */
function statusFetch(status: number): typeof fetch {
  return (() => Promise.resolve(new Response("nope", { status }))) as unknown as typeof fetch;
}

Deno.test("parseModelBudget reads the body the key endpoint returns today", () => {
  // The live shape, 2026-10-17: wrapped in `data`, alongside the fields that name
  // the tier. Only the free-model counters are this module's business.
  const body = {
    data: {
      label: "sk-or-v1-88d...6bb",
      is_free_tier: true,
      usage: 0,
      free_model_daily_requests: { used: 51, limit: 50, remaining: 0 },
    },
  };
  assertEquals(parseModelBudget(body), SPENT);
});

Deno.test("parseModelBudget also reads the counters unwrapped", () => {
  // Not what the endpoint does today. Accepted so a shape change degrades to the
  // right answer instead of to "no budget was reported".
  assertEquals(parseModelBudget({ free_model_daily_requests: FRESH }), FRESH);
});

Deno.test("parseModelBudget is undefined when the key publishes no free-model counters", () => {
  // A paid key, or any key whose limits are not free-model limits. `undefined`
  // means "no budget applies here", which is the same outcome as an unreachable
  // endpoint: the run proceeds and the provider's own 429 is the backstop.
  assertEquals(parseModelBudget({ data: { label: "sk-or-v1-x", usage: 0 } }), undefined);
});

Deno.test("parseModelBudget is undefined rather than a throw on anything unexpected", () => {
  for (
    const payload of [
      undefined,
      null,
      0,
      "free_model_daily_requests",
      [],
      { data: null },
      { data: { free_model_daily_requests: null } },
      { data: { free_model_daily_requests: { limit: 50 } } },
      { data: { free_model_daily_requests: { limit: "50", used: 1, remaining: 49 } } },
      { data: { free_model_daily_requests: { limit: 50, used: 1, remaining: null } } },
      { data: { free_model_daily_requests: { limit: Number.NaN, used: 1, remaining: 49 } } },
    ]
  ) {
    assertEquals(parseModelBudget(payload), undefined);
  }
});

Deno.test("probeModelBudget asks the documented endpoint with the key as a bearer token", async () => {
  let seen: { url: string; authorization: string | null } | undefined;
  const fetchImpl = ((url: string | URL | Request, init?: RequestInit) => {
    seen = {
      url: String(url),
      authorization: new Headers(init?.headers).get("authorization"),
    };
    return Promise.resolve(Response.json({ data: { free_model_daily_requests: SPENT } }));
  }) as unknown as typeof fetch;

  assertEquals(await probeModelBudget({ apiKey: "sk-or-v1-test", fetchImpl }), SPENT);
  assertEquals(seen?.url, OPENROUTER_KEY_URL);
  assertEquals(seen?.authorization, "Bearer sk-or-v1-test");
});

Deno.test("probeModelBudget answers undefined when the key is rejected", async () => {
  // A run must not fail because its budget could not be read: an unreadable budget
  // and an absent one are the same situation, and the provider's own 429 is what
  // catches the difference.
  assertEquals(
    await probeModelBudget({ apiKey: "sk-or-v1-test", fetchImpl: statusFetch(401) }),
    undefined,
  );
});

Deno.test("probeModelBudget answers undefined when the request itself fails", async () => {
  const unreachable =
    (() => Promise.reject(new Error("getaddrinfo ENOTFOUND"))) as unknown as typeof fetch;
  assertEquals(
    await probeModelBudget({ apiKey: "sk-or-v1-test", fetchImpl: unreachable }),
    undefined,
  );

  const notJson =
    (() => Promise.resolve(new Response("<html>nope</html>"))) as unknown as typeof fetch;
  assertEquals(await probeModelBudget({ apiKey: "sk-or-v1-test", fetchImpl: notJson }), undefined);
});

Deno.test("probeModelBudget reads a spent budget without inventing headroom", async () => {
  const budget = await probeModelBudget({
    apiKey: "sk-or-v1-test",
    fetchImpl: jsonFetch({ data: { free_model_daily_requests: SPENT } }),
  });
  assertEquals(budget?.remaining, 0);
});

Deno.test("describeModelBudget names what is left, and says so when nothing was reported", () => {
  assertStringIncludes(describeModelBudget(FRESH), "38 of 50 request(s) left today");
  assertStringIncludes(describeModelBudget(FRESH), "12 used");
  assertStringIncludes(describeModelBudget(SPENT), "0 of 50 request(s) left today");
  assertStringIncludes(describeModelBudget(undefined), "not reported by the provider");
  assert(describeModelBudget(undefined) !== describeModelBudget(FRESH));
});
