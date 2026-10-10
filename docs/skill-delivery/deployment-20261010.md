# Skill 交付完整闭环 · 2026-10-10

本机上传服务与 OSS 自动发布已接通。正式入口：<https://skill-update.automage.cn>。

## 从交付到官网

```text
网页：输入上传密码，选择或拖入一个/多个 ZIP
或本机：SFTP 传完 ZIP，用 CLI 批量提交
    ↓
完整接收，原子落盘，分配唯一任务编号
    ↓
持久化任务队列 → 私有 OSS inbox/ → 唤醒串行 worker
    ↓
skillpack 检查结构、文案、版本、视频、封面与 ZIP 安全
    ├─ 不合格 → rejected/ + 报告，页面列出修改原因
    ├─ 处理失败 → failed/ + 报告，支持原任务重试
    └─ 合格 → 私有原包存档 → 公开视频/封面
               → 备份旧索引 → 最后更新公开 index.json
    ↓
页面显示“已发布”并提供官网详情链接
    ↓
官网按现有缓存机制刷新，通常再需约 1–2 分钟
```

上传进度完成只表示服务器完整接收文件。只有“已发布”表示 OSS 索引更新成功。处理立即触发，另有每分钟补扫；耗时受包大小、队列和网络影响，不承诺上传后固定分钟数内完成。关闭页面不会取消后台任务；重新验证原上传密码即可查看该密码项的记录，管理员可查看全部。

交付结构、媒体要求、版本规则和内容隐私要求沿用 [README](README.md)。单页已摘要展示这些要求，并提供规范、模板、检查工具和 schema 下载；更新文档后执行安装脚本同步页面下载资源。

## 实际部署

| 项目 | 配置 |
|---|---|
| 公网入口 | `https://skill-update.automage.cn` |
| DNS | `skill-update` CNAME → `automage.cn`，沿用官网本机地址 |
| 反向代理 | 本机 Nginx，HTTP 跳转 HTTPS |
| 后端 | `127.0.0.1:3120`，独立 Node 22 服务 |
| 运行目录 | `/root/skill-update` |
| 常驻服务 | `skill-update.service`，开机启动，异常退出自动重启 |
| 本机控制入口 | `/root/skill-update/control.sock`，权限 0600 |
| OSS 地域 | `cn-hangzhou` |
| 私有目标 | `oss://automage-skills-private` |
| 公开目标 | `oss://automage/skills/` |
| 公开索引 | `https://skills.automage.cn/skills/index.json` |
| 凭证 | `/root/skill-update/config.json`，权限 0600，仅服务端读取 |
| 密码哈希 | `/root/skill-update/passwords.json`，权限 0600 |
| HTTPS | Let's Encrypt，`certbot.timer` 自动续期，续期后 reload Nginx |

OSS 使用官方 `ali-oss` SDK，适配现有 worker 使用的 `ls/cp/rm` 子集。运行目录内带有工具和 schema，不依赖运行时访问官网源码，也不需要另装 ossutil。发布只在这台机器执行，不额外启用 cron worker。

生产官网容器已经设置：

```dotenv
SKILL_INDEX_URL=https://skills.automage.cn/skills/index.json
SKILL_ASSET_BASE=https://skills.automage.cn/skills/
```

首批 191 个 skill 和既有资源继续沿用，本次未重新导出或覆盖首批内容。

## 提交、密码与结果

网页的“密码管理”使用约定的管理员密码验证。上传密码为命名列表，初始化生成 5 项随机密码。支持新增、停用、删除、单项重置和整表重置；新密码只在生成结果中返回。初始化分发文件位于本机 `/root/skill-update/initial-passwords.txt`（0600），分发后删除。文档和仓库不保存密码明文或 OSS 密钥。

重置、停用或删除会立即撤销该密码项的上传会话，已经接收的任务继续。上传会话最长 8 小时，服务重启后重新验证。每 IP 每 15 分钟最多 10 次登录尝试。

SFTP 传完后，使用本机 CLI：

```sh
skill-update submit --dir /root/skill-update/incoming
skill-update submit ./a.zip ./b.zip
skill-update status
skill-update status <任务编号>
skill-update retry <任务编号>

skill-update passwords list
skill-update passwords add '内容团队'
skill-update passwords reset <密码项ID>
skill-update passwords disable <密码项ID>
skill-update passwords delete <密码项ID>
skill-update passwords reset-all
```

CLI 通过受限本机 socket 授权，与网页共用队列，不启动第二份 worker。目录模式扫描当前层级所有普通 ZIP，不递归、不跟随链接、不监听正在传输的文件。

## 可靠性与运维

- 上传流式落盘，单包最多 300 MiB，最多 3 个并发接收，待处理最多 50 项；磁盘不足时拒绝接收。
- ZIP 检查包括目录边界、实际解压输出上限、危险路径、重复路径和链接文件；不运行包内代码。内容作者仍需核对录屏隐私。
- 上传到 OSS 的对象用唯一任务编号命名，同名文件不会互相覆盖；已知网页和 CLI 任务按提交时间串行处理，避免 UUID 排序改变发布顺序。校验使用原始文件名，避免产生无关提醒。
- 发布、失败、拒绝逐包回写任务结果；每份 OSS 报告和索引历史都有唯一名称。
- 重启恢复遗留任务。发布确认中断时，线上版本和私有存档 SHA-256 都匹配才认定已完成；存档不同或普通重复版本拒绝。下架不允许覆盖原版本存档。
- 单个 OSS 子命令超时 120 秒，worker 总运行上限 30 分钟；超时任务保留，可重试。
- 已发布原包在 OSS 存档后从本机删除；失败或拒绝原包在本机保留 7 天，任务元数据和 OSS 报告保留。

```sh
systemctl status skill-update
journalctl -u skill-update --since today
curl -fsS https://skill-update.automage.cn/healthz
```

部署或更新：`bash deploy/skill-update/install.sh`。首次 DNS 就绪后启用 HTTPS：`bash deploy/skill-update/enable-https.sh`。源码与接口说明见 [上传服务 README](../../apps/skill-update/README.md)。更新会重启服务，进行中的任务依靠持久化记录恢复。

## 验证结果

- 25 项自动化检查通过：交付工具、索引、worker、认证与限速、任务隔离、密码撤销、ZIP 安全、存档不可覆盖和中断恢复。
- 隔离 OSS 前缀验证：两个合法包发布，重复版本和损坏 ZIP 拒绝；发布确认中断后恢复成功；素材一年 immutable 缓存、索引 60 秒缓存；正式索引保持不变，隔离对象已清理。
- Chromium 验证桌面与手机布局、密码登录、上传与刷新后查询、管理员新增密码、关闭窗口清除新密码明文；无页面脚本错误或手机横向溢出。
- 公网 DNS、HTTPS 健康检查、本机 Nginx 配置及 systemd 常驻服务已验证；真实域名上的上传密码与管理员登录、安全 Cookie、规范/模板/工具下载通过。
- 本机 CLI 验证目录批量和多 ZIP 参数提交，自动跳过非 ZIP 和符号链接，同名文件生成不同任务且进入同一队列。

### 证书验证的实际边界

正式证书已签发并用于公网 HTTPS，有效期至 2027-01-08；自动续期定时任务和 Nginx reload hook 已配置。首次正式签发通过 HTTP-01 验证。

模拟续期尚未通过：跳过 Certbot 默认随机等待后，Let's Encrypt staging 返回 `unauthorized`，报告从本机公网地址读取 HTTP-01 challenge 时得到 403。本机和公网直连读取人工探针均为 200；将 challenge 改为 HTTPS 跳转也未解决，已恢复正式签发时的 HTTP 配置。当前证据不能确定外部 403 的来源，不将其归因为 DNS 或 Nginx 文件权限问题。

运维需复验此项；命令如下。这里关闭随机等待仅用于手动验证，自动定时续期保留默认调度。

```sh
certbot renew --cert-name skill-update.automage.cn --dry-run --no-random-sleep-on-renew
```

若仍失败，保留 `/var/log/letsencrypt/letsencrypt.log` 与 Nginx 日志，核对 CA 到服务器的外部访问链路；当前证书和上传服务继续正常提供 HTTPS。
