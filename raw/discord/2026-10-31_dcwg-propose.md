---
title: "Discord #propose — 2026-10-31"
source: "Discord REST API, channel 1559218298128695386, UTC timestamps"
channel_type: forum
author:
  - "daniellacosse"
created: 2026-10-31
description: "Append-only capture of #propose from 2026-10-31T21:07:01Z to 2026-10-31T21:20:43Z, pulled from the Discord REST API. 4 messages, 1 participants, across 1 thread."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#propose` in the Deno Core Working Group Discord, 2026-10-31T21:07:01Z to 2026-10-31T21:20:43Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire. Threads are grouped under their own headings below, and a forum post's body is the first message under its heading.

---
## per-package (module-level) permissions (thread 1562324423615184897)

**daniellacosse** — 2026-10-31T21:07:01Z (`1566196826103615518`)

what if we used this somehow? https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with#description
[embed] Import attributes - JavaScript | MDN The import attributes feature instructs the runtime about how a module should be loaded, including the behavior of module resolution, fetching, parsing, and evaluation. It's supported in import declarations, export...from declarations, and dynamic import().

_(2026-10-31T21:08:20Z, edited 2026-10-31T21:21:25Z `1566197157973860363`)_

import { fetch } from "runtime:fetch" with { newContext: true, net: "[::1]" };

_(2026-10-31T21:14:00Z `1566198583341088809`)_

(api not even close to final lol)

_(2026-10-31T21:20:43Z, edited 2026-10-31T22:08:41Z `1566200273628823623`)_

should work with <@178483185468833793> 's compile-time optimization idea, throw errors when the wrong attributes are used ("runtime:" only, requires implementation of IPC layer), browsers recognize the syntax, could potentially load multiple fetches with different permissions:

import { fetch as localFetch } from "runtime:fetch" with { net: "[::1]" };
import { fetch as extFetch } from "runtime:fetch" with { sandbox: true };
