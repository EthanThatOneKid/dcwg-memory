#!/usr/bin/env -S deno run -A
/**
 * Build this wiki into a static site with the full Wikipedia-themed layout.
 *
 * Usage: deno run -A build.ts [--output-dir _site]
 *
 * The layout in `layouts/wikipedia.html` owns its token vocabulary and its
 * look; the page loop, metadata panels, infobox, TOC, index and asset copy are
 * the engine's `buildThemedSite` (`@wazoo/wiki/theme`, 0.7.0+). This file only
 * adds Prism highlighting for the RDF metadata panels.
 */

import { dirname, fromFileUrl, join } from "@std/path";
import {
  buildThemedSite,
  Config,
  escapeHtml,
  type MetadataView,
} from "@wazoo/wiki/theme";
import Prism from "prismjs";
import "prismjs/components/prism-turtle.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-markup.js";

const SITE_DIR = dirname(fromFileUrl(import.meta.url));

/**
 * Metadata lexer (from `METADATA_VIEWS`) to Prism language.
 *
 * The engine labels the N-Triples and N-Quads views with the `nt` lexer; both
 * are Turtle-family, so Prism's `turtle` grammar covers them. Importing
 * `prism-turtle` also registers `trig`.
 */
const PRISM_LANGUAGE_BY_LEXER: Readonly<Record<string, string>> = {
  json: "json",
  turtle: "turtle",
  n3: "turtle",
  xml: "markup",
  nt: "turtle",
  trig: "trig",
};

function highlightRdf(text: string, view: MetadataView): string {
  const language = PRISM_LANGUAGE_BY_LEXER[view.lexer];
  const grammar = language === undefined
    ? undefined
    : Prism.languages[language];
  if (grammar === undefined || language === undefined) return escapeHtml(text);
  return Prism.highlight(text, grammar, language);
}

export function buildSiteToOutputDir(
  config: Config,
  outputDir: string,
): Promise<number> {
  return buildThemedSite(config, outputDir, {
    dir: SITE_DIR,
    title_suffix: " - DCWG Memory",
    metadata: { highlight: highlightRdf },
  });
}

function parseOutputDir(args: string[]): string {
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--output-dir") {
      const value = args[index + 1];
      if (!value) throw new Error("--output-dir requires a path");
      return value;
    }
    if (args[index]?.startsWith("--output-dir=")) {
      return args[index]!.slice("--output-dir=".length);
    }
  }
  return "_site";
}

if (import.meta.main) {
  const config = Config.load(join(SITE_DIR, "wiki.yml"));
  const written = await buildSiteToOutputDir(config, parseOutputDir(Deno.args));
  console.log(`Built ${written} pages`);
}
