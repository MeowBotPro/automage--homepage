# Skill upload service

- The live upload service is independent of the homepage: `https://skill-update.automage.cn`, local Nginx → `127.0.0.1:3120`, systemd `skill-update.service`, deployment root `/root/skill-update`.
- DNS is a CNAME to `automage.cn`. Outgoing traffic can use a proxy, so an IP-echo service does not identify this server's public ingress address.
- Web uploads and the root-only `skill-update` CLI share one persistent queue and one worker; do not also enable the older cron worker. Runtime uses the official ali-oss SDK adapter, with tool/schema copies in the deployment directory.
- Current operating instructions: `docs/skill-delivery/deployment-20261010.md`; 20261009 handoff documents are historical. Do not bootstrap or overwrite the existing public index again.
