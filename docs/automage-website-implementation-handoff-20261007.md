# AutoMage 官网实施交接 · 2026-10-07

**性质**：implementation contract。下一 Session 的 canonical source of truth。
**冲突裁决**：本文件与 `docs/experience-architecture-20261007.md` 或任何历史 spec / memory 冲突时，以本文件为准。
**任务边界**：执行、验证、局部修正。不重新讨论产品 ontology、Narrative Architecture 或三页职责（见 §7 禁重开清单）。

---

## 0. 背景（一段话版本）

AutoMage 是面向企业/团队、可按真实业务场景配置能力、规则与 AI 自主边界的工作框架。当前产品仓库（`/root/neko/AutoMage/客制化`，独立仓库）只是已实现并能够提供证据的一条 vertical slice（日报→汇总→决策→任务的协作链），不定义最终边界。官网的使命是让非技术企业负责人自己形成正确心智模型，并能把官网直接交给对外介绍的人使用。设计讨论已经收敛，本文档冻结结论；实现中发现与真实代码冲突时，在既定意图下解决，只有确实无法实现或会造成错误时才上报 blocker。

---

## 1. Frozen Decisions（已冻结，视为事实执行）

### 1.1 产品与叙事

1. 产品仓库 = vertical slice 证据，不是产品边界。官网叙事不因已实现代码而收窄，也不把未实现能力伪装成已上线（见 §1.5 证据分级）。
2. AutoMage 面向企业或团队，是**可按真实业务场景配置能力、规则和 AI 自主边界的工作框架**。
3. "协调"是重要场景、适合演示的入口，**不是**完整定义。
4. AutoMage **承接并持续推进具体工作**；过程中形成的可追溯记录是重要资产，**Record 不是产品身份本身**。禁止"工作变成一份 Record"这类表述。
5. **委托 / delegation** 是当前客户理解模型：企业把一项具体工作交给 AutoMage，并规定目标、可调用能力、自主范围、何时需要找人、怎样判断完成。
6. 长期模型**不是**固定的"AI 建议、人拍板"。哪些动作自主、哪些需确认、哪些必须由特定角色完成，本身属于企业配置。
7. 差异化论证**禁止使用**"传统软件流程写死、AutoMage 可配置"。成熟 ERP/BPM 同样高度可配置。允许的增量表述：企业可以进一步配置 **AI 对一项工作的责任范围和自主程度**。
8. Supply Chain 有真实企业背景，是 reference scenario；AutoMage 不是供应链软件。
9. Capability / Market 的作用不是展示 Skill 数量，而是帮客户理解"什么工作可以交给 AutoMage、可以怎样结合企业情况配置"。
10. Skill 是可调用能力的载体，可封装知识、工具、流程、查询、生成、外部服务等，**不等于**"专业知识"。

### 1.2 全站认知路径（Narrative Spine）

> 认出问题 → 理解委托 → 跟完一件真实工作 → 拆开配置 → 改规矩 / 换事情 → 认领自己的工作。

### 1.3 三页长期职责与体验姿态

| 页面 | 认知任务 | 姿态 |
|---|---|---|
| Homepage | 让第一次进入的企业负责人快速理解 AutoMage 在接什么工作、为什么值得继续了解 | 翻阅 / 追问 |
| Supply Chain | 进入一家具体企业的工作世界，经历一项工作如何跨时间、角色和现实变化持续推进 | 跟随 / 判断 / 改变委托边界 |
| Capability / Market | 让已理解产品的客户回答"我们公司的什么工作可以交给它" | 表达自己的工作 / 起草一次委托 |

三页共享的是同一套 **semantic work language**（§1.4），不共享 React 组件，也不共享页面几何。**不要为了代码复用重新造成视觉和交互同质化。**

### 1.4 跨页设计语义不变量（frozen）

1. 来源必须可追溯：任何论断可以查看是谁/何时/哪个系统给出的。
2. 事实、推断、未知必须有明确区分。
3. 人的决定、AI 的建议、系统状态不能混成同一种信息。
4. 状态变化必须能解释"为什么发生"。
5. **reopen 必须能看到触发原因。**
6. 浏览页面的交互（拖动、开关、点选）与模拟业务状态的变化必须在语义上可区分。
7. 演示内容、真实企业背景、当前实现能力、未来方向四类信息不能混为一谈（标注词法见 §1.5）。
8. 动效只在帮助理解状态、时间、来源、因果时使用。
9. 不使用持续粒子、自动循环等视觉假象表达"系统正在智能运行"。

### 1.5 证据分级与标注（frozen）

页面上任何陈述只能属于以下三层之一，并携带对应标注：

| 层 | 允许内容 | 标注要求 |
|---|---|---|
| 已有实现证据 | 当前官网仓库与产品仓库能支持的陈述 | 可写"已实现"，措辞保守 |
| 基于真实企业情况重构的 Scenario | Supply Chain 等场景内容 | 未获 owner 授权公开具体企业信息前，默认措辞：**"基于真实企业业务场景重构，页面数据与过程为演示。"** 不暴露企业身份、不使用未经确认的真实数据 |
| Product direction / simulation | 更丰富的自主边界、系统写入、未来 Capability 组合 | 必须明确表现为方向或模拟；**禁止伪装成已上线的产品界面**（尤其 Replay 的配置抽屉，见 §3.3B） |

### 1.6 第一阶段实施目标：Supply Chain vertical slice

**目标**：验证整个网站体验模型中最关键的部分，不是做完整的供应链产品，也不追求"流程跑完"的观感。

核心体验（必须成立）：

> **Premise invalidation → reopen**
> 用户亲眼理解：原来的决定建立在某些条件上；条件变化后，这项工作没有丢失，而是带着原始上下文重新回到需要处理的位置。

体验脚本（约 14 天为当前设计假设，见 §2）：

- **Day 0**：缺料/风险事件进入，多个角色与信息来源开始提供事实；
- **Day 1–5**：核对上下文、补未知、形成选项、初次决定；
- **Day 6**：现实条件变化，原决定依赖的前提失效；
- 工作**重新打开**，把"原判断为什么成立"与"现在什么变了"同时呈现；
- 后续重新判断、落实、回执和结果继续进入**同一项工作**（同一个对象，不新建叙事线）；
- 最后通过 interaction 把场景**拆开**（三层透镜，§3.3A），用户在这个具体场景里理解企业环境、AutoMage 行为与委托边界。

两个关键 interaction hypothesis（A 拆开 / B 改规矩重放）在 §3.3 定义。

同期不做：Homepage 重构、Capability 重构、全局 Design System 重写（§2、§7）。

---

## 2. Design Hypotheses（可以按运行结果调整；**禁止升格为新的全局 Design System**）

1. "暗桌面 + 亮纸张"的环境/对象关系（navy 为环境、工作对象如纸面、navy 作为纸上之墨）。
2. navy / blue / green 的具体色彩映射（现有 `--color-gate-human: #1E3A5F` 在深底上几乎不可见的对比度缺陷需要修正，但修正方案本身是实现期决策）。
3. 14 天的具体长度与逐日事件密度——可按理解效果增减。
4. Homepage 是否直接以完整 work object 作为首屏。
5. Homepage 的角色视角切换（决策者 / 参与者 / 设置者看同一件工作）。
6. Capability 的工作类型 taxonomy（汇总 / 分析 / 监测 / 跟进 / 成文…业务语言分组）。
7. 具体组件几何（时间轴形态、卡片样式、布局）。
8. 某个既有组件是否一定复用——以新体验结构是否自然为准（§4）。

---

## 3. Supply Chain slice 的实施规格

### 3.1 页面现状（改动前基线）

路由：`src/app/scenarios/supply-chain/page.tsx`。当前组成（自上而下）：

`MarketChrome` 顶栏 → `LenisProvider` → `FlowNavigation` 侧轨 → `HeroSection`（缺料事件 console）→ `CompareSection`（散乱事实→决策卡，GSAP pinned）→ `InfoLoopSection`（六节点环形轨道动画）→ `ScenarioWorkbench`（Human Gate + Commit & Evidence，交互式状态机）→ `ValueCardsSection`（三张"Core"解释卡）→ `BringEventSection`（事件适配自查）→ `BetaSection`（页内内测表单）→ `FAQSection`（系统边界）。

数据结构：`src/lib/homepage-vnext.ts`（EvidenceClaim：epistemicType = observed_fact / derived_fact / inference / recommendation / user_assertion；provenance{source, evidenceRef, capturedAt, freshness}；独立维度 governance / execution / verification）。

### 3.2 保留 / 重构 / 退役（原则，不是逐条命令）

**优先理解并复用的资产**（复用与否以新体验结构是否自然为准）：

- `src/lib/homepage-vnext.ts`：semantic model 的重要参考。三层证据（事实/推断/未知 + provenance + 状态维度分离）正是 §1.4 需要的语义。⚠️ 它存在 ≠ 它是全站 domain contract；扩展方式由实现决定。
- `ScenarioWorkbench.tsx`：已实现的交互包括——选择方案 A/B、确认关键未知（未确认时阻断批准）、批准带版本号、退回修订、模拟授权过期、单独触发的执行动作（sent → awaiting → acknowledged / failed → retry / handoff）、重置，以及"未授权时一键返回 Gate 精确操作点并聚焦"的引导逻辑与键盘/aria 支持。**如果原状态机无法自然表达 premise invalidation、reopen 或 replay，允许局部重构，不要为了复用旧代码扭曲新体验。**
- `CompareSection.tsx`：碎片素材（WMS / ERP / MES / SRM / 财务 / 群聊的具体条目）适合改造为 Day 0 的"分散事实"材料；pinned 收敛动画是否保留是实现期决策。
- Skill catalog / detail 数据管线（`src/lib/skill-catalog.data.ts`、`skill-groups.ts`、`skill-stories.ts`、`src/components/market/*`）：本 slice 不用，留给 Capability 阶段。
- `/contact` 与 Beta 后端（`src/app/contact/`、`src/lib/server/*`、Prisma/Supabase）：真实联系通道，本 slice 不破坏；页内 Beta 表单按 §3.2 退役条目处理。
- 动效与可访问性基础：`src/lib/gsap.ts`、`src/hooks/*`、`LenisProvider`、`globals.css` 的 `prefers-reduced-motion` 回退——保留这套纪律。
- `MarketChrome.tsx`：顶栏（产品 / 场景 / 能力 / 联系）与全站 IA 一致，保留。

**确认退役 / 降级（不要带入新方向）**：

- 固定六节点循环（`InfoLoopSection` 及 design tokens 中 `loopRail`→section 映射）：它直接宣称"生命周期是固定的"，与可配置委托矛盾。退役为整节；"点击节点看详情面板"的交互思想并入工作对象。
  - **2026-10-07 修订（owner 对照实际渲染后决定）**：退役的是六节点环作为**固定 ontology / 全站 lifecycle** 的地位，不是它的表现资产。旧首页（尤其 8 月版）的 SVG、路径绘制、pinned 舞台、事件编排、构图与动效写法，允许在首页重新赋义后复用。原则：**推翻的是语义，资产默认不随之退役**；只有表现资产本身与新目标冲突时才一起退役。
- 输入→AutoMage→输出抽象解释图（`SystemOverview`，属首页）：不作为首页主模型（本 slice 不动首页，此处仅记录方向）。
- 所有页面共用的 section geometry；"英文 mono eyebrow + 两行大标题 + 灰色侧文"的默认模板。
- 常驻粒子、无业务含义的循环动画（`PageParticles`、orbit particle 等）。
- "禁止 IM / 人物 / 对话材料"的旧规则（specs 01/04 红线）：解除。IM 消息、具名角色发言是合法的场景材料。
- 把 191 个 Skill 平铺成产品主体；对所有 Skill 使用同一种流程/gate 模板（Capability 阶段处理，此处记录在案）。
- `ValueCardsSection`：三张解释卡所述内容将由拆开透镜"演"出来。
- 页内 `BetaSection` / `FAQSection` / `BringEventSection`：不属于工作世界的构件；联系与边界说明分别归 `/contact` 与后续首页。可先降级为轻量出口/折叠说明，不必一次清空。
- ⚠️ memory 文件 `homepage-journey-invariants.md`（旧叙事顺序、Compare 3/5 motion、InfoLoop pin 行为等）**已被本文件取代**，不再作为约束。

### 3.3 两个关键 interaction hypothesis

#### A. 拆开 / Lens

以交互（不是说明文字）把场景拆开。**至少三层语义**（不是"企业设定 / AutoMage 动作"两类）：

| 层 | 含义 | 例子 |
|---|---|---|
| Enterprise context / rules | 企业原本拥有的环境 | 系统（WMS/ERP…）、数据、角色、阈值、业务规则 |
| AutoMage behavior | AutoMage 在这项工作上承担的行为 | 获取、核对、追问、整理、调用能力、跟进、保留上下文 |
| Delegation / responsibility boundary | 双方定义的委托关系 | AI 可自主到哪、什么条件必须回来找人、找谁、什么动作禁止自主、怎样认定完成 |

三层模型是**体验假设**，帮助访客区分三类信息；不要把它写成新的产品 ontology，也不要为它发明架构图。实施形态自由（叠加标注、X 光视图、分栏均可），验收只看 §3.5 的理解问题 B。

#### B. 改规矩 / Replay

让用户改变一项自主边界，例如：

- 原规则："发生变化都需要回来确认"
- 改为："在某个允许范围内（如 ±5% 预算）可以自行调整，事后报备"

然后**重新经历同一段现实变化**。用户通过"**这次有没有被打扰**"直接感受差异：第一次事件退回要求重批；第二次事件不回到面前，只产生一张报备卡（审计中可见 AI 动作与其授权依据）。

硬约束：

1. 这包含未来方向，性质是 **scenario simulation**。
2. 视觉与文案**不得**把它做成看起来已上线的客户配置界面：不用真实产品设置页的框架（无账号、无保存、无 toast"配置成功"），入口措辞保持"演示/重放"语义，页顶说明常驻或就近。
3. 首次与重放之间差异必须归因于规则本身，其余时间线数据保持可对照（同源事件、同一天数）。

### 3.4 实现约束

- **本仓库的 Next.js 不是训练数据里的版本**（`AGENTS.md` 明确）。写任何框架代码前先读 `node_modules/next/dist/docs/` 相关指南，注意 deprecation。
- 已验证的构建/开发路径是 **webpack**（`npm run dev` / `npm run build` 均带 `--webpack`）；Turbopack dev 在本仓库有 hydration 停滞问题。
- 本 slice 全部为前端确定性模拟：不调用网络 API、不读写业务后端、不自动提交任何表单。确定性数据 + 固定演示时间（沿用 `homepage-vnext.ts` 风格）。
- 键盘可操作与 `prefers-reduced-motion` 完成态必须保持（现有纪律不降级）。
- 移动端不用硬性 scroll 陷阱；时间轴在窄屏退化为线性步进。
- 文案语言：中文为主；等宽英文只用于状态字段/技术标签。陈述句、无夸张词。"演示"标注在决策相关边界出现即可，不必每句重复。
- 当前分支 `feat/homepage-vnext` 有大量未提交工作（含旧 supply-chain 页组件的修改）；动工前先看 `git status`，不要误覆盖。是否 commit/push 按任务指示，默认不主动推送。
- 验证方式：实际运行页面 + 截图检查 + 交互走查，迭代到规格达成；只看代码不算验证。

### 3.5 Acceptance criteria

**可操作行为（对照 §3.3、§3.6 理解目标）：**

1. 访客能沿 14 天时间线推进/回看；每天的进入都伴随工作对象状态的可解释变化（"为什么变了"可见）。
2. Day 0–5：事实/推断/未知有区分地出现；来源可点开；初次决定需访客本人操作（方案选择、关键未知确认、版本批准），无默认选中。
3. **Day 6 前提失效**：获批方案 visibly 失效，工作 reopen 并回到待处理位置；界面同时呈现"原判断的依据"与"变了什么"；访客重新判断后，对象保留两次决定及其中间过程；执行、回执、后续事件继续进入同一对象。
4. **拆开透镜**：切换后能在场景中区分三层（企业环境 / AutoMage 行为 / 委托边界）；透镜只是标注，不新增另一套叙事。
5. **Replay**：修改一条自主边界并重历同一现实变化，"被打扰 vs 只收到报备"的差异不读解释文字即可感知；页面任何位置不假装这是真实产品配置。
6. 语义不变量抽查：浏览交互控件与业务事件在视觉上可区分；无常驻装饰动画；reduced-motion 下全部功能可用；页面标注覆盖 演示/真实背景/方向 三类。
7. 工程门槛：webpack build 通过；无 TypeScript/ESLint 新增错误；`/contact`、`/market`、首页路由行为不回退。

**理解目标（验证框架，见 §3.6）：**

- **A. Primary comprehension（必须成立）**：访客能否说出 **AutoMage 接手了什么**。
- **B. Platform comprehension（必须成立）**：访客能否区分企业自己原有的环境/规则、AutoMage 承担的行为、企业交给 AutoMage 的自主边界。不成立 = 页面仍会被理解成一套供应链软件。
- **C. Autonomy comprehension（独立指标）**：给一个新的条件变化，访客能否预测"这次 AutoMage 会自己处理，还是回来找我？为什么？"

### 3.6 验证方法与措辞纪律

- 用 RCUT / synthetic persona 做**快速 preflight**（仓库已有 `docs/usability-testing/` 框架与 `ceo-manufacturing` 角色合同可参考），新会话只给业务背景和目标，不给答案提示。
- **不要把结果写成真实客户验证**；不要使用"2/3 通过"这类简单比例门槛作为放行标准。报告写：观察到的理解/误解、失败模式、据此做的修正。
- 理解目标 A/B 是设计判断的硬条件：preflight 中若普遍失败，回到机制修改，而不是改门槛。

---

## 4. 后续阶段（本 slice 之后，按序）

1. **Homepage 重建**：翻阅/追问姿态；一件工作对象的剖面作为理解委托的载体（首屏形态是 hypothesis，见 §2.4/2.5）。Replay/工作对象组件若结构自然，可为其提供基础，但不构成复用义务。
   - **2026-10-07 修订**：首页的局部语言从"轻、静、疏"改为**视觉能量集中**：一处强的 signature stage，其余克制、留白充足（取代 `experience-architecture` §4 中的"首页轻、静、疏"）。首页是三页中品牌表现力最强的一页，信息密度不必与另外两页相同。
   - 演化基底是 8 月版的编排机制（整页像一件工作正在发生、持续状态、路径推进、pinned 舞台、转化时刻、工作可能返回），不是继续修补 9 月的 `SystemHome`。环形只是候选表现形式，可以保留、变形或替换，但不得暗示固定生命周期。
   - 产品身份保持通用，舞台主角可以具体：沿用 Supply Chain 同一件缺料工作，只演最有信息密度的片段，不重演 14 天。
   - 滚动可以推动叙事揭示，不能等同于业务动作（例如签批）；pin 期间要有清楚的进度；向上滚动必须能自然倒回；reduced motion 下叙事仍要成立；手机端使用独立的编排，不是把桌面 SVG 缩小。
   - **2026-10-08 修订（owner 决定）**：首页与 Supply Chain **共享 case，不共享 plot**。
     - 舞台按两个产品主张组织：散乱信息如何成为一件可以被 AutoMage 承接的工作；同一个现实变化，在两种不同委托边界下为什么得到不同结果。不按 Day 0 / 3 / 6 讲故事，不演签批。完整时间、签批、reopen 和自己改规则都留给 Supply Chain。
     - 滚动：pinned stage 直接、连续地响应真实滚动进度，滚动后立即看到变化，不做"滚轮控制的 Carousel"，不等待 scene commit，不吞正常的滚动输入。不用独立的时间线、右侧圆点或底部进度条充当进度；全站恢复克制的原生滚动条。stage 内若仍需局部进度提示，从渲染结果决定最小形式。
     - 舞台之后的一屏只留三件事：什么样的工作适合交给 AutoMage（"供应链只是一个实例"在这里作桥接，不写成防御性说明）；当前真实做到哪里、哪些仍是场景 / 方向；两个出口——"看这件事完整的 14 天"和"说一件你们自己的事"。
2. **Capability 重建**：表达自己的工作 → 委托模板 → 191 Skill 作为参考/证据层的三层结构（taxonomy 是 hypothesis）。终点是"这件工作可能这样配置"的讨论草稿，联系页承接草稿。
3. 历史 spec（`specs/01–09`）在对应阶段重写或标注 superseded；在此之前不得引用它们作为实现依据。

---

## 5. Open Evidence Questions（需要 owner 确认，不阻塞开工）

| # | 问题 | 未确认前的默认处理 |
|---|---|---|
| Q1 | Supply Chain 真实企业背景的可公开程度（企业身份、数据、场景细节） | 采用 §1.5 默认措辞"基于真实企业业务场景重构，页面数据与过程为演示"；不出现企业身份 |
| Q2 | 前提失效事件选定哪个具体变化（供应商交期反悔 / 价格窗口 / 华南仓库存条件） | 实现期自选一个叙事最清晰的；机制层保持通用（原判断依据 + 变化内容 + 变化时间） |
| Q3 | Replay 提供一条还是两条规则变化 | 一条（"变化必须回来确认 ↔ 范围内自行调整+报备"），避免首版稀释核心差异 |
| Q4 | Day 7–14 中"落实"的动作语义（通知/任务/审批链 vs 真实系统写入） | 与产品现实一致：落实 = 对人的动作（任务、通知、回执）；系统写入类演示步骤标注 direction/simulation |

---

## 6. 本 Session 已核对的关键事实（供下一 Session 省去重复调查）

- `/` 现渲染 `SystemHome`（首页），旧 supply-chain 叙事整体位于 `/scenarios/supply-chain`；导航：产品/场景/能力/联系（`MarketChrome.tsx`）。
- `ScenarioWorkbench.tsx` 状态机能力清单见 §3.2；其 `homepage-vnext.ts` 类型系统是当前最完整的 semantic model 参考。
- 已知缺陷：`--color-gate-human`（#1E3A5F）在 `--color-surface-command`（#08111F）上对比度接近零——人类权威色不可见，属于要修的语义倒置。
- RCUT 历史结论（`docs/usability-testing/studies/`，2026-09）：首页优先、场景为证明、Market 为能力层的层级获**方向性**支持（best_effort，非生产级）；Market 直达曾出现被记成"app store"的案例。
- 产品仓库事实：`/root/neko/AutoMage/客制化/automage_agents`（FastAPI + Feishu/OpenClaw 适配器 + 三层角色 RBAC + 日报→汇总→决策 A/B→任务链 + 审计日志），最后提交 2026-06。仅作证据参考，本 slice 不接任何真实后端。

---

## 7. 禁重开清单（fresh session 不得重新讨论）

以下话题在本 Session 已定案，实现中若产生相关冲动，按 frozen 执行或在既定意图内微调：

1. AutoMage 的产品定义 / ontology（工作框架、委托模型、协调非定义）。
2. Narrative Spine 六拍与三页职责、姿态划分。
3. "Record 不是产品身份"、差异化不用"ERP 写死论"、自主边界是配置项而非固定人审规则。
4. 六节点循环（作为固定产品本体 / 生命周期）、粒子动画、统一 section 模板的回归。旧环的表现资产可以重新赋义复用，见 §3.2 的 2026-10-07 修订。
5. Skill = 专业知识的窄化；191 平铺为主体；Market 购物车化。
6. 本文件 §2 列出的 Design Hypotheses 可以调整，但调整结果不得反向写成新的全局 Design System 规则。

若发现 frozen 决策与真实代码/物理上无法兼容：先核事实 → 在既定意图内寻找替代 → 仍无法解决才作为 blocker 上报 owner，并附最小复现与两个候选方案。
