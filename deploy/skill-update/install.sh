#!/usr/bin/env bash
set -euo pipefail
repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
service_dir=/root/skill-update
if [[ "$EUID" != 0 ]]; then echo 'Run as root on the target server.' >&2; exit 1; fi
if [[ ! -f "$service_dir/config.json" ]]; then echo 'Create /root/skill-update/config.json with OSS credentials first (mode 0600).' >&2; exit 1; fi
umask 077
if systemctl is-active --quiet skill-update.service; then systemctl stop skill-update.service; fi
mkdir -p "$service_dir"/{app,bin,tools,incoming,data} /var/www/automage-acme
cp "$(command -v node)" "$service_dir/bin/node"
cp "$repo_dir/apps/skill-update/"*.cjs "$repo_dir/apps/skill-update/package"*.json "$service_dir/app/"
cp -r "$repo_dir/apps/skill-update/public" "$service_dir/app/"
cp "$repo_dir/scripts/skills/skillpack.cjs" "$repo_dir/scripts/skills/inbox-worker.cjs" "$repo_dir/docs/skill-delivery/skill.schema.json" "$service_dir/tools/"
chmod +x "$service_dir/app/oss-cli.cjs"
python3 - "$service_dir" "$repo_dir" <<'PY'
import json,pathlib,sys,zipfile,os
home=pathlib.Path(sys.argv[1]);repo=pathlib.Path(sys.argv[2]);p=home/'config.json';c=json.loads(p.read_text());c['toolRoot']=str(home/'tools');p.write_text(json.dumps(c,indent=2)+'\n');os.chmod(p,0o600)
out=home/'app/public/delivery';out.mkdir(exist_ok=True)
for src in [repo/'docs/skill-delivery/README.md',repo/'docs/skill-delivery/skill.schema.json',repo/'scripts/skills/skillpack.cjs']:
 (out/src.name).write_bytes(src.read_bytes())
root=repo/'docs/skill-delivery/template'
with zipfile.ZipFile(out/'template.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in root.rglob('*'):
  if f.is_file():z.write(f,f.relative_to(root))
PY
(cd "$service_dir/app" && npm ci --ignore-scripts --no-audit --no-fund)
cat > /usr/local/bin/skill-update <<'CLI'
#!/usr/bin/env bash
export SKILL_UPDATE_HOME=/root/skill-update
exec /root/skill-update/bin/node /root/skill-update/app/cli.cjs "$@"
CLI
chmod 0755 /usr/local/bin/skill-update
if [[ ! -f "$service_dir/passwords.json" ]]; then
  skill-update init > "$service_dir/initial-passwords.txt"
  echo 'Initial upload passwords saved to /root/skill-update/initial-passwords.txt (0600).'
fi
cp "$repo_dir/deploy/skill-update/skill-update.service" /etc/systemd/system/skill-update.service
if [[ -f /etc/letsencrypt/live/skill-update.automage.cn/fullchain.pem ]]; then
  cp "$repo_dir/deploy/skill-update/nginx-https.conf" /etc/nginx/sites-available/skill-update.conf
else
  cp "$repo_dir/deploy/skill-update/nginx-http.conf" /etc/nginx/sites-available/skill-update.conf
fi
ln -sfn /etc/nginx/sites-available/skill-update.conf /etc/nginx/sites-enabled/skill-update.conf
nginx -t
systemctl daemon-reload
systemctl enable skill-update.service
systemctl restart skill-update.service
systemctl reload nginx
