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

import { assert, assertEquals, assertStringIncludes, assertThrows } from "@std/assert";
import {
  affordableAttempts,
  budgetAllowance,
  describeModelBudget,
  type ModelBudget,
  OPENROUTER_KEY_URL,
  parseBudgetShare,
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

Deno.test("parseBudgetShare reads a share and refuses anything else", () => {
  assertEquals(parseBudgetShare("1/2"), { index: 1, count: 2 });
  assertEquals(parseBudgetShare(" 2/2 "), { index: 2, count: 2 });
  assertEquals(parseBudgetShare("1/1"), { index: 1, count: 1 });
  for (const bad of ["2", "1-2", "0/2", "3/2", "1/0", "-1/2", "a/b", ""]) {
    assertThrows(() => parseBudgetShare(bad), Error);
  }
});

Deno.test("budgetAllowance reserves the runs still to come, and the last run takes the rest", () => {
  // 38 left, two venues to serve: the first takes half, because the second still has
  // to fold its own delta out of what is left.
  assertEquals(budgetAllowance(FRESH, { index: 1, count: 2 }), 19);
  // The last venue of the day sees whatever the earlier ones did not spend, and is
  // entitled to all of it. It cannot know that until it looks, which is why the
  // probe is per fold rather than once per run.
  assertEquals(budgetAllowance(FRESH, { index: 2, count: 2 }), 38);
  // A spent budget is a share of zero, whichever position asked.
  assertEquals(budgetAllowance(SPENT, { index: 1, count: 1 }), 0);
  assertEquals(budgetAllowance(SPENT, { index: 2, count: 3 }), 0);
  // Odd remainders round down rather than over-promising.
  assertEquals(budgetAllowance({ limit: 50, used: 19, remaining: 31 }, { index: 1, count: 3 }), 10);
});

Deno.test("affordableAttempts buys what the share can pay for, and zero when it cannot", () => {
  // 24-step ceiling: a 50 request share is two attempts, a 25 request share is one.
  assertEquals(affordableAttempts(50, 24, 2), 2);
  assertEquals(affordableAttempts(25, 24, 2), 1);
  assertEquals(affordableAttempts(24, 24, 2), 1);
  // Below one pass the answer is zero, which is the deferral: 23 requests cannot pay
  // for a pass that may spend 24, and a pass that stops halfway is not a fold.
  assertEquals(affordableAttempts(23, 24, 2), 0);
  assertEquals(affordableAttempts(0, 24, 2), 0);
  // The configured ceiling is never exceeded, however rich the day is.
  assertEquals(affordableAttempts(1000, 24, 2), 2);
  // A config that reports no ceiling cannot bound anything, so the caller's own
  // attempt count stands rather than being silently reduced to zero.
  assertEquals(affordableAttempts(5, 0, 2), 2);
});
