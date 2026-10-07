# Participant Packet

participant_session: true

isolation_level: <verified | best_effort | handoff_only>

Role contract: `<role-id>`
Task contract: `<task-id>`
Starting URL: `<entrypoint>`
Credential delivery: out-of-band

Read only this packet and the frozen role/task contracts listed by the exposure manifest.
Use agent-browser from the starting URL. Do not inspect the repository, implementation, oracle, prior runs, APIs, database, selectors, or deep links.
Record the explicit decision fields required by the Skill before and after each meaningful action. Stop at the first terminal condition.
