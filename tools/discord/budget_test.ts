/**
 * The Gateway's own numbers, on their own.
 *
 * The unit changed with the provider. OpenRouter metered free-model *requests* against a
 * 50-a-day cap, which two agentic passes could spend; the Gateway bills *tokens* against a
 * $5 monthly credit, so what a run has to know is the balance and what one pass costs at
 * the model it was pointed at. The bodies below are the live ones, measured 2026-10-18.
 */
import { assert, assertEquals, assertStringIncludes, assertThrows } from "@std/assert";
import {
  affordableAttempts,
  creditAllowance,
  describeGatewayCredits,
  describePassCost,
  estimatePassCostUsd,
  GATEWAY_CREDITS_URL,
  GATEWAY_MODELS_URL,
  type GatewayCredits,
  MEASURED_PASS_TOKENS,
  type ModelPrice,
  parseBudgetShare,
  parseGatewayCredits,
  parseModelPrice,
  probeGatewayCredits,
  probeModelPrice,
} from "./budget.ts";

/** The balance the connector's own key reported, decimal strings and all. */
const LIVE_CREDITS = { balance: "4.513395538", total_used: "1.692157662" };
const CREDITS: GatewayCredits = { balanceUsd: 4.513395538, totalUsedUsd: 1.692157662 };

/** A catalogue holding a free model and a paid one, priced as the Gateway publishes them. */
const CATALOGUE = {
  data: [
    {
      id: "nvidia/nemotron-3.5-lightning-free",
      pricing: { input: "0", output: "0" },
    },
    {
      id: "alibaba/qwen3.7-flash",
      pricing: { input: "0.00000003", output: "0.00000013" },
    },
  ],
};

const FREE: ModelPrice = { inputUsdPerToken: 0, outputUsdPerToken: 0 };
const PAID: ModelPrice = { inputUsdPerToken: 0.00000003, outputUsdPerToken: 0.00000013 };

/** A fetch that answers one body, for the probes' happy path. */
function jsonFetch(body: unknown): typeof fetch {
  return (() => Promise.resolve(Response.json(body))) as unknown as typeof fetch;
}

/** A fetch that answers a status, for the probes' rejected-key path. */
function statusFetch(status: number): typeof fetch {
  return (() => Promise.resolve(new Response("nope", { status }))) as unknown as typeof fetch;
}

Deno.test("parseGatewayCredits reads the body the credits endpoint returns today", () => {
  assertEquals(parseGatewayCredits(LIVE_CREDITS), CREDITS);
});

Deno.test("parseGatewayCredits also reads the two fields as numbers", () => {
  // Not what the endpoint does today. Accepted so a shape change degrades to the right
  // answer instead of to "no budget was reported".
  assertEquals(parseGatewayCredits({ balance: 5, total_used: 1 }), {
    balanceUsd: 5,
    totalUsedUsd: 1,
  });
});

Deno.test("parseGatewayCredits is undefined rather than a throw on anything unexpected", () => {
  // `undefined` means "no budget was reported", which is the same outcome as an
  // unreachable endpoint: the run proceeds and the provider's own refusal is the backstop.
  for (
    const payload of [
      undefined,
      null,
      0,
      "balance",
      [],
      {},
      { balance: "4.51" },
      { total_used: "1.69" },
      { balance: "not a number", total_used: "1.69" },
      { balance: Number.NaN, total_used: 0 },
      { data: { balance: "4.51", total_used: "1.69" } },
    ]
  ) {
    assertEquals(parseGatewayCredits(payload), undefined, `for ${JSON.stringify(payload)}`);
  }
});

Deno.test("probeGatewayCredits asks the documented endpoint with the key as a bearer token", async () => {
  let seen: { url: string; authorization: string | null } | undefined;
  const fetchImpl = ((url: string | URL | Request, init?: RequestInit) => {
    seen = {
      url: String(url),
      authorization: new Headers(init?.headers).get("authorization"),
    };
    return Promise.resolve(Response.json(LIVE_CREDITS));
  }) as unknown as typeof fetch;

  assertEquals(await probeGatewayCredits({ apiKey: "gw-test", fetchImpl }), CREDITS);
  assertEquals(seen?.url, GATEWAY_CREDITS_URL);
  assertEquals(seen?.authorization, "Bearer gw-test");
});

Deno.test("probeGatewayCredits answers undefined when the key is rejected or the call fails", async () => {
  // A run must not fail because its budget could not be read.
  assertEquals(
    await probeGatewayCredits({ apiKey: "gw-test", fetchImpl: statusFetch(401) }),
    undefined,
  );
  const unreachable =
    (() => Promise.reject(new Error("getaddrinfo ENOTFOUND"))) as unknown as typeof fetch;
  assertEquals(
    await probeGatewayCredits({ apiKey: "gw-test", fetchImpl: unreachable }),
    undefined,
  );
  const notJson =
    (() => Promise.resolve(new Response("<html>nope</html>"))) as unknown as typeof fetch;
  assertEquals(await probeGatewayCredits({ apiKey: "gw-test", fetchImpl: notJson }), undefined);
});

Deno.test("parseModelPrice reads a free model as genuinely free", () => {
  // Zero and "unpriced" are different answers and the caller must not conflate them: a
  // free model is unlimited apart from the provider's rate limits, while an unpriced one
  // is a model whose spend nothing is bounding.
  assertEquals(parseModelPrice(CATALOGUE, "nvidia/nemotron-3.5-lightning-free"), FREE);
  assertEquals(parseModelPrice(CATALOGUE, "alibaba/qwen3.7-flash"), PAID);
});

Deno.test("parseModelPrice is undefined for a model the catalogue does not carry", () => {
  assertEquals(parseModelPrice(CATALOGUE, "someone/unknown-model"), undefined);
  for (
    const payload of [
      undefined,
      null,
      {},
      { data: null },
      { data: {} },
      { data: [{ id: "x/y", pricing: null }] },
      { data: [{ id: "x/y", pricing: { input: "0.1" } }] },
      { data: [{ pricing: { input: "0", output: "0" } }] },
    ]
  ) {
    assertEquals(parseModelPrice(payload, "x/y"), undefined, `for ${JSON.stringify(payload)}`);
  }
});

Deno.test("probeModelPrice asks the catalogue and answers undefined on any failure", async () => {
  let seen: { url: string; authorization: string | null } | undefined;
  const fetchImpl = ((url: string | URL | Request, init?: RequestInit) => {
    seen = { url: String(url), authorization: new Headers(init?.headers).get("authorization") };
    return Promise.resolve(Response.json(CATALOGUE));
  }) as unknown as typeof fetch;
  assertEquals(
    await probeModelPrice({ apiKey: "gw-test", modelId: "alibaba/qwen3.7-flash", fetchImpl }),
    PAID,
  );
  assertEquals(seen?.url, GATEWAY_MODELS_URL);
  assertEquals(seen?.authorization, "Bearer gw-test");
  assertEquals(
    await probeModelPrice({
      apiKey: "gw-test",
      modelId: "alibaba/qwen3.7-flash",
      fetchImpl: statusFetch(500),
    }),
    undefined,
  );
});

Deno.test("estimatePassCostUsd prices the measured pass, and separates free from unpriced", () => {
  assertEquals(estimatePassCostUsd(FREE), 0);
  assertEquals(estimatePassCostUsd(undefined), undefined);
  // The measured 594-message pass at qwen3.7-flash's published price: the same ~3.2 cents
  // the 2026-10-18 evaluation computed by hand, which is why this is a cross-check rather
  // than a restatement.
  const cost = estimatePassCostUsd(PAID);
  assert(cost !== undefined);
  assert(
    Math.abs(cost - 0.0315) < 0.0005,
    `one pass at qwen3.7-flash should be about $0.0315, got $${cost}`,
  );
  assertEquals(MEASURED_PASS_TOKENS, { input: 966946, output: 19488 });
});

Deno.test("describeGatewayCredits and describePassCost say what the run is spending", () => {
  assertStringIncludes(describeGatewayCredits(CREDITS), "$4.51 left");
  assertStringIncludes(describeGatewayCredits(CREDITS), "1.69 spent");
  assertStringIncludes(describeGatewayCredits(undefined), "not reported by the provider");
  assertStringIncludes(describePassCost(0), "the model is free");
  assertStringIncludes(describePassCost(0.0315), "$0.0315");
  assertStringIncludes(describePassCost(undefined), "not priced");
});

Deno.test("parseBudgetShare reads a share and refuses anything else", () => {
  assertEquals(parseBudgetShare("1/2"), { index: 1, count: 2 });
  assertEquals(parseBudgetShare(" 2/2 "), { index: 2, count: 2 });
  assertEquals(parseBudgetShare("1/1"), { index: 1, count: 1 });
  for (const bad of ["2", "1-2", "0/2", "3/2", "1/0", "-1/2", "a/b", ""]) {
    assertThrows(() => parseBudgetShare(bad), Error);
  }
});

Deno.test("creditAllowance reserves the runs still to come, and the last run takes the rest", () => {
  // $4.51 left, two venues to serve: the first takes half, because the second still has to
  // fold its own delta out of what is left. Money is fractional, so it is not rounded down
  // to a whole unit the way request counts were.
  assertEquals(creditAllowance(CREDITS, { index: 1, count: 2 }), 4.513395538 / 2);
  assertEquals(creditAllowance(CREDITS, { index: 2, count: 2 }), 4.513395538);
  // An exhausted balance is a share of zero, whichever position asked.
  const spent: GatewayCredits = { balanceUsd: 0, totalUsedUsd: 5 };
  assertEquals(creditAllowance(spent, { index: 1, count: 1 }), 0);
  assertEquals(creditAllowance(spent, { index: 2, count: 3 }), 0);
  // A balance the endpoint reported as negative cannot become a negative allowance.
  assertEquals(creditAllowance({ balanceUsd: -1, totalUsedUsd: 6 }, { index: 1, count: 2 }), 0);
});

Deno.test("affordableAttempts buys what the share can pay for, and nothing when it cannot", () => {
  // A free model spends no credits, so the allowance buys every attempt asked for.
  assertEquals(affordableAttempts(0, 0, 2), 2);
  assertEquals(affordableAttempts(4.51, 0, 2), 2);
  // A priced model buys whole passes out of what is left.
  assertEquals(affordableAttempts(0.07, 0.0315, 2), 2);
  assertEquals(affordableAttempts(0.03, 0.0315, 2), 0);
  assertEquals(affordableAttempts(0.063, 0.0315, 2), 2);
  // Below one pass the answer is zero, which is the deferral: a pass that stops halfway is
  // not a fold, and it still spends.
  assertEquals(affordableAttempts(0, 0.0315, 2), 0);
  // The caller's own attempt count is never exceeded, however rich the balance is.
  assertEquals(affordableAttempts(1000, 0.0315, 2), 2);
  // A price that is not a positive number cannot bound anything, so the caller's count
  // stands rather than being silently reduced to zero.
  assertEquals(affordableAttempts(5, Number.NaN, 2), 2);
  assertEquals(affordableAttempts(5, -1, 2), 2);
});
