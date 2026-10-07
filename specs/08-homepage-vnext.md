# Homepage VNext: brand-preserving scenario narrative

## Decision

This change is a narrative and content replacement, not a visual rebrand.

The authoritative visual baseline remains the original AutoMage homepage:

- deep navy surfaces with blue and cyan signal accents;
- product-oriented sans typography with mono labels for system state;
- one continuous technical environment rather than alternating editorial pages;
- custom event paths, nodes, gates, cards and causal motion;
- motion explains state transitions and causality instead of decorating the background.

Warm paper, olive, gold, serif-editorial styling, generic premium B2B cards and decorative global particles are explicitly out of scope.

## Mental model

A first-time visitor should leave with this sequence:

1. A business event arrives.
2. AutoMage gathers evidence and exposes unknowns.
3. Capabilities explore options around the same event.
4. A human reviews and authorizes a bounded proposal.
5. Execution and result evidence remain separate states.
6. Supply chain is one reference implementation of AutoMage Core.

The page must not imply that a proposal is an order, approval is execution, or execution is a verified outcome.

## Six acts

### Act 1: Incident

Use one shortage warning as the entry point. Show source, time, observed values and Demo status immediately.

### Act 2: Hidden coordination

Show why the work is difficult: facts are distributed across WMS, ERP, MES, SRM, finance and human conversations.

### Act 3: Explore

Keep one event in the center. Distinguish observed, derived and inferred information, and expose unknowns.

### Act 4: Human Gate

Let visitors choose a proposal, reject it, revise it, approve a version or let authorization expire. No selection action may imply execution.

### Act 5: Commit and evidence

Model send, wait, acknowledgement, failure, retry and human handoff. State clearly that the adapter is not connected and the result is simulated.

### Act 6: Core transfer

Explain the reusable primitives: persistent events, capabilities called on demand, and evidence-bearing results.

## Copy constraints

- Keep one dominant sentence per viewport.
- Prefer state labels and object fields over explanatory paragraphs.
- Do not use unverified metrics, customer logos, testimonials or production claims.
- Repeat Demo only at decision-relevant boundaries, not in every sentence.
- System-boundary FAQ must explicitly answer what AutoMage is, whether it is supply-chain software, whether it replaces systems of record, and whether the demo is live.

## Acceptance

- Desktop and mobile preserve the navy, blue and cyan identity.
- The hero shows the event and product mechanism without requiring scrolling.
- The causal path animates once and respects reduced motion.
- Explore nodes are interactive.
- Revision, approval, expiry, failure, retry, handoff and acknowledgement are reachable.
- A fresh visitor can distinguish proposal, authorization, execution and receipt.
- The page remains understandable without reading every paragraph.

## Interaction and conversion closeout

- The hero promise is two semantic lines: shortage warning, then executable decision.
- Desktop Compare restores a pinned scroll sequence in which distributed facts physically converge before decision objects appear.
- Desktop Explore restores a controlled pinned six-step loop with a visible exit and reduced-motion completion state.
- Navigation order is Signal, Compress, Explore, Authorize, Execute, Receipt.
- Narrative scroll completion must never be presented as business execution completion.
- No proposal is selected by default. A critical unknown blocks approval until explicitly confirmed in the Demo.
- The event-fit checklist and real beta application form coexist; the checklist must not replace the submission channel.
- Mobile uses compact natural flow instead of a hard scroll trap.

## Interaction continuity and color contract

### Explore origin

- Event is the first node and occupies the upper-right orbit position.
- The rail path and all three moving particles start at the exact Event coordinate.
- Node order, particle direction and inspector progression share one angle model.
- Repositioning the origin must not alter the mobile linear-flow fallback.

### Human Gate to Commit

- Human Gate exposes a visible three-step path: choose Option A/B, confirm the critical fact, approve the current version.
- The active, completed and pending steps remain visually distinct without implying that approval has executed anything.
- When Commit lacks authorization, its dashed neutral control remains actionable. It states the missing action, returns to the exact Human Gate control, moves keyboard focus there and briefly highlights it.
- The return interaction never auto-selects, auto-confirms or auto-approves. Revision and expired-authorization branches return to their own valid recovery action.
- Approval enables a separate execution action; acknowledgement remains a separate receipt state.

### Disclosure continuity

- Bring a Real Event and System Boundary use the same disclosure grammar.
- Container height changes continuously over `--duration-slow`; content fades upward by no more than 12px.
- Multi-card content enters in reading order with a restrained 70ms stagger.
- Buttons expose `aria-expanded` and `aria-controls`; reduced-motion removes interpolation while preserving control and state.

### Homepage color guardrails

- The homepage remains a continuous navy/slate technical environment. Blue communicates active connection, cyan is limited to moving signal/focus highlights, and green only marks completed authorization or verified success.
- Neutral unavailable or return controls use blue-tinted slate and dashed borders, never yellow, gold, olive or warm paper.
- Amber and red remain semantic warning/error colors only. They may not become section backgrounds, primary CTA colors or decorative accents.
- New interaction states must consume existing semantic tokens; hard-coded decorative colors and new accent families are out of scope.

### Acceptance additions

- At desktop Explore entry, Event and all particles visibly share the upper-right start coordinate.
- From an unauthorized Commit state, one activation returns the visitor to the exact required Human Gate action.
- Event-fit and FAQ panels open and close without a layout jump; event-fit cards reveal in order.
- The complete interaction path remains keyboard-operable and understandable with reduced motion enabled.
