# Skill 交付与自动发布指南

> 本文是 Skill 交付与发布的唯一维护指南，供制作者、运维和 agent 使用。制作者与交付 agent 阅读第 1–6 节；分类见附录 A，官网接入见附录 B，部署、密码与故障处理见附录 C，接口与验证见附录 D。
>
> 2026-10-10：上传服务与自动发布闭环已部署 · 清单格式 `automage.skill/1` · 索引格式 `automage.skill-index/1`

## 一页看懂

```
做好 skill ──► 照模板填 skill.json，录演示视频，截封面
           ──► 自查：node skillpack.cjs check 包.zip（不合格会逐条说明哪里要改）
           ──► 网页输入上传密码，拖入 ZIP（也可直接上传到 OSS inbox/）
           ──► 自动处理：上传完成立即触发，每分钟补扫；合格发布，不合格写明原因
           ──► 页面确认已发布，官网能力库通常再需约 1–2 分钟刷新（不用发版）
```

正式入口：<https://skill-update.automage.cn>。只有一个发布通道，没有人工审批：上传密码确认提交权限，文件检查决定能否发布。密码不替代内容检查，提交人仍需核对录屏内容。

按顺序完成：准备完整交付包 → 自查合格 → 提交 → 保存任务编号 → 确认发布结果。人和 agent 都以逐包结果为准；不能把文件已上传或 CLI 退出成功当作发布完成。

本文与 [`skill.schema.json`](skill.schema.json)、[`template/churn-autopsy/`](template/churn-autopsy/) 一起维护。schema 定义字段约束，模板展示包结构；具体校验行为由 `scripts/skills/skillpack.cjs` 和现有测试实现。

**公开的只有三样**：skill.json 里 `listing` 的文字、演示视频、封面。skill 本体（SKILL.md、脚本、参考资料）只进内部存档，官网不提供下载。

能上官网的是需要对外展示的 skill，不是每个做出来的 skill 都要交。

## 1. 压缩包长什么样

```
churn-autopsy-1.0.0.zip            ← 文件名：<id>-<version>.zip
└── churn-autopsy/                 ← 一个文件夹，名字就是 id
    ├── skill.json                 ← 交付清单（第 2 节）
    ├── skill/                     ← skill 本体，原样放：只存档，不公开
    │   ├── SKILL.md               ← 必须有，开头用 --- 写 name: 和 description:
    │   ├── references/ …
    │   └── scripts/ …
    └── media/
        ├── demo.mp4               ← 演示视频，必须有（第 3 节）
        └── poster.jpg             ← 封面，必须有（也可以是 .png / .webp）
```

- 直接压缩整个文件夹就行。Mac 自带的“压缩”会带上 `__MACOSX`、`.DS_Store`，检查时会自动忽略。
- 最外层只放 `skill.json`、`skill/`、`media/`，另外可以带 `README.md`、`CHANGELOG.md`。
- 不要放 `.env`、密钥（`.pem` / `.key`）、`.git`、`node_modules`、虚拟环境；文件名用英文。
- 大小：单个 ZIP 上传不超过 300 MiB，解压总量不超过 300 MiB，`skill/` 不超过 100 MiB，视频不超过 100 MiB（建议 50 MiB 以内）。1 MiB = 1024 × 1024 字节。

**模板**：[`template/churn-autopsy/`](template/churn-autopsy/)。它就是线上 `/market/churn-autopsy` 这一页的清单，可以打开那一页，对照着看每个字段出现在哪。照着做时：

1. 复制整个文件夹，改成你的 id；
2. 改写 skill.json；
3. 用你的 skill 本体替换 `skill/`；
4. 把 `demo.mp4` 和 `poster.jpg` 放进 `media/`。

模板里 `skill` 一节留了 3 处 `<…>` 占位，原样检查会报出来，是正常的。

## 2. skill.json 怎么填

完整格式在 [`skill.schema.json`](skill.schema.json)。编辑器可将 `skill.json` 关联到该 schema，或在本地写上指向它的 `$schema` 地址。schema 是自查工具的配套文件，不要额外塞进交付包。

| 字段 | 要求 | 出现在官网哪里 |
|---|---|---|
| `format` | 固定 `automage.skill/1` | — |
| `id` | 小写字母、数字、连字符，3–48 字符；上架后不再改 | 地址 `/market/<id>`，详情页底部“Skill 标识” |
| `version` | `主.次.补`，如 `1.0.0`；发布过的版本不能覆盖 | — |
| `changes` | 这一版改了什么；首次写“首次上架” | 发布报告 |
| `listing.title` | 2–16 字，说它做成什么事 | 列表卡片、详情页大标题、浏览器标题 |
| `listing.summary` | 8–48 字，一句话：拿什么、做成什么 | 列表卡片、同类比较 |
| `listing.domain` | 10 个原分类之一：销售、CRM、客服、外贸、电商、法律、财税、图文、视频、交付 | 详情页标题上方；按分类筛选 |
| `listing.groups` | 1–3 个，第一个是主要那类；只能从附录的 32 类里选 | 放在能力库哪类工作下；详情页的面包屑和“和同类能力怎么选” |
| `listing.inputs` | 1–4 条，每条 2–20 字的短词 | 搜索 |
| `listing.output` | 2–16 字，交付物的名字 | 卡片“产出 · …”、“你会拿到”卡片标题、视频说明 |
| `listing.keywords` | 可选，最多 10 个，标题和一句话里没有的搜索词 | 搜索 |
| `listing.subSkills` | 可选，技能包里的子技能数 | “技能包 · N 个子技能” |
| `listing.story.scenario` | 6–32 字，一个具体处境 | 详情页“什么时候用” |
| `listing.story.description` | 20–80 字，它做什么、交付什么 | 详情页标题下的说明 |
| `listing.story.audience` | 2–32 字 | 详情页“适合” |
| `listing.story.inputs` | 1–4 句，每句 4–32 字 | 详情页“你提供” |
| `listing.story.outcomes` | 2–4 条，每条 4–32 字 | 详情页“你会拿到”卡片里的条目 |
| `listing.story.steps` | 2–4 步，每步标题 2–8 字、说明 6–40 字 | 详情页“从资料到交付”；视频加载不出来时，印在占位卡片上 |
| `listing.story.requirements` | 6–64 字 | 详情页“接入条件” |
| `listing.story.boundary` | 6–64 字，适合什么，不适合时选哪个 | 详情页“范围与边界” |
| `media.video` / `media.poster` | 固定 `media/demo.mp4`；`media/poster.jpg`（或 .png / .webp） | 详情页“演示视频” |
| `skill.entry` | 固定 `skill/SKILL.md` | 不公开 |
| `skill.source` | `first_party` 自己做的，`third_party` 收录的 | 不公开 |
| `skill.upstream` / `skill.license` | 第三方 skill 必填：来源地址（https）和许可证 | 不公开，存档备查 |
| `skill.maintainer` | 内部负责人 | 不公开 |

**文案要求**：

- **写给不懂技术的老板看。** 说它做成什么事、交付什么，不写实现细节、模型名和工具名。
- **按稳定服务来写。** 不写“内测、测试版、开发中、即将上线、已经能用”这类话，检查会拦下来。
- **不编数字，不写真实的客户名和公司名。** 举例用虚构名称，比如 Northwind。
- **不留占位。** `<…>`、TODO、待补充都会被拦下。
- **语气对齐线上已有的条目。** 模板就是一个好例子。

## 3. 视频和封面

官网是公开的，视频里的每一帧都会被人看到。

| | 要求 |
|---|---|
| 格式 | MP4：H.264 视频，加 AAC 声音或无声，要能边下边播（faststart） |
| 画面 | 16:9，1920×1080 或 1280×720 |
| 长度 | 1–3 分钟最好，不超过 5 分钟 |
| 大小 | 不超过 100 MiB，建议 50 MiB 以内 |
| 封面 | JPG / PNG / WebP，最多 1 MiB，建议 400 KiB 以内、16:9、1280 像素宽以上；选交付物出来的那一帧 |

**录制要求**：发布前没有人工审核，以下内容由提交人自行把关。

1. **用专门的演示账号和干净的目录录。** 画面里不能出现个人用户名、本机路径、真实客户和公司名、内部文件名。
2. **只录工作窗口，不录整个桌面。** 访达、程序坞、通知和其他文件都会入镜。
3. **不要出现报错、警告和调试信息**，比如 “HTTP 400”“Deprecated”。先把环境跑顺再录。
4. **不要出现其他产品的品牌、模型名和权限模式标签**，比如 YOLO。
5. **用虚构的示例资料。** 节奏太快的地方可以剪掉等待，也可以加一句字幕说明在做什么。
6. **结尾在交付物上停几秒。** 封面就从这里截。

**常用 ffmpeg 命令**：

```sh
# 已经是 H.264 的 MP4，只是不能边下边播：无损重新封装，顺便去掉元数据
ffmpeg -i 原视频.mp4 -map 0 -c copy -map_metadata -1 -movflags +faststart demo.mp4

# .mov、HEVC、分辨率或体积太大：转成网页用的 MP4（长度超过 5 分钟请先剪短）
ffmpeg -i 原视频.mov -map 0:v:0 -map '0:a:0?' -vf "scale='min(1920,iw)':-2,fps=30" \
  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -c:a aac -b:a 96k \
  -map_metadata -1 -movflags +faststart demo.mp4

# 截封面：取交付物出来的那一刻（这里是 2 分 30 秒）
ffmpeg -ss 00:02:30 -i demo.mp4 -frames:v 1 -q:v 3 poster.jpg
```

## 4. 交付前自查

工具是 `scripts/skills/skillpack.cjs`，规则是本目录的 `skill.schema.json`。把工具与 schema 放在同一个目录，使用 Node 18+ 即可单独检查；上传服务使用 Node 22。

可从上传页下载 [检查工具](https://skill-update.automage.cn/delivery/skillpack.cjs)、[schema](https://skill-update.automage.cn/delivery/skill.schema.json) 和 [模板 ZIP](https://skill-update.automage.cn/delivery/template.zip)。

```sh
node skillpack.cjs check churn-autopsy-1.0.0.zip   # 也可以检查打包前的文件夹
```

```
检查 churn-autopsy-1.0.0.zip
  ✗ listing.summary 太长：52 个字，最多 48
  ✗ media/demo.mp4 不能边下边播（moov 在文件末尾）（用 ffmpeg 转一次，命令见 README“视频和封面”）
  ! media/poster.jpg 有 620 KB，建议 400 KB 以内
  已忽略 3 个系统生成的文件（__MACOSX、.DS_Store 等）
结果：不合格（2 处要改，1 条提醒）
```

**怎么读结果**：

- `✗` 必须改，否则上不了架。
- `!` 是提醒，可以上，但最好改。
- 合格时最后一行是 `结果：合格 — <id> <版本>，视频 时长 分辨率 大小`，命令的退出码是 0。

检查内容：

- 包的结构和文件；
- skill.json 每个字段；
- 占位和开发阶段用语；
- SKILL.md 开头的 name 和 description；
- 视频能不能在网页里边下边播（编码、封装、大小、分辨率、长度）；
- 封面的格式、大小和比例。

**视频里录到了什么，工具看不出来**。发布前没有人再看，第 3 节的录制要求要自己对照一遍。

单独看视频：`node skillpack.cjs inspect 视频.mp4`。

## 5. 提交与确认结果

### 网页提交

打开 <https://skill-update.automage.cn>，输入团队上传密码并验证，再拖入或选择一个或多个 ZIP。每个包独立处理，一个失败不影响其他包。

上传后保存任务编号，在页面查看逐包记录。关闭页面不影响后台处理；重新验证同一个上传密码可继续查看该密码项的记录。密码重置、停用或删除后原会话失效，原记录可由管理员查询。上传密码由管理员分发与管理，操作见附录 C。

### 本机 CLI 批量提交

先通过 SFTP 把完整 ZIP 传到本机目录，再执行：

```sh
skill-update submit --dir /root/skill-update/incoming
skill-update submit ./a.zip ./b.zip
skill-update status <任务编号>
skill-update status
```

目录模式处理当前层级的普通 ZIP，不递归、不跟随链接，也不监听正在传输的文件。CLI 通过本机受限 socket 授权，与网页共用同一发布队列。`submit` 成功表示文件已接收，需要继续用 `status` 确认逐包结果；部分文件提交失败时 CLI 返回非零退出码，已经接收的包仍会处理。

### 多久能确认成功

上传完成后立即触发后台处理，另有每分钟补扫。耗时取决于文件大小、排队与网络，不承诺固定处理时长。

| 状态 | 含义与下一步 |
|---|---|
| 正在接收 / 排队 / 同步 / 处理中 | 尚未确认发布，保留任务编号继续查询 |
| 已发布（`published`） | OSS 索引已更新，可以确认发布成功；官网通常再需约 1–2 分钟刷新，页面提供 `/market/<id>` 链接 |
| 校验拒绝（`rejected`） | 按错误原因修改后重新提交；重复或较旧版本也会拒绝 |
| 处理失败（`failed`） | 查看原因，恢复网络或配置后在页面重试，或执行 `skill-update retry <任务编号>`；上传中断或本机原包已清理时需重新提交 |

校验提醒（warnings）不阻止发布。仅有上传进度完成、HTTP 202 或进程退出码 0，均不能证明包已发布。

### 已有 OSS 权限的直接提交

可以将包上传到 `oss://automage-skills-private/inbox/`，常驻服务会每分钟补扫。例如，已配置好 ossutil 的机器可执行：

```sh
ossutil cp churn-autopsy-1.0.0.zip oss://automage-skills-private/inbox/
```

直接提交没有网页任务记录，需查看私有 `reports/` 下对应包的 JSON 报告。合格原包进 `archive/`，不合格包进 `rejected/`，处理失败进 `failed/`；直接提交的失败包修复外部问题后可移回 `inbox/` 重试。网页和 CLI 任务使用自己的重试入口。

## 6. 更新、下架、回滚

- **更新**：任何改动都要升版本号，重新交整个包。改文案升最后一位（1.0.1），换视频或大改升中间一位（1.1.0）。已发布的版本不能覆盖，同一个版本号会被拒。
- **下架**：由运维用 `skillpack.cjs unlist <id> --index <当前索引文件> --out <输出目录>` 生成新索引并上传，官网通常再需约 1–2 分钟刷新。视频文件保留；下架后也不能覆盖原版本存档。
- **回滚**：
  - 想退回旧内容：用一个新版本号把旧内容再交一次；
  - 发布本身出了问题：运维从私有 `index-history/` 恢复上一份索引。

手动修改或恢复线上索引前，停止 `skill-update.service`，核对待处理任务与 OSS inbox，备份当前索引后再操作。确认索引与媒体一致后恢复服务，避免与自动发布并发写索引。

---

## 附录 A：现有的 32 类工作（`listing.groups` 里写左列的 id）

需要新的一类工作时，先找官网负责人。分类和它的说明文案在官网代码里（`src/lib/skill-groups.ts`），加一类要发一次版；往已有的类里加 skill 不用发版。

| 工作领域 | groups 里写 | 能力库里显示为 |
|---|---|---|
| 销售与客户 | `customer-retention` | 理解客户流失，准备挽回 |
|  | `inbound-sales` | 接住询盘，判断下一步 |
|  | `account-research` | 拜访前，把客户研究清楚 |
|  | `outreach` | 开发客户，安排连续跟进 |
|  | `crm-records` | 整理客户档案与跟进状态 |
|  | `commercial-decisions` | 准备成交条件与异议应答 |
|  | `growth` | 选择获客方式与增长动作 |
|  | `sales-reporting` | 把销售进展整理成复盘材料 |
|  | `brand-discovery` | 了解品牌在 AI 回答中的表现 |
| 客服与协同 | `customer-support` | 让客服回复与转交有章可循 |
|  | `service-operations` | 规划客服人力与沟通节奏 |
| 采购与外贸 | `sourcing` | 找货源，比较候选商品 |
|  | `supplier-evaluation` | 评估供应商与采购条件 |
|  | `trade-research` | 核对贸易信息与合规条件 |
|  | `trade-documents` | 准备报价、单证与含税测算 |
| 电商运营 | `product-research` | 判断商品机会与用户需求 |
|  | `listing` | 把商品资料整理成上架内容 |
|  | `store-improvement` | 找出店铺与投放的改进点 |
|  | `product-creative` | 制作商品主图与广告素材 |
| 法律与合规 | `contracts` | 审阅合同，形成修订意见 |
|  | `legal-research` | 找到适用的法律分析方法 |
|  | `compliance` | 准备合规与安全核查 |
| 财务与投资 | `finance-operations` | 整理收支、预算与财务分析 |
|  | `tax-filing` | 按地区准备税务申报 |
|  | `investment-research` | 整理行情与投资研究材料 |
| 内容与设计 | `video-writing` | 把一个想法写成可拍的脚本 |
|  | `office-documents` | 把材料做成可编辑的文档 |
|  | `video-editing` | 把长素材变成可剪辑的内容 |
|  | `video-production` | 准备生成视频与解说动画 |
|  | `image-production` | 按工具与工作流生成图像 |
|  | `social-creative` | 制作图文、封面与文章配图 |
|  | `brand-interface` | 设计标志、图标与界面 |

## 附录 B：官网接入与资源地址

官网从 OSS 索引读取展示清单；发布到已有分类无需发版。新增分类需修改 `src/lib/skill-groups.ts` 并发布官网。读取与解析代码分别为 `src/lib/server/skill-source.ts`、`src/lib/skill-index.ts`。

生产官网运行时配置：

```dotenv
SKILL_INDEX_URL=https://skills.automage.cn/skills/index.json
SKILL_ASSET_BASE=https://skills.automage.cn/skills/
```

改变量后重启官网即可，无需重新构建。`SKILL_ASSET_BASE` 可省略，此时取索引所在目录；若服务器通过 OSS 内网读取索引，必须将该变量设为浏览器可访问的公开地址。

- 索引缓存 60 秒，OSS/CDN 的 `index.json` 缓存不超过 60 秒；版本化视频与封面采用一年缓存并标记 immutable。
- 读取失败沿用最后一份有效索引；启动后从未成功读取时使用内置清单。坏条目单条剔除，全空索引视为读取失败。
- 怀疑未更新时，检查索引响应和官网 `[skill-index]` 日志。去掉 `SKILL_INDEX_URL` 并重启可暂时回到内置清单。
- 视频使用 `skills.automage.cn` 自定义 CDN 域名；OSS 默认域名曾返回强制下载头，不能只凭 Range 206 判断浏览器可播放。CDN 需保持 Range 回源、inline 响应和 HTTPS。

索引格式为 `automage.skill-index/1`，顶层包含 `generatedAt` 与 `skills`。每个条目包含 id、version、展示字段、groups、story、media 和 updatedAt；由交付工具生成，不手工拼写。`media` 路径相对于资源地址，如 `churn-autopsy/1.0.0/demo.mp4`；为 null 时展示占位卡片。新交付条目的 `story.preview` 固定为 `document`，同类排序遵循官网编排后接新增成员。

## 附录 C：上传服务部署与运维

### C.1 当前部署

| 项目 | 配置 |
|---|---|
| 上传入口 | `https://skill-update.automage.cn` |
| DNS | `skill-update` CNAME → `automage.cn`，沿用官网本机地址 |
| 反向代理 | 本机 Nginx → `127.0.0.1:3120`，HTTP 跳转 HTTPS |
| 运行目录 / 常驻服务 | `/root/skill-update` / `skill-update.service` |
| 本机 CLI 授权 | `/root/skill-update/control.sock`，权限 0600 |
| OSS 地域 | `cn-hangzhou` |
| 私有 bucket | `oss://automage-skills-private` |
| 公开位置 | `oss://automage/skills/` |
| 服务端配置 / 密码哈希 | `/root/skill-update/config.json` / `passwords.json`，权限 0600 |

上传应用源码位于 `apps/skill-update/`，部署配置位于 `deploy/skill-update/`。使用 Node 22 和官方 `ali-oss` SDK；`oss-cli.cjs` 适配 worker 使用的 `ls/cp/rm` 子集，不需要另装 ossutil。工具与 schema 随应用复制到运行目录，不依赖运行时读取官网仓库。

只在本机运行一份发布服务，不额外启动 cron worker。密钥和密码明文不进入仓库、前端或日志；公网上传与查询需认证，上传者只能查看该密码项的任务，管理员可查看全部。

### C.2 安装、更新与迁移

以下命令在仓库根目录执行，目标部署机器需有 root 权限、Node 22、npm、Python 3、Nginx、systemd 和 Certbot。

1. 首次部署在 `/root/skill-update/config.json` 配置 `region`、`accessKeyId`、`accessKeySecret` 和初始化用的 `adminPassword`，文件权限为 0600。管理员密码由运维提供，不在本文公开。存储目标和地域可在配置中覆盖；修改域名或端口还需同步 Nginx 与 HTTPS 部署配置。
2. 执行 `bash deploy/skill-update/install.sh`。脚本安装锁定依赖、运行时、工具、schema、模板与指南下载副本，配置 Nginx 和 systemd。已有密码列表保留，更新会重启服务，待处理任务由持久化记录恢复。
3. 首次部署确保 DNS 指向目标本机，执行 `bash deploy/skill-update/enable-https.sh` 签发证书并启用续期。HTTP 启动阶段用于 ACME 和页面检查，生产认证要求 HTTPS。
4. 检查健康接口、网页登录和下载资源，再用隔离 OSS 前缀验证发布。生产已存在索引时不要重新 export 或覆盖首批内容。

首次初始化生成 5 项随机上传密码，保存到本机 `/root/skill-update/initial-passwords.txt`（0600），分发后删除；管理员密码转为哈希并从配置中移除明文。迁移前备份受限配置、密码哈希、`data/jobs/` 和证书配置，停止旧机器的 worker，再切换新机器。

只更新指南时，将本文件同步到应用的 `public/delivery/README.md` 即可，无需重启服务。schema、模板或代码变更时按安装流程同步配套资源。

### C.3 密码管理

网页右上角“密码管理”输入管理员密码，支持新增、停用、删除、单项重置和整表重置。本机 CLI 提供同等操作：

```sh
skill-update passwords list
skill-update passwords add '内容团队'
skill-update passwords reset <密码项ID>
skill-update passwords disable <密码项ID>
skill-update passwords delete <密码项ID>
skill-update passwords reset-all
```

列表不返回密码明文或哈希；新密码仅在生成结果中显示，需及时保存与分发。重置、停用或删除立即撤销对应上传会话，已接收的任务继续处理。会话最长 8 小时，服务重启后重新验证；每 IP 每 15 分钟最多 10 次登录尝试。

### C.4 存储与发布顺序

```text
私有 bucket                              公开 bucket
  inbox/                                 skills/index.json
  archive/<id>/<version>.zip              skills/<id>/<version>/demo.mp4
  rejected/                              skills/<id>/<version>/poster.jpg（或 png/webp）
  failed/
  reports/
  index-history/
```

网页和 CLI 完整接收后原子入队，本机记录为 `data/jobs/<任务编号>/job.json`，暂存原包为同目录的 `package.zip`。上传到 OSS 的文件用任务 UUID 命名，同名提交不会互相覆盖；校验使用原始文件名。已接收的网页和 CLI 任务按提交时间串行处理。

一个包的发布顺序：

1. 下载并检查包结构、清单、视频、封面与 ZIP 安全；不合格写拒绝原因。
2. 读取当前索引，检查版本与已有存档；普通重复版本、较旧版本以及存档覆盖请求拒绝。
3. 原包存入私有 `archive/`，上传公开视频和封面。
4. 旧索引备份到 `index-history/`，最后更新公开 `index.json`。
5. 移除 inbox 对象，写唯一报告并回写逐包任务结果。索引历史也使用唯一名称。

若公开位置缺少首份索引，worker 停止并保留 inbox，不凭空创建空索引。现有生产索引已经初始化；仅全新环境才需要使用 `skillpack.cjs export` 准备首份索引。

只给直接 OSS 提交者写 inbox、读 reports 的权限；worker 读写私有 bucket、写公开 `skills/`；官网只需读取公开索引。skill 本体和原包始终不进入公开位置。

### C.5 故障与恢复

```sh
systemctl status skill-update
journalctl -u skill-update --since today
skill-update status
curl -fsS https://skill-update.automage.cn/healthz
```

- 接收上限：单包 300 MiB、最多 3 个并发接收、待处理最多 50 项；磁盘不足时拒绝接收。ZIP 校验限制目录边界与实际解压量，拒绝危险路径、重复路径和链接文件，不执行包内代码。
- 重启后恢复待处理任务；上传中断需重新提交。若索引已更新但确认中断，仅线上版本与私有存档 SHA-256 都匹配时才认定完成，存档不同则拒绝。
- 基础设施失败按第 5 节重试；单个 OSS 命令超时 120 秒，worker 总运行上限 30 分钟。校验拒绝需修包，不能通过重试绕过规则。
- 发布成功后本机暂存原包删除；失败或拒绝原包保留 7 天后清理。任务元数据和 OSS 报告保留，页面展示最新 100 条。
- 官网未更新时先确认任务为 published，再检查公开索引、缓存和官网环境变量；不要重复上传相同版本。

### C.6 域名与证书维护

上传站点使用本机 `/etc/letsencrypt/live/skill-update.automage.cn/` 证书，`certbot.timer` 自动续期，成功后 reload Nginx。正式证书已签发，有效期至 2027-01-08。

截至 2026-10-10，模拟续期仍未通过：Let's Encrypt staging 报告 HTTP-01 challenge 返回 403，外部原因尚未确定；正式签发、本机及公网人工探针成功。运维需复验，不能将定时任务已配置当作模拟续期已通过：

```sh
certbot renew --cert-name skill-update.automage.cn --dry-run --no-random-sleep-on-renew
```

失败时结合 `/var/log/letsencrypt/letsencrypt.log` 与 Nginx 日志排查外部访问链路。该选项只关闭手动检查的随机等待，自动定时续期沿用默认调度。

资源域名 `skills.automage.cn` 另走阿里云 CDN，不能用上传站点的本机证书配置替代。已交接的 CDN 设置包括海外加速、HTTPS 回源、Range 回源、inline 响应和对应缓存策略；该域名通过将 HTTP-01 文件写入公开 OSS 验证，续期后更新 CDN 证书。维护工具包存于私有 `operations/20261009/https-maintenance-kit.zip`，迁移或修复前应恢复该工具包并核实实际执行机器与任务。首批来源包和溯源记录分别保存在私有 `source-packages/20261009/`、`bootstrap/20261009/provenance.json`；原始来源包不是新交付格式，不放回 inbox。

## 附录 D：接口与验证（给 agent 和维护者）

网页 API 与 CLI 共用队列。上传、任务查询和密码管理接口需要认证；写接口核验 Origin，不启用跨域。本机 CLI 经受限 Unix socket 授权。

| 接口 | 输入或行为 |
|---|---|
| `POST /api/login` | JSON `{password, admin?: boolean}`，设置安全会话 Cookie |
| `POST /api/uploads` | ZIP 原始请求体，`X-File-Name` 为 URI 编码文件名；返回 HTTP 202 与任务编号 |
| `GET /api/jobs`、`GET /api/jobs/:id` | 查询当前密码项的任务；管理员可查询全部 |
| `POST /api/jobs/:id/retry` | 重试处理失败的任务 |
| `GET /api/admin/passwords` | 管理员查询命名密码列表 |
| `POST /api/admin/passwords` | JSON `{action,id?,name?}`；action 为 add、disable、delete、reset 或 reset-all |
| `POST /api/logout`、`GET /api/session` | 退出或查询会话 |
| `GET /healthz` | 健康检查 |

本地验证从仓库根目录执行：

```sh
node --test apps/skill-update/test/*.test.cjs tests/skill-kit.test.cjs tests/skill-inbox.test.cjs tests/skill-index.test.cjs
```

需要验证真实 OSS 时，先配置服务端授权，再显式运行隔离检查：

```sh
node apps/skill-update/test/oss-smoke.cjs
```

隔离检查会在两个 bucket 的独立 UUID 前缀写入测试对象并清理，核对正式索引未变，不向官网添加测试条目。验收需覆盖合格发布、重复/较旧版本拒绝、损坏与危险 ZIP、密码撤销、任务隔离、批量提交、网络失败和中断恢复。浏览器检查桌面与手机、登录、上传后刷新查询、密码管理、文档下载与视频播放；发布成功依据仍是逐包结果和索引更新。
