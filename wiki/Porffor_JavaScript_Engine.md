---
"@type": schema:TechArticle
schema:name: "Porffor JavaScript Engine"
schema:description: "Discussions on the Porffor JavaScript engine, including its potential use in Deno, its current limitations, and performance characteristics compared to traditional interpreters."
wazoo:source: dcwg
wiki:priority: medium
---

On 2026-10-23, `netop://ウィビ` introduced Porffor (porffor.dev), asking if it would be useful for any Deno efforts (`1563607673587507272`). On 2026-10-24, `CaptainLach` noted there was a `v8x` pull request for it (`1563664980853653595`). `daniellacosse` questioned if Porffor could aid with JIT (`1563696152551886969`). `CaptainLach` stated that Porffor is "very limited," lacks TypeScript transpilation, and is not a functional engine, citing `denoland/v8x#76` as a draft-quality scaffold (`1563698670493372458`, `1563698773706805350`, `1563698880091127901`). He characterized the C code it produces as "suboptimal" and potentially worse for cache than an interpreter due to producing "a lot of code" (`1563699051268939827`, `1563699318731313283`). He suggested that a small, optimized interpreter combined with small, optimized bytecode might perform better than a large amount of less optimized machine code (`1563699850342699021`).
