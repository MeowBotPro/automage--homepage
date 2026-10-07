# Market + Console meeting prototype

## Outcome

Create a desktop-first, front-end-only meeting prototype that makes two future AutoMage surfaces discussable:

1. `/market`: discover and combine official enterprise capabilities;
2. `/console`: receive the same plan and show the future cloud Console structure.

This is a visual and interaction prototype. It does not claim working authentication, persistence, organization management, integration, or deployment.

## Existing design system applied

- Preserve the existing AutoMage wordmark and navy/slate environment.
- Navy represents organizational authority; blue represents active selection and connection; cyan is limited to transient focus and flow; green appears only after an explicit local demo confirmation.
- Use Inter for product copy and JetBrains Mono for state labels, matching the current repository.
- Copy is Chinese-first, declarative, precise, and free of promotional superlatives.
- Motion explains selection, addition/removal, and handoff. No decorative global particles or perpetual animation.

## Presentation assumptions

- Presenter: AutoMage project owner.
- Audience: internal leadership, product, design, and engineering stakeholders.
- Viewing distance: desktop screen-share or meeting-room projection.
- Visual temperature: calm, authoritative, precise.
- Capacity: Market may scroll; Console should communicate its primary structure within the first viewport.

## Market contract

- Present six official business capabilities, grouped by business category.
- Each capability states its outcome, required inputs, produced output, and human gate.
- Agent and Skill composition is available in the detail dialog, not on the first reading layer.
- A persistent `我的 AutoMage 方案` panel is the primary object.
- Required interactions: category filter, detail dialog, add/remove, reset, continue to Console.

## Console contract

- Open with the Market plan already imported.
- Show a recognizable future IA: 总览 / 我的 AutoMage / 环境 / 集成 / 治理 / 企业设置.
- Only `我的 AutoMage` needs configuration depth; other destinations are clickable structural previews.
- Required interactions: navigate Console sections, switch setup step, change demo scope/environment/authority choices, generate a visibly simulated deployment draft, return to Market without losing the plan.

## Client-only state

- Store selected capability IDs in `localStorage` under a versioned prototype key.
- Provide an explicit reset action.
- Use deterministic example values and persistent `PROTOTYPE / DEMO` labels.
- Do not call network APIs.

## Acceptance

- A user can add a capability in Market and see it in Console without re-entry.
- A user can open a capability detail and inspect Agent/Skill composition.
- A user can navigate the simple Console IA and generate a demo-only deployment draft.
- Existing `/` homepage behavior remains available and its scenario-specific navigation does not appear on the two new routes.
- Console and Market remain usable at 1440×900 and at a compact desktop width.

## Out of scope

- Homepage and supply-chain content changes.
- Real authentication, backend, database, permissions, billing, integration, deployment, local Runtime, or IM behavior.
- Third-party marketplace, pricing, reviews, or free-form Agent canvas.
- Production-quality mobile experience.
