# I01 findings — market-ceo-scan

Isolation: best_effort. Fresh subagent sessions were launched; both hit provider rate limits before writing verdicts. Evidence is coordinator-reviewed screenshots only, not complete participant decision logs.

## Participants

| Role | Session | Evidence | Verdict |
|---|---|---|---|
| Manufacturing CEO (ops) | subagent ceo-ops | `/tmp/rcut-market-ceo-a/step1–6.png` | incomplete (429) |
| Trade/services CEO | subagent ceo-trade | `/tmp/rcut-market-ceo-b/step1–2.png` | incomplete (429) |

## Observable

- Both landed on `/market` and saw the honesty line, 191 count, domain chips, English-majority rows, and 了解清单.
- Ops CEO typed `采购` into search. Screenshots still show `191 / 191` and CRM English rows. Likely agent-browser `fill` without React `onChange` (test artifact). A native `onInput` listener was added after the run so IME and fill-like input still update the list.
- Neither participant opened a Skill drawer or added 了解清单 items before the session died.
- Console install path was not visible (good).

## Findings (product)

1. **English titles dominate the first screen.** A manufacturing CEO scanning for 采购/缺料 sees CRM English first. This is the strongest usability risk for the stated audience.
2. **Search + 191-row default** makes the page feel like a dump until a domain chip is used. Chips exist but first paint is not CEO-scannable in Chinese.
3. **Homepage and 供应链场景 share `/`.** Not tested this run; still a map vs nav mismatch.

## Not concluded

Whether a CEO would add items to 了解清单, or confuse it with install. Sessions did not reach that milestone.

## Next

Chinese titles for list rows; optional default domain or “从业务域开始” empty-first. Re-run two fresh CEOs after rate limit clears. Do not treat this I01 as convergence.
