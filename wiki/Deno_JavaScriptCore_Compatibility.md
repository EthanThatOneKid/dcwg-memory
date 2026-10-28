---
"@type": schema:TechArticle
schema:name: "Deno JavaScriptCore Compatibility"
schema:description: "CaptainLach reported that Deno works perfectly fine with JavaScriptCore, based on manual checks."
wazoo:source: dcwg
wiki:priority: medium
---

On 2026-10-18, `CaptainLach` stated that Deno works "perfectly fine" with JavaScriptCore, based on his manual checks (`1561460221271085138`). He noted that he had not found a built-in switch to use it but confirmed its functionality manually.

Regarding JIT (Just-In-Time) compilation on iOS, `w` asked if JavaScriptCore offered a path to JIT (`1561460779834810469`). `CaptainLach` (`1561460815570411531`) and `daniellacosse` (`1561460827327037541`) both responded negatively. `CaptainLach` clarified that while the frontend of Deno mobile might be JIT accelerated, the backend would not be (`1561461066485989479`).
