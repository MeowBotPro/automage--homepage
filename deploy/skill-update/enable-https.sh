#!/usr/bin/env bash
set -euo pipefail
repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
certbot certonly --webroot -w /var/www/automage-acme -d skill-update.automage.cn \
  --cert-name skill-update.automage.cn --non-interactive --agree-tos --register-unsafely-without-email \
  --deploy-hook 'systemctl reload nginx'
cp "$repo_dir/deploy/skill-update/nginx-https.conf" /etc/nginx/sites-available/skill-update.conf
nginx -t
systemctl reload nginx
systemctl enable --now certbot.timer
