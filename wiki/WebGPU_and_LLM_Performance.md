---
"@type": schema:TechArticle
schema:name: "WebGPU and LLM Performance"
schema:description: "Claims and discussions about using WebGPU compute shaders for iOS performance and running LLMs, including challenges and architectural suggestions."
wazoo:source: dcwg
wiki:priority: medium
---

On 2026-10-18, `daniellacosse` proposed that WebGPU compute shaders could unlock iOS performance, stating his intention to build a prototype (`1561461001814286408`). He aimed to confirm Metal support via `MTLCreateSystemDefaultDevice()` (`1561462112444747886`) and believed `gfx-rs/wgpu` supported it (`1561463272119738408`). On 2026-10-23, `daniellacosse` further suggested an isolate could run LLMs over WebGPU, addressing the challenge of containerizing agents that require GPU access (`1563328671090081905`). By 2026-10-24, `daniellacosse` had begun sketching a WebGPU model runner (`1563701549472022619`), acknowledging its ambition but expressing frustration at needing to run inference openly while other components are containerized (`1563710004098502809`). `CaptainLach`, on 2026-10-24, suggested moving inference to a different process for isolation due to LLMs lacking good WebGPU kernels, though he noted that WebGPU is suitable for ONNX (`1563701917828382774`, `1563702188243558401`, `1563702271789891697`, `1563702358909788345`).
