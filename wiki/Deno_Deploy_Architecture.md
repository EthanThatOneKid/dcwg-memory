---
"@type": schema:TechArticle
schema:name: "Deno Deploy Architecture"
schema:description: "An analysis of Deno Deploy's architecture, including historical insights, current operating mechanisms, and discussions on resource usage and feasibility of replication."
wazoo:source: dcwg
wiki:priority: medium
---

On 2026-10-19, `CaptainLach` analyzed Deno Deploy's organization. He claimed that "Deploy classic" was a custom daemon running containers in isolates (`1561736479322017863`). He stated that the current, non-classic Deploy operates as microVMs waiting to run code via `DENO_UNSTABLE_CONTROL_SOCK`, mounting the built app and executing normal Deno. He believed this primarily compensates for Deno's cold start and does not appear to save resources (`1561736855358013451`, `1561736990557208727`, `1561738447834587277`). `Pierrot` questioned if this differed from `workerd` and noted that Supabase edge functions use isolates (`1561738320067829913`, `1561739358044688489`). `CaptainLach` observed that the current Deploy architecture, relying on `vsock`'s, seemed to use Firecracker-like microVMs for compatibility (`1561738557608042517`, `1561739367976800489`, `1561739480149401631`). He claimed that implementing a Deno Deploy-compatible service seemed "fairly easy," with the UI being the hardest part (`1561740693792096349`, `1561741039910256781`). `andy` expressed skepticism regarding the undertaking (`1561753893493276683`), but `CaptainLach` maintained his stance (`1561753945519562843`). For better resource usage, `CaptainLach` suggested cloning Deno processes or using kernel same-page merging by reducing randomness during startup (`1561765642582097951`). He asserted that the non-classic deploy did not use isolates, as there were no compatible integration points for that at all (`1561766453403713579`, `1561766558559113258`, `1561766618768347179`, `1561766740529254425`). On 2026-10-20, `daniellacosse` asked `CaptainLach`'s goal for reviving deploy, to which `CaptainLach` replied, "Just for fun, but it is gone too far already" (`1561922012304253011`, `1561922160287682643`).

## Related

- [Self-hosted deploy platform](Self_Hosted_Deploy_Platform.md): `CaptainLach`'s standalone implementation of a Deno Deploy-style platform.
- [Ende](Ende_Runtime.md): the fork that dropped Deno Deploy altogether.
