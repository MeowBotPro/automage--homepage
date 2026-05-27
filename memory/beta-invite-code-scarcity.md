---
name: beta-invite-code-scarcity
description: Beta application invite codes require separate lifecycle tracking for scarcity and validity checks
metadata:
  type: project
updated_at: 2026-05-27
last_verified_scope: User clarified beta application requirements in chat
---

Beta application invite codes must live in a separate table that tracks activation state, expiration, max usage, and used count. The application form should validate invite code validity during submission, including inactive, expired, and fully used states.

**Why:** The invite code mechanism is intended to create scarcity and prioritize invited users, not just store an optional free-text field on applications.
**How to apply:** When changing the homepage beta form or backend submission flow, model invite codes as first-class records and perform server-side validation before marking an application as invite-backed or high priority.
