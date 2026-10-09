# Skill 交付规范与同步流程

> 给做 skill 的人看，人和 agent 都按这份做。做完一个 skill，按这里的格式打成一个压缩包交上来；检查、上传、在官网出现都走同一条流程，不再手动同步。
>
> 2026-10-09 起执行 · 清单格式 `automage.skill/1` · 索引格式 `automage.skill-index/1`

## 一页看懂

```
做好 skill ──► 照模板填 skill.json，录演示视频，截封面
           ──► 自查：node skillpack.cjs check 包.zip（不合格会逐条说明哪里要改）
           ──► 上传到 OSS 的 inbox/（任何时候都可以）
           ──► 自动处理：一分钟内复检；合格就发布，不合格退回并写明原因
           ──► 官网能力库出现这个 skill（不用发版，上传后约 3 分钟）
```

只有一个通道，没有人工审批：检查就是关口。

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
- 大小：整个包解开不超过 300 MB，`skill/` 不超过 100 MB，视频不超过 100 MB（建议 50 MB 以内）。

**模板**：[`template/churn-autopsy/`](template/churn-autopsy/)。它就是线上 `/market/churn-autopsy` 这一页的清单，可以打开那一页，对照着看每个字段出现在哪。照着做时：

1. 复制整个文件夹，改成你的 id；
2. 改写 skill.json；
3. 用你的 skill 本体替换 `skill/`；
4. 把 `demo.mp4` 和 `poster.jpg` 放进 `media/`。

模板里 `skill` 一节留了 3 处 `<…>` 占位，原样检查会报出来，是正常的。

## 2. skill.json 怎么填

完整格式在 [`skill.schema.json`](skill.schema.json)。在编辑器里写上 `"$schema": "./skill.schema.json"` 会有提示和即时检查。

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
| 大小 | 不超过 100 MB，建议 50 MB 以内 |
| 封面 | 16:9，1280 宽以上，建议 400 KB 以内；选交付物出来的那一帧，不选启动画面 |

**录制要求**。发布前没有人工审核，这些由提交人自己把关。前四条是检查存量视频时发现过的问题：

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

工具是 `scripts/skills/skillpack.cjs`，规则是 `docs/skill-delivery/skill.schema.json`。把两个文件放进同一个文件夹，有 Node 18 以上就能单独用，不需要官网仓库。

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

## 5. 怎么交

把合格的包上传到内部 OSS 的 `inbox/`，账号和地址找运维开通。任何时候传都可以，用命令或在控制台拖进去：

```sh
ossutil cp churn-autopsy-1.0.0.zip oss://<内部 bucket>/inbox/
```

之后全自动，每分钟处理一次：

- **合格**：
  - 视频和封面放到公开地址，官网的 skill 索引更新；
  - 原包进内部存档；
  - 约 2 分钟后，这个 skill 出现在官网能力库，地址 `/market/<id>`。
- **不合格**：包移到 `rejected/`。版本号已发布过、比线上的旧，也算不合格。
- **处理出错**：包移到 `failed/`。比如网络断了，修好后把包移回 `inbox/` 重试即可。
- **每个包都有一份结果**：写在 `reports/<时间>-<包名>.json` 里，标明状态（published / rejected / failed）和原因，自己去看。

## 6. 更新、下架、回滚

- **更新**：任何改动都要升版本号，重新交整个包。改文案升最后一位（1.0.1），换视频或大改升中间一位（1.1.0）。已发布的版本不能覆盖，同一个版本号会被拒。
- **下架**：找运维。运维用 `skillpack.cjs unlist <id>` 生成新索引并上传，约 2 分钟后从官网消失。视频文件留在原处，不影响别的。
- **回滚**：
  - 想退回旧内容：用一个新版本号把旧内容再交一次；
  - 发布本身出了问题：运维把上一份索引恢复回去（每次发布都会留一份索引历史）。

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

## 附录 B：官网怎么读 skill（给维护官网和运维的人）

官网从 OSS 上的一份索引 `index.json` 读“展示哪些 skill、视频在哪”。代码在 `src/lib/server/skill-source.ts` 和 `src/lib/skill-index.ts`。

**环境变量**：运行时读取，改了重启即可，不用重新构建。

| 变量 | 含义 |
|---|---|
| `SKILL_INDEX_URL` | 索引地址，如 `https://<公开域名>/skills/index.json`。不设时官网用内置清单（现在的 191 个），和以前一样 |
| `SKILL_ASSET_BASE` | 可选。视频和封面的公开地址前缀，如 `https://<公开域名>/skills/`。不设时取索引所在的目录。官网服务器走 OSS 内网地址读索引时必须设，因为浏览器要从公开域名拉视频 |

**刷新**：

- 读到的索引保留 60 秒，过期后下一次访问在后台刷新，所以新 skill 一般 1–2 分钟内出现。
- OSS/CDN 上 `index.json` 的缓存时间不要超过 60 秒。

**读不到时**：

- 索引读不到（网络、404、内容坏了），官网继续用上一份读到的；启动后一份都没读到过，就用内置清单。页面不会坏。
- 内容坏了、或者刚启动就读不到，日志会有 `[skill-index]` 开头的错误。
- 运行中途索引被删（404）时，官网安静地沿用上一份，日志里不一定有记录。怀疑没更新时，直接 `curl -sI` 索引地址看。
- 恢复后约 2 分钟内切回新索引。2026-10-09 在开发机实测过：新增条目 10 秒后出现；索引 404 或内容损坏期间页面全部正常；恢复后 105 秒切回。
- 单个条目不合格只会去掉这一条，其他照常显示，日志里列出原因。
- 一个 skill 都读不出来的索引会被当成读取失败，避免误删全站。

**索引格式**：

```json
{
  "format": "automage.skill-index/1",
  "generatedAt": "2026-10-09T10:00:00Z",
  "skills": [
    {
      "id": "churn-autopsy", "version": "1.0.0", "domain": "CRM",
      "title": "客户流失复盘", "summary": "…", "inputs": ["…"], "output": "流失复盘报告",
      "groups": ["customer-retention"], "keywords": [], "subSkills": 0,
      "story": { "scenario": "…", "…": "…", "preview": "document" },
      "media": { "video": "churn-autopsy/1.0.0/demo.mp4", "poster": "churn-autopsy/1.0.0/poster.jpg" },
      "updatedAt": "2026-10-09"
    }
  ]
}
```

- `media` 里的路径相对于 `SKILL_ASSET_BASE`；`media` 为 `null` 时，详情页显示封面卡片，不放视频。
- 条目的顺序就是同类里的顺序，排在官网编排过的成员之后。
- 新交的 skill，`preview` 一律是 `document`。另外四种（report、sourcing、script、lead）是给特定几个 skill 画的示意，不能套用。

## 附录 C：自动通道（给运维）

一个通道：任何时候往内部 bucket 的 `inbox/` 放一个 zip，下一轮就会自动处理。没有审批，`skillpack.cjs check` 就是关口。实现是 `scripts/skills/inbox-worker.cjs`，每分钟跑一次。

**存储布局**（bucket 名、域名由运维定，不写死）：

```
内部 bucket（私有）                          公开 bucket（公共读，挂自定义域名 + CDN）
  inbox/          上传到这里                    skills/index.json                  唯一会变的文件，缓存 60 秒
  archive/<id>/<version>.zip  合格包存档        skills/<id>/<version>/demo.mp4     发布后不再改，长缓存
  rejected/       不合格的包                    skills/<id>/<version>/poster.jpg
  failed/         处理出错的包（移回 inbox/ 重试）
  reports/        每个包的处理结果
  index-history/  每次发布前的旧索引（回滚用）
```

**怎么跑**：放在任何一台有 Node 18+、ossutil 2.x（已配好凭证）和官网仓库的机器上，用 crontab 每分钟一次：

```sh
* * * * * cd /path/to/automage--homepage && node scripts/skills/inbox-worker.cjs \
  --private oss://<内部bucket> --public oss://<公开bucket>/skills >> /var/log/skill-inbox.log 2>&1
```

- 第一次先加 `--dry-run`：只读取和检查，不写任何东西，确认 ossutil 的参数在你们的版本上都能用。
- 想加敏感词表，用 `--denylist <文件>`，一行一个词。公开文案里出现这些词就不合格。
- 只在一台机器上跑。同一台机器上，上一轮没跑完时这一轮会自动跳过。

**一个包的处理顺序**（任何一步失败，官网都不会指向不存在的文件）：

1. 下载到临时目录，用 `skillpack.cjs check` 检查。不合格：移到 `rejected/`，写报告。
2. 读线上的 `index.json`，生成新条目。版本已发布过、或者比线上的旧：同样移到 `rejected/`。
3. 原包存到 `archive/<id>/<version>.zip`。
4. 上传视频和封面：`max-age=31536000, immutable`。
5. 线上旧索引备份到 `index-history/`，然后上传新的 `index.json`：`max-age=60`。
6. 从 `inbox/` 删掉，写报告。

**例外**：

- 线上一份 `index.json` 都没有时，worker 停下，`inbox/` 原样不动。第一份索引由 `skillpack.cjs export` 生成，worker 不会凭空建一份，免得把全站清空。
- 其他意外错误：包移到 `failed/`，报告里写错误。

**权限**：

- 上传的人只能写 `inbox/`，读 `reports/`。
- worker 的账号读写内部 bucket，写公开 bucket 的 `skills/`。
- 官网服务器只读公开的 `skills/index.json`。

**手动操作**：用 `skillpack.cjs`，见第 6 节。手动改线上 `index.json` 之前，先确认 `inbox/` 是空的，免得和 worker 同时改。

