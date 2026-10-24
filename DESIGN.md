# Wall planner

Accepted 2026-10-24 for marketing and the complete operator dashboard.
Marketing mode: Persuade. Dashboard mode: Operate. Guides mode: Read.

## Visual authority

- Marketing Workshop revision `4f92a91c-db40-438b-9ece-37026ade63e7`.
- Dashboard Workshop revision `98a41e00-e71d-4cfe-8030-12445392ad4e`.
- Existing React architecture and real domain behavior remain authoritative.

Time organizes the interface: a printed week planner, teal on paper, pale rail,
clear rules, boxed operational panels and stage stickers with written labels.
Marketing uses the same vocabulary with a split hero and illustrative service
record, a five-stage chart and a full teal closing band.

## Foundation

| Role | Light | Dark |
| --- | --- | --- |
| Paper | #ffffff | #121a19 |
| Ground | #f4f8f7 | #0c1312 |
| Rail | #edf3f1 | #0f1716 |
| Ink | #0f1f1c | #e6efed |
| Secondary ink | #435652 | #a8b9b5 |
| Muted ink | #5f716d | #8b9e99 |
| Rule | #dae5e2 | #22302d |
| Teal | #007d7a | #33b5af |
| Teal text | #006966 | #6dd3cd |

Cal Sans is reserved for page/display titles and date numerals. System sans
carries controls, tables, prose and forms; Inter carries the wordmark. Cal Sans
and Inter are self-hosted.
Shared current BrandLogo/BrandMark remain the brand source of truth.
Panels use 14px corners, small controls 10px; pills are for compact states.
Prefer borders for operational panels and soft offset shadows for floating UI.

Due uses warm red, upcoming amber, waiting blue, replied green and closed muted
ink. Every status includes text; shape/dot changes supplement color. Preserve
the difference between board stages and persisted status names.

## Responsive and interaction rules

Navigation has discoverable labels, an explicit desktop collapse affordance and
a mobile drawer. Keep creation/actions reachable at 320px. Tables retain their
real columns and confine horizontal scrolling to a labelled region with a cue.
Phone boards show one stage at a time behind labelled stage controls.

Record create/edit/details and ongoing follow-up work use URL-backed sheets.
Confirmations and brief interruptions use dialogs. Sheets fill available mobile
width, respect safe areas, preserve focus/Escape and keep long content scrollable.
Use current shadcn wrappers; never fork their primitive implementations.

Keep reduced motion, visible keyboard focus, legible secondary text, real loading,
error, empty and pending states. No Workshop controls, mock server data, invented
metrics, autoplay dependency or false product claims in the application.
