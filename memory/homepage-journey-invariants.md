> **Status: SUPERSEDED (2026-10-07).** 本页记录的六节点循环叙事顺序与 motion 约束已被新方向取代；执行依据见 `docs/automage-website-implementation-handoff-20261007.md`。以下内容仅作历史保留。
# Homepage Journey Invariants

- The homepage explains AutoMage through one concrete supply-chain shortage event, not a generic automation capability list.
- The narrative order is Hero, Compare, InfoLoop, Human Gate, Commit and Receipt, Core Value, Event Fit, standalone Beta, then FAQ.
- Compare preserves the original motion balance: 3 fragments compress into the core while 5 remain visible at 0.58-0.86 opacity before decision cards enter.
- InfoLoop pins the whole section on desktop so its heading remains visible while a particle moves continuously around the six-node orbit. Below 1024px it must remove the pin and render as a normal linear timeline.
- Header section state is derived from each section's live viewport geometry at the viewport midpoint. Do not create independent header ScrollTriggers whose cached positions can race with the pinned InfoLoop.
- Event Fit is a short, collapsible qualification section. Beta is a separate sibling section, and conversion CTAs target `#section-beta` directly.
- Beta use-case choices should describe concrete business events such as shortages, cross-system exceptions, approvals, and receipts rather than generic automation categories.
- The first FAQ item opens by default so system-boundary answers are discoverable without an exploratory click.
