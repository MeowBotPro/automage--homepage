# 1. 品牌核心 Brand Core

---

## 1.1 品牌定位

### 一句话定义

AutoMage 是组织信息流 OS -- 将前线噪声压缩为结构化判断，将决策转化为任务，将执行结果回流到数据闭环。

> **证据来源**: `visual-language-spec.md` L5-L7: "AutoMage is not a chat tool or project manager. It's an **organizational information flow OS** that compresses frontline noise into structured judgment, converts decisions into tasks, and feeds task outcomes back into the data loop."

### 三个"不是"

| 排除项 | 说明 |
|--------|------|
| **不是聊天工具** | 不做对话式 AI 助手，不依赖用户主动提问；而是系统主动采集、压缩、推送信号 |
| **不是项目管理器** | 不做任务看板和排期工具；而是从信息源头到决策输出的完整闭环 |
| **不是 BI 仪表盘** | 不做静态数据可视化；而是带有信号压缩、AI 洞察和人类确认门控的动态决策流 |

### 核心智模型：The Loop

六节点闭环，是 AutoMage 品牌的核心叙事骨架：

```
Signal -> Compress -> Review -> Decide -> Execute -> Learn
   ^                                                  |
   └──────────────────────────────────────────────────┘
```

> **证据来源**: `design-tokens.json` L151-L159 定义了 `loopRail.nodes` 的 6 个节点（Signal/Compress/Review/Decide/Execute/Learn），每个节点映射到页面的一个 section。
>
> **代码落地**: `InfoLoopSection.tsx` L17-L23 定义了 6 个 `LOOP_NODES`（Staff/AI/Manager/Dream/Boss/Task），以圆形路径动画实现信息流动叙事。
>
> **命名说明**: 概念节点名称（Signal/Compress/Review/Decide/Execute/Learn）用于品牌叙事和对外文档，代码变量名（Staff/AI/Manager/Dream/Boss/Task）为技术实现层。两者的映射关系通过 `design-tokens.json` 的 `loopRail.nodes` 配置。

---

## 1.2 目标受众

### 用户画像

- **角色**: 中国企业 Boss / 决策者 / 高管
- **特征**: 每天面对大量一线信息（日报、群聊、邮件、会议纪要），需要快速做出高质量判断
- **痛点**: 信息在层层汇报中失真、决策延迟、执行无法追踪

> **证据来源**: `homepage-status.md` L9-L10: "目标受众为 Boss/决策者。核心信息：重塑组织管理的信息逻辑，让一线信息直达决策层。"

### 决策场景

1. **日常管理**: 从散落的一线信号（日报、客诉、预算异常）中快速识别需要干预的问题
2. **战略判断**: 在 AI 压缩后的结构化简报上做出选择（A/B 方案）
3. **执行监督**: 确认决策后，自动分配任务并追踪执行回流

### 信息需求特征

- **需要压缩**: 信息过载，需要 AI 将噪声提炼为 brief
- **需要结构化**: 散落的信息碎片（群聊、Excel、会议纪要）需要转化为决策卡
- **需要控制权**: AI 只能建议，最终确认权必须在人类手中

> **证据来源**: `CompareSection.tsx` L7-L16 列出了 8 种组织噪声碎片（日报、群聊、Excel、会议纪要、口头传达、邮件、钉钉、周报），L19-L23 展示了压缩后的 3 张决策卡（责任人、截止日、风险等级、行动项）。
>
> **证据来源**: `SecuritySection.tsx` L192-L193: 标题文案 "AI 可以建议，但不能越权。"；L204: "系统负责生成选项，人负责做决定。"

---

## 1.3 品牌调性

### 5 个关键词

| 关键词 | 定义 | 反面示例（禁止） |
|--------|------|------------------|
| **权威** (Authoritative) | 系统像一个可靠的指挥中枢，用数据和结构说话，不用感叹号和情绪化表达 | "超级好用！""快来试试！""革命性创新！" |
| **克制** (Restrained) | 视觉上极简留白、信息密度适中，每个元素都有存在的理由 | 花哨渐变、装饰性插画、满屏 CTA 按钮 |
| **精密** (Precise) | 数据展示精确到细节（责任人、截止日、风险等级），语言措辞严谨 | 模糊的"提升效率""降本增效"等空话 |
| **流动** (Flowing) | 信息从噪声到决策的旅程，用运动和连接感来表达 | 静态堆积的卡片、孤立的页面板块 |
| **信任** (Trustworthy) | 安全边界清晰，人类确认门控，审计可追溯 | 隐瞒 AI 权限边界、"全自动化"承诺 |

### 语气规则

**该说的**:
- 用陈述句描述事实和能力："AI 压缩信息，管理者只做判断"
- 用数据和场景说话："今天提交了 23 条一线记录"
- 用结构化表达展示决策："责任人 / 截止 / 风险 / 行动"
- 用系统术语建立专业感："Signal intake / Compressing / Loop active"

**不该说的**:
- 不用夸张修饰语："颠覆""革命""前所未有的"
- 不用情感呼吁："别再错过""赶紧上车"
- 不用模糊承诺："全面提升""一站式解决"
- 不用对话式 AI 腔："嗨！让我来帮你""我是你的 AI 助手"

> **证据来源**: 代码中所有文案均为陈述式、数据化表达：
> - `HeroSection.tsx` L334: "当 AI 接管信息处理，人回归判断本身"
> - `CompareSection.tsx` L150: "从噪声到决策"
> - `InfoLoopSection.tsx` L296: "信息如何在你的组织中流动"
> - `ValueCardsSection.tsx` L233: "你关心的，我们已经想过了"
> - `SecuritySection.tsx` L204: "系统负责生成选项，人负责做决定"

### 文案风格指南

| 层级 | 风格 | 示例（代码中实际文案） |
|------|------|----------------------|
| **页面标题** | 简洁、权威、6-8 字 | "从噪声到决策"、"信息如何在你的组织中流动" |
| **区段副标题** | 补充说明、数据感 | "六个节点，一个闭环" |
| **正文** | 陈述句、具体场景 | "一线信息直达决策层，不经过层层过滤" |
| **系统/数据** | 英文技术术语、mono 字体 | "3 signals compressed into 1 decision brief"、"Signal intake" |
| **按钮 CTA** | 动作导向、不煽情 | "申请内测"、"预约演示"（非"立即体验""免费试用"） |

> **证据来源**:
> - 按钮文案来自 `CommandHeader.tsx` L355 和 L378: "预约演示"、"申请内测"
> - 系统文本使用 mono 字体：`CommandHeader.tsx` L316, `HeroSection.tsx` L96

---

## 1.4 色彩语义映射

### Primary: #1E3A5F -- 权威 / 决策 / 人类确认

| 属性 | 值 |
|------|-----|
| HEX | `#1E3A5F` |
| OKLCH | `oklch(0.25 0.04 250)` |
| CSS 变量 | `--color-brand-primary` |
| 语义 | 深海蓝，代表人类权威、决策层、不可动摇的最终确认 |
| 使用场景 | Hero 标题渐变起点、CTA 按钮背景、双密钥门控中 Human 侧颜色、导航 header 文字 |

> **证据来源**:
> - `globals.css` L5: `--color-brand-primary: #1E3A5F`
> - `design-tokens.json` L7-L8: `"navy": { "$value": "oklch(0.25 0.04 250)", "$description": "Primary brand -- deep navy, authority and precision" }`
> - `visual-language-spec.md` L234: "Brand navy (#1E3A5F): Primary authority -- headers, human-side elements"
> - `globals.css` L47: `--color-gate-human: #1E3A5F` -- Gate 颜色中专用于人类确认侧
> - `HeroSection.tsx` L313: 标题渐变 `linear-gradient(135deg, #1E3A5F 0%, #3B82F6 100%)`

### Accent: #3B82F6 -- 连接 / 活跃 / AI 建议

| 属性 | 值 |
|------|-----|
| HEX | `#3B82F6` |
| OKLCH | `oklch(0.55 0.18 260)` |
| CSS 变量 | `--color-brand-accent` |
| 语义 | 信号蓝，代表 AI 的活跃连接状态、建议的传递、节点间的路径 |
| 使用场景 | Loop 路径、活跃节点、信号状态、AI 侧 Gate 颜色、品牌边框、连接线 |

> **证据来源**:
> - `globals.css` L6: `--color-brand-accent: #3B82F6`
> - `design-tokens.json` L12-L13: `"blue": { "$value": "oklch(0.55 0.18 260)", "$description": "Accent brand -- signal blue, active/connected state" }`
> - `globals.css` L32-37: Loop Rail 的所有路径和节点颜色均基于 `#3B82F6`（不同透明度）
> - `globals.css` L46: `--color-gate-ai: #3B82F6` -- Gate 颜色中专用于 AI 建议侧
> - `globals.css` L40: `--color-signal-normal: #3B82F6` -- 正常信号状态色

### Cyan: #38BDF8 -- 数据流动 / 光点 / 进程

| 属性 | 值 |
|------|-----|
| HEX | `#38BDF8` |
| OKLCH | `oklch(0.70 0.12 220)` |
| CSS 变量 | `--color-brand-cyan` |
| 语义 | 高亮光点，代表数据正在流动、进程正在推进、信号粒子 |
| 使用场景 | Loop 轨道上的光点粒子（particle）、活跃节点发光、流动指示 |

> **证据来源**:
> - `globals.css` L8: `--color-brand-cyan: #38BDF8`
> - `design-tokens.json` L18-L19: `"cyan": { "$value": "oklch(0.70 0.12 220)", "$description": "Signal highlight -- light point on loop rail, active node glow" }`
> - `globals.css` L36: `--color-loop-particle: #38BDF8` -- Loop 轨道粒子颜色
> - `InfoLoopSection.tsx` L407-414: 光点粒子和尾迹均使用 `var(--color-loop-particle)`（即 Cyan）

### Accent Alt: #6366F1 -- 辅助高亮 / 极少量视觉分层

| 属性 | 值 |
|------|-----|
| HEX | `#6366F1` |
| OKLCH | `oklch(0.50 0.20 280)` |
| CSS 变量 | `--color-brand-accent-alt` |
| 语义 | 靛蓝，谨慎辅助高亮，极少量视觉分层。仅用于 LogoMarquee decision 节点等少量场景 |
| 使用场景 | LogoMarquee decision 节点、极少量视觉分层 |
| 禁止场景 | 不作主色、不作大面积背景、不替代 brand-accent |

> **证据来源**:
> - `globals.css` L7: `--color-brand-accent-alt: #6366F1`
> - `LogoMarquee.tsx` decision 节点使用此色

### Dark Surface: #0F172A / #0B1628 -- 系统内部 / 技术面 / 仪表盘

| 属性 | 值 |
|------|-----|
| HEX | `#0F172A`（dark）/ `#0B1628`（deep） |
| CSS 变量 | `--color-surface-dark` / `--color-surface-deep` |
| 语义 | 系统内部视图，代表"正在运转"的技术面，如仪表盘、控制台、Inspector 面板 |
| 使用场景 | Hero Signal Console 背景、InfoLoop Inspector 面板、Pipeline 节点容器、Header 毛玻璃底色 |

> **证据来源**:
> - `globals.css` L22-L23: `--color-surface-dark: #0F172A` / `--color-surface-deep: #0B1628`
> - `design-tokens.json` L34-L35: `"dark": { "$description": "Dark section background" }` / `"deep": { "$description": "Deepest dark background" }`
> - `HeroSection.tsx` L82: Signal Console 背景 `background: 'var(--color-surface-deep)'`
> - `InfoLoopSection.tsx` L279: Loop 区域使用 `background: 'var(--color-surface-deep)'`
> - `InfoLoopSection.tsx` L442: Inspector 面板 `background: 'var(--color-surface-dark)'`
> - `SecuritySection.tsx` L221: Pipeline 节点容器 `background: 'var(--color-surface-dark)'`
> - `CommandHeader.tsx` L229-230: Header 背景 `rgba(15, 23, 42, 0.78)` 即 #0F172A 的半透明

### 信号色体系（辅助）

| 颜色 | HEX | 语义 | 使用场景 |
|------|-----|------|---------|
| Normal | `#3B82F6` | 正常信号 | 日报提交等常规状态 |
| Warning | `#F59E0B` | 预警信号 | 风险升高、预算超阈值 |
| Risk | `#EF4444` | 高危信号 | 决策卡高风险标签、错误状态点 |
| Success | `#22C55E` | 完成信号 | 闭环完成、已确认、Loop closed |

> **证据来源**: `globals.css` L40-43 定义了 4 种信号色；`CompareSection.tsx` L21-22 决策卡使用 `var(--color-signal-risk)` / `var(--color-signal-warning)` / `var(--color-signal-success)` 标注风险等级。

### Gate 色彩体系（权限语义）

| 颜色 | HEX | 语义 | 使用场景 |
|------|-----|------|---------|
| AI 侧 | `#3B82F6` | AI 建议能力 | Pipeline 第一阶段、AI Logo |
| Human 侧 | `#1E3A5F` | 人类确认权威 | Pipeline 第三阶段、Human Logo |
| Unlocked | `#22C55E` | 门控通过 | Pipeline 第四阶段（执行已确认） |
| Locked | `rgba(100, 116, 139, 0.3)` | 门控锁定 | 待确认状态 |

> **证据来源**: `globals.css` L46-49 定义了 Gate 四色；`SecuritySection.tsx` L105-110 的 `PIPELINE_STAGES` 使用 `var(--color-gate-ai)` 和 `var(--color-gate-human)` 分别标记 AI 和人类阶段。

---

## 1.5 视觉隐喻体系

### The Loop 的完整叙事

The Loop 不仅是页面结构，更是 AutoMage 的世界观：

**起点**: 组织中的一线人员每天产生大量原始信号（日报、群聊、邮件、会议纪要）。
**压缩**: AI 将散落的噪声碎片压缩为结构化的决策简报（责任、截止、风险、行动）。
**审阅**: 管理者审阅结构化信息，标记需要补充的内容。
**决策**: AI 生成 A/B 选项，Boss 选择并设定优先级。
**执行**: 决策自动转化为任务，分配到具体负责人。
**回流**: 执行结果回流到系统，形成新一轮信号输入。

> **证据来源**: `InfoLoopSection.tsx` L17-L23 中 6 个节点的 `inspectorText` 完整描述了这一叙事：
> - Staff: "今天提交了 23 条一线记录"
> - AI: "识别 4 个风险、2 个依赖、1 个异常"
> - Manager: "审阅通过 3 条，标记 1 条需补充"
> - Dream: "生成 A/B 两个决策选项"
> - Boss: "选择 B，并设定优先级"
> - Task: "自动生成 5 个任务，分配到 3 人"

### 信息流从噪声到决策的视觉旅程

| 阶段 | 视觉表现 | 视觉属性 |
|------|---------|---------|
| **噪声（左）** | 6-8 张散落小卡片，随机角度，灰色调 | 倾斜 `rotate(+-5deg)`、`var(--color-surface-elevated)` 背景、`var(--color-text-tertiary)` 文字 |
| **压缩（中心）** | 同心圆 + 渐变核心球 | 3 层环形由外到内透明度递增（0.1 -> 0.3），中心 `linear-gradient(#1E3A5F, #3B82F6)` |
| **决策（右）** | 3 张结构化卡片，左侧蓝色竖线 | `borderLeft: 3px solid var(--color-brand-accent)`，白色卡片背景 |

> **证据来源**:
> - `CompareSection.tsx` L7-L16: 噪声碎片定义（8 个，含随机 x/y/rotate）
> - `CompareSection.tsx` L193-220: 核心压缩区 3 层同心圆 + 渐变中心球
> - `CompareSection.tsx` L231-266: 决策卡结构（责任人 + 风险标签 + 截止 + 行动）

### 每个 Section 如何映射 Loop 节点

| Loop 节点 | Section | 视觉角色 | 证据 |
|-----------|---------|---------|------|
| **Signal** (信号进入) | `section-hero` | Hero 区的 Signal Console -- 信号控制台，展示实时信号芯片和处理状态 | `HeroSection.tsx` L9-13: 信号芯片（日报提交/风险升高/决策待确认） |
| **Compress** (噪声压缩) | `section-compare` | 噪声到决策的三区转换 -- 左散乱 / 中压缩 / 右结构化 | `CompareSection.tsx` 整体：3-zone 布局实现视觉转换 |
| **Review** (审阅确认) | `section-loop` | 信息闭环模拟器 -- 光点沿环形轨道流动，每个节点亮起时显示审阅内容 | `InfoLoopSection.tsx`: 圆形路径 + 6 节点 + Inspector 面板 |
| **Decide** (决策输出) | `section-value` | 价值卡片 -- "更少失真""更快判断""可追踪执行" 三大决策价值 | `ValueCardsSection.tsx` L72-88: 3 张价值卡 |
| **Execute** (执行确认) | `section-security` | 安全门控 -- AI 建议 -> 策略校验 -> 人类确认 -> 执行释放 | `SecuritySection.tsx` L105-110: 4 阶段 Pipeline |
| **Learn** (回流学习) | `section-cta` | 闭环收口 -- "关闭信息闭环" CTA + 粒子网络背景隐喻数据回流 | 页面底部 CTA，Loop Rail 的最终节点 |

> **证据来源**: `design-tokens.json` L151-L159 明确定义了每个节点到 section 的映射关系（`sectionId` 字段）。`CommandHeader.tsx` L27-32 的 `STATUS_MAP` 也建立了 section 到 Loop 状态的对应（hero -> "Signal intake", compare -> "Compressing", loop -> "Loop active" 等）。

---

## 1.6 品牌一致性红线

### 绝对禁止的视觉元素

| 禁止项 | 原因 | 替代方案 |
|--------|------|---------|
| **通用 SaaS 图标**（火箭、齿轮、拼图） | 与竞品（飞书、钉钉、Notion）混淆，丧失辨识度 | 使用代码中已有的 SVG Glyph 系统（AI Logo、Human Logo、Policy Gate、Execution Ledger） |
| **AI 大脑 / 神经网络插画** | 暗示"AI 替代人类"，与品牌核心"AI 能建议但不能越权"矛盾 | 使用六角几何 + 轨道旋转的 AI Logo（`SecuritySection.tsx` L11-19: 六边形 + 中心圆点 + 3 个轨道点） |
| **对话气泡** | 暗示"聊天工具"定位，与"不是聊天工具"的品牌排除矛盾 | 使用 Pipeline 流程图和环形 Loop 路径来表达信息流动 |
| **人物照片/团队照** | 与产品"系统/OS"调性不匹配，分散对信息流叙事的注意力 | 使用抽象的信号图标和数据图表 |
| **鲜艳渐变 / 霓虹色** | 破坏"克制"调性，与精密/权威感冲突 | 仅使用 `#1E3A5F -> #3B82F6` 的单一品牌渐变 |

> **证据来源**: 代码中所有视觉元素均为自定义 SVG 手绘风格，无任何通用图标库（如 FontAwesome、Lucide）。具体见 `SecuritySection.tsx` L8-101 的 6 个 SVG Glyph 组件和 `ValueCardsSection.tsx` L8-63 的 3 个 Mini Diagram 组件。

### 颜色使用禁区

| 禁区 | 规则 | 违规示例 |
|------|------|---------|
| **Navy (#1E3A5F) 不用于 AI 侧** | Navy 是人类权威色，专属于人类确认、决策层 | 不应将 Navy 用于 AI 建议节点、AI 状态指示 |
| **Blue (#3B82F6) 不用于人类确认** | Blue 是 AI 连接色，专属于 AI 建议、信号路径 | 不应将 Blue 用于"人类已确认"状态（应使用 Green） |
| **禁止纯灰** | 中性色使用 Slate 色系（带蓝色调），不使用纯灰 | 不使用 `#808080`、`#999999` 等纯灰色 |
| **禁止暖色大面积** | 暖色（amber/red）仅用于信号警告，不做装饰性使用 | 不应用 amber/red 做标题色、背景色、CTA 按钮色 |
| **Cyan (#38BDF8) 不做主色** | Cyan 仅用于光点粒子和进程高亮，不做大面积使用 | 不应用 Cyan 做标题色、Card 背景、品牌标识色 |

> **证据来源**:
> - `visual-language-spec.md` L234-238 明确区分了 navy（authority/human-side）和 blue（active/connected）的语义
> - `globals.css` L46-47: `--color-gate-ai: #3B82F6` 与 `--color-gate-human: #1E3A5F` 的严格分离
> - `design-tokens.json` L52-55: 所有中性色基于 oklch 色彩空间，hue 角 260（偏蓝），不含纯灰

### 动画使用禁区

| 禁区 | 规则 | 违规示例 |
|------|------|---------|
| **禁止装饰性动画** | 每个动画必须传达信息流语义，不能纯粹为了"好看" | 粒子雨、几何粒子漂浮、纯装饰性背景动画 |
| **禁止循环弹跳** | 禁止 `bounce` 和 `elastic` 缓动函数。`back.out` 仅限品牌标识特殊动画（如 Logo 眼睛弹出、Footer Seal 节点弹出），其他场景禁止使用 | 不在品牌标识场景中使用 `back.out`、不使用 `bounce`、`elastic` |
| **禁止闪烁/抖动** | 品牌调性为"克制"和"精密"，闪烁和抖动破坏信任感 | 不使用 `shake`、`flash`、`blink`（StatusDot 的 pulse 除外，其表达系统活跃状态） |
| **必须有 reduced-motion 回退** | 所有动画在 `prefers-reduced-motion: reduce` 下必须禁用，展示最终态 | 不允许没有 reduced-motion 处理的动画 |

> **证据来源**:
> - `visual-language-spec.md` L252: "No decoration: Every animation must communicate information flow, not just look nice"
> - `globals.css` L236-245: 完整的 `prefers-reduced-motion: reduce` 回退规则
> - `visual-language-spec.md` L251: "Reduced motion: All animations have prefers-reduced-motion fallback"
> - 代码中所有动画组件均实现了 reduced-motion 检测（`HeroSection.tsx` L235, `CompareSection.tsx` L36, `InfoLoopSection.tsx` L63, `SecuritySection.tsx` L131 等）

---

## 附录：品牌核心证据索引

| 证据文件 | 关键内容 | 行号 |
|----------|---------|------|
| `globals.css` | 所有 CSS 变量定义（颜色、字体、间距、动效、Loop Rail） | L3-L90 |
| `design-tokens.json` | W3C Design Token 标准定义，含语义描述 | 完整文件 |
| `visual-language-spec.md` | 品牌本质、Loop 叙事、Section 设计、色彩/排版/动效规则 | 完整文件 |
| `HeroSection.tsx` | 标题文案、渐变色、Signal Console、CTA 按钮 | L6, L313, L334, L353 |
| `CompareSection.tsx` | 噪声碎片、决策卡、核心压缩区 | L7-L23, L193-L266 |
| `InfoLoopSection.tsx` | 6 个 Loop 节点定义、Inspector 面板、闭环完成语 | L17-L23, L296, L510 |
| `SecuritySection.tsx` | Pipeline 4 阶段、双密钥门控、3 张信任卡 | L105-L116, L259-L285 |
| `CommandHeader.tsx` | Logo 系统、导航项、状态芯片、CTA 按钮 | L36-L84, L13-L18, L27-L32, L355-L378 |
| `ValueCardsSection.tsx` | 3 张价值卡（更少失真/更快判断/可追踪执行）、SVG 系统图 | L72-L88, L8-L63 |
| `layout.tsx` | 品牌名、语言 `zh-CN`、字体加载 | L24, L33 |
| `homepage-status.md` | 项目定位、设计规范、12 板块框架 | L9-L49 |
