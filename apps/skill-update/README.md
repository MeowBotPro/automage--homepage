# Skill 上传服务

独立 Node 22 服务和静态单页，通过本机 Nginx 提供 `https://skill-update.automage.cn`。源码不依赖官网构建。上传者共享密码项，提交记录按密码项隔离，管理员查看全部。

## 部署

1. 在 `/root/skill-update/config.json` 写入 `region`、`accessKeyId`、`accessKeySecret` 和首次初始化用的 `adminPassword`，权限设为 0600。地域为 `cn-hangzhou`，管理员密码由运维配置。已有密码列表时不重新初始化。
2. 执行 `bash deploy/skill-update/install.sh`。脚本复制运行时、工具、schema、品牌资源与文档，并安装锁定依赖、systemd 服务、Nginx 站点。首次生成的 5 个上传密码保存到 `/root/skill-update/initial-passwords.txt`（0600），分发后删除；管理员密码会转为哈希，移除配置中的明文。
3. 域名账号配置 `skill-update` A 记录指向本机公网 IP。
4. DNS 生效后执行 `bash deploy/skill-update/enable-https.sh`，签发证书、启用 HTTPS 和自动续期。HTTP 启动阶段仅用于验证页面及 ACME；生产上传认证要求 HTTPS。

默认监听 `127.0.0.1:3120`。服务用户为 root，运行目录限定在 `/root/skill-update`，不向公网暴露本地控制 socket。OSS 使用官方 `ali-oss` SDK；`oss-cli.cjs` 仅适配原 worker 使用的 `ls/cp/rm` 子集，不需要另装 ossutil。存储目标可在配置中覆盖为隔离测试前缀。

```sh
systemctl status skill-update
journalctl -u skill-update --since today
skill-update passwords list
skill-update passwords add '内容团队'
skill-update passwords reset <密码项ID>
skill-update passwords disable <密码项ID>
skill-update passwords delete <密码项ID>
skill-update passwords reset-all
```

随机新密码只在生成操作的结果中返回，列表不返回哈希或明文。网页在“密码管理”输入管理员密码后提供相同能力。重置、停用或删除立即撤销对应上传会话；已接收任务继续。会话最长 8 小时，服务重启后重新登录。每 IP 每 15 分钟最多 10 次登录尝试。

## 网页与批量上传

网页输入上传密码、验证，然后选择或拖入多个 ZIP。每包独立请求，失败不影响其他文件。一次最多 3 个并发接收，待处理队列最多 50 项；单包 300 MiB。磁盘空间不足时拒绝接收。

SFTP 上传完整文件到 `/root/skill-update/incoming` 后：

```sh
skill-update submit --dir /root/skill-update/incoming
skill-update submit ./a.zip ./b.zip
skill-update status
skill-update status <任务编号>
skill-update retry <失败任务编号>
```

目录模式只处理当前层级的普通 ZIP 文件，不递归、不跟随符号链接、不监听尚在传输的文件。CLI 通过权限 0600 的 Unix socket 与同一后台通信，不启动第二个 worker。校验拒绝需修改包重新提交，基础设施失败可重试。

## 处理与恢复

完整接收后原子入队，原包暂存到 `data/jobs/<UUID>/package.zip`，任务记录为 `job.json`。按唯一 UUID 上传到私有 OSS inbox，worker 按网页/CLI 提交时间串行检查、存档、上传视频封面、备份索引、最后更新公开索引，并写唯一报告。文件名规范仍按用户原文件名展示；OSS 内部 UUID 命名不影响包的 id 和 version。

启动和每分钟扫描遗留任务及 OSS inbox。处理中断后重新提交该任务到 inbox，只有线上版本和私有存档 SHA-256 都匹配才认定前次已完成。普通重复提交仍拒绝。worker 总运行上限 30 分钟，单个 OSS 命令上限 120 秒，超时保留失败任务供人工重试。任务结果回写本地，不依赖解析 stdout 或退出码推断逐包成功。

上传完成表示已接收；`published` 表示 OSS 索引更新完成，官网通常再需 1–2 分钟刷新。发布成功后删除本机暂存原包；失败/拒绝原包保留 7 天，之后由扫描清理，OSS 存档和报告按原有规则保留。元数据任务记录保留，页面返回最新 100 条。

官网须设置 `SKILL_INDEX_URL=https://skills.automage.cn/skills/index.json` 和 `SKILL_ASSET_BASE=https://skills.automage.cn/skills/`。变更前检查现有配置，无需重复导出首批索引。

## API

- `POST /api/login`：`{password, admin?: boolean}`，设置安全会话 Cookie。
- `POST /api/uploads`：ZIP 原始请求体，`X-File-Name` 为 URI 编码文件名，返回 202 与任务编号。
- `GET /api/jobs`、`GET /api/jobs/:id`：当前密码项的任务，管理员可查看全部。
- `POST /api/jobs/:id/retry`：重试基础设施失败任务。
- `GET/POST /api/admin/passwords`：管理员列表及 `{action,id?,name?}` 管理操作。
- `POST /api/logout`、`GET /api/session`、`GET /healthz`。

写接口核验 Origin；不启用跨域。密码、密钥不在前端打包，上传包内代码不会执行。校验覆盖 ZIP 边界、实际解压上限、危险路径、重复路径、链接文件及现有交付规范；内容作者仍需自行确认录屏隐私和文案真实性。

## 验证

在仓库根目录执行：

```sh
node --test apps/skill-update/test/*.test.cjs tests/skill-kit.test.cjs tests/skill-inbox.test.cjs tests/skill-index.test.cjs
```

正式部署前，用隔离 OSS 前缀和独立运行目录完成发布、重复版本拒绝、批量、失败重试与中断恢复验证，不向正式官网添加探针条目。
