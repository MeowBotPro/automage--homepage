# 2. 视觉系统 Visual System

---

## 2.1 色彩系统 Color System

### 2.1.1 品牌色 Brand Colors

品牌色是 AutoMage 视觉系统的基石，每个颜色承载明确的语义角色，不可互换。

| Token 名称 | HEX | OKLCH | CSS Variable | 语义 | 使用规则 | 禁止场景 |
|------------|-----|-------|--------------|------|----------|---------|
| `brand-primary` | `#1E3A5F` | `oklch(0.25 0.04 250)` | `--color-brand-primary` | 深海蓝 -- 人类权威、决策层、不可动摇的最终确认 | Hero 标题渐变起点、CTA 按钮背景、Gate Human 侧、导航 header 文字 | 不可用于 AI 建议节点、AI 状态指示、装饰性背景 |
| `brand-accent` | `#3B82F6` | `oklch(0.55 0.18 260)` | `--color-brand-accent` | 信号蓝 -- AI 活跃连接、建议传递、节点间路径 | Loop 路径、活跃节点、信号状态、AI 侧 Gate、品牌边框 | 不可用于"人类已确认"状态（应用 Green），不作大面积装饰色 |
| `brand-accent-alt` | `#6366F1` | `oklch(0.50 0.20 280)` | `--color-brand-accent-alt` | 靛蓝 -- 谨慎使用的辅助高亮色 | LogoMarquee decision 节点、极少量视觉分层 | 不作主色、不作大面积背景、不替代 brand-accent |
| `brand-cyan` | `#38BDF8` | `oklch(0.70 0.12 220)` | `--color-brand-cyan` | 高亮光点 -- 数据流动、进程推进、信号粒子 | Loop 轨道粒子、活跃节点发光、流动指示 | 不做标题色、Card 背景、品牌标识色、大面积使用 |

> **证据来源**: `globals.css` L5-L8, `design-tokens.json` L6-L21, `01-brand-core.md` 1.4 色彩语义映射

---

### 2.1.2 语义色 Semantic Colors

#### Text 文本色

| Token 名称 | HEX | CSS Variable | 语义 | 使用场景 |
|------------|-----|--------------|------|---------|
| `text-primary` | `#F1F5F9` | `--color-text-primary` | 暗场最高优先级文本 | 标题、正文主色、强调文字 |
| `text-secondary` | `#CBD5E1` | `--color-text-secondary` | 暗场正文辅助色 | 正文段落、描述文字 |
| `text-tertiary` | `#94A3B8` | `--color-text-tertiary` | 暗场低优先级文本 | 标注、标签、元数据、placeholder |
| `text-on-dark` | `#F1F5F9` | `--color-text-on-dark` | 深色背景上的主文本 | Hero 区域、InfoLoop 区域、Security 深色面板 |
| `text-on-dark-muted` | `#94A3B8` | `--color-text-on-dark-muted` | 深色背景上的次文本 | 深色区域的辅助信息、系统状态文本、console 标注 |

> **证据来源**: `globals.css` L11-L15, `design-tokens.json` L24-L28

#### Surface 表面色

| Token 名称 | HEX | CSS Variable | 语义 | 使用场景 |
|------------|-----|--------------|------|---------|
| `surface-page` | `#08111F` | `--color-surface-page` | 页面主暗场背景 | body 背景、全站统一暗场基底 |
| `surface-card` | `#0F172A` | `--color-surface-card` | 暗色卡片/控制台面板 | 决策卡、价值卡、表单面板 |
| `surface-elevated` | `#0B1628` | `--color-surface-elevated` | 暗场提升/凹陷区域 | 代码块、次级面板、噪声碎片 |
| `surface-tinted` | `#10203A` | `--color-surface-tinted` | 品牌色着色暗面 | 选中态、数据卡片、激活项背景 |
| `surface-dark` | `#0F172A` | `--color-surface-dark` | 深色区域背景 | Hero Signal Console、InfoLoop Inspector、Pipeline 节点容器 |
| `surface-deep` | `#0B1628` | `--color-surface-deep` | 最深背景层 | Hero 全幅背景、Loop 区域全幅背景 |
| `surface-command` | `#08111F` | `--color-surface-command` | 全站暗场叙事底色 | body / main wrapper 的连续暗色画布 |
| `surface-command-soft` | `#0A1424` | `--color-surface-command-soft` | 暗场内部亮度过渡 | 仅用于局部面板、控件或旧稿兼容；禁止作为整屏 section 背景 |
| `surface-panel` | `rgba(15,23,42,.78)` | `--color-surface-panel` | 半透明控制台面板 | 信号残影、field report、轻量容器 |
| `surface-panel-strong` | `rgba(15,23,42,.94)` | `--color-surface-panel-strong` | 高优先级暗色面板 | 决策 brief、表单、FAQ 答案 |

#### 连续暗场分段规则

当前官网不再用 `surface-command` / `surface-command-soft` / `surface-deep` 的全宽色块交替来分段。所有主体 section 默认使用透明背景，继承 `surface-page #08111F` 这一张连续暗色画布；重点区段通过 `.am-narrative-section` 的容器内 hairline、极轻顶部亮度、局部面板、内容密度和品牌蓝路径建立节奏。大面积径向光源必须落在 section 内部并充分羽化，不能从 section 顶部被硬裁切。

> **证据来源**: `globals.css` Surface tokens, `HeroSection.tsx`, `InfoLoopSection.tsx`, `StorySection.tsx`

#### Border 边框色

| Token 名称 | 值 | CSS Variable | 语义 | 使用场景 |
|------------|-----|--------------|------|---------|
| `border-default` | `rgba(148, 163, 184, 0.16)` | `--color-border-default` | 暗场最轻边框 | 卡片默认边框、内容分隔 |
| `border-strong` | `rgba(148, 163, 184, 0.28)` | `--color-border-strong` | 暗场强调边框 | 输入框聚焦、hover 态边框 |
| `border-brand` | `rgba(59, 130, 246, 0.36)` | `--color-border-brand` | 品牌色边框 | 选中态、激活态卡片、品牌强调 |

> **证据来源**: `globals.css` L26-L28, `design-tokens.json` L39-L41

#### Signal 信号色

信号色用于 Loop 系统中的状态标注，代表组织信息流中信号的风险等级。

| Token 名称 | HEX | CSS Variable | 语义 | 使用场景 | 在暗色背景上的对比度 (vs #0F172A) |
|------------|-----|--------------|------|---------|------|
| `signal-normal` | `#3B82F6` | `--color-signal-normal` | 正常信号 | 日报提交等常规状态 | 4.85:1 (AA) |
| `signal-warning` | `#F59E0B` | `--color-signal-warning` | 预警信号 | 风险升高、预算超阈值 | 8.31:1 (AAA) |
| `signal-risk` | `#EF4444` | `--color-signal-risk` | 高危信号 | 决策卡高风险标签、错误状态 | 3.76:1 (AA-lg) |
| `signal-success` | `#22C55E` | `--color-signal-success` | 完成信号 | 闭环完成、已确认、Loop closed | 7.83:1 (AAA) |

> **证据来源**: `globals.css` L40-L43, `design-tokens.json` L53-L56, `CompareSection.tsx` L21-L22

#### Gate 门控色

Gate 色传达权限语义 -- AI 建议与人类确认的视觉边界。

| Token 名称 | HEX | CSS Variable | 语义 | 使用场景 |
|------------|-----|--------------|------|---------|
| `gate-ai` | `#3B82F6` | `--color-gate-ai` | AI 建议侧 | Pipeline 第一阶段、AI Logo |
| `gate-human` | `#1E3A5F` | `--color-gate-human` | 人类确认侧 | Pipeline 第三阶段、Human Logo |
| `gate-unlocked` | `#22C55E` | `--color-gate-unlocked` | 门控通过 | Pipeline 第四阶段（执行已确认） |
| `gate-locked` | `rgba(100, 116, 139, 0.3)` | `--color-gate-locked` | 门控锁定 | 待确认状态 |

> **证据来源**: `globals.css` L46-L49, `design-tokens.json` L58-L62, `SecuritySection.tsx` L105-L110

#### Loop Rail 轨道色

Loop Rail 色系构成信息闭环模拟器的视觉骨架 -- 从静默节点到活跃粒子的完整色彩链。

| Token 名称 | 值 | CSS Variable | 语义 | 使用场景 |
|------------|-----|--------------|------|---------|
| `loop-node-inactive` | `rgba(59, 130, 246, 0.15)` | `--color-loop-node-inactive` | 静默节点 | 未激活的 Loop 节点 |
| `loop-node-active` | `#3B82F6` | `--color-loop-node-active` | 激活节点 | 当前播放的 Loop 节点 |
| `loop-node-glow` | `rgba(59, 130, 246, 0.3)` | `--color-loop-node-glow` | 节点发光 | 激活节点的脉冲光晕 |
| `loop-path` | `rgba(59, 130, 246, 0.10)` | `--color-loop-path` | 轨道路径 | 连接节点的轨道线 |
| `loop-path-active` | `rgba(59, 130, 246, 0.4)` | `--color-loop-path-active` | 活跃路径 | 光点经过后的路径高亮 |
| `loop-particle` | `#38BDF8` | `--color-loop-particle` | 信号粒子 | 沿轨道移动的光点 |
| `loop-particle-trail` | `rgba(59, 130, 246, 0.3)` | `--color-loop-particle-trail` | 粒子尾迹 | 光点后方的拖尾效果 |

> **证据来源**: `globals.css` L31-L37, `design-tokens.json` L44-L50, `InfoLoopSection.tsx` L407-L414

---

### 2.1.3 色彩对比度矩阵

基于 WCAG 2.1 AA 标准计算（正常文本 >= 4.5:1, 大文本 >= 3.0:1）。所有比值基于实际 HEX 值通过 sRGB 相对亮度公式计算。

#### 暗场主背景组合

| 前景色 | 背景色 | 对比度 | WCAG 判定 | 使用场景 |
|--------|--------|--------|-----------|---------|
| `#F1F5F9` (text-primary / on-dark) | `#08111F` (surface-command) | **17.26:1** | AAA | 全站主标题、正文主文本 |
| `#CBD5E1` (text-secondary) | `#08111F` (surface-command) | **12.74:1** | AAA | section 描述、表单辅助说明 |
| `#94A3B8` (text-tertiary / muted) | `#08111F` (surface-command) | **7.38:1** | AA | 标签、元数据、placeholder |
| `#F1F5F9` (on-dark) | `#0F172A` (surface-card) | **16.30:1** | AAA | 暗色卡片标题、FAQ 答案标题 |
| `#94A3B8` (muted) | `#0F172A` (surface-card) | **6.96:1** | AA | 暗色卡片正文、字段说明 |
| `#3B82F6` (accent) | `#08111F` (surface-command) | **5.14:1** | AA | CTA、路径、激活态文字 |
| `#38BDF8` (cyan) | `#08111F` (surface-command) | **8.83:1** | AAA | 粒子、瞬时高亮 |
| `#60A5FA` (glyph stroke) | `#08111F` (surface-command) | **7.44:1** | AA | SVG Glyph 描边和轨道点 |

#### 深色背景组合

| 前景色 | 背景色 | 对比度 | WCAG 判定 | 使用场景 |
|--------|--------|--------|-----------|---------|
| `#F1F5F9` (on-dark) | `#0F172A` (dark) | **16.30:1** | AAA | 深色区域主文本 |
| `#F1F5F9` (on-dark) | `#0B1628` (deep) | **16.53:1** | AAA | 最深区域主文本 |
| `#94A3B8` (on-dark-muted) | `#0F172A` (dark) | **6.96:1** | AA | 深色区域辅助文本 |
| `#94A3B8` (on-dark-muted) | `#0B1628` (deep) | **7.06:1** | AA | 最深区域辅助文本 |
| `#3B82F6` (accent) | `#0F172A` (dark) | **4.85:1** | AA | accent 在暗色背景上的文字 |
| `#38BDF8` (cyan) | `#0F172A` (dark) | **8.33:1** | AAA | 粒子色在暗背景上的可见性 |
| `#F59E0B` (warning) | `#0F172A` (dark) | **8.31:1** | AAA | 警告信号在暗色区域 |
| `#22C55E` (success) | `#0F172A` (dark) | **7.83:1** | AAA | 成功信号在暗色区域 |
| `#60A5FA` | `#0F172A` (dark) | **7.02:1** | AA | 硬编码色在暗背景上的安全 |

#### 历史浅底 / 白底使用警告

官网暗场叙事改版后不再把 `#FFFFFF` / `#FAFBFC` 作为 section 背景。以下组合仅用于审查旧稿、品牌 glyph 浅色填充或外部物料导出，不作为当前官网主界面方案。

| 前景色 | 背景色 | 对比度 | WCAG 判定 | 问题说明 |
|--------|--------|--------|-----------|---------|
| `#3B82F6` (accent) | `#FFFFFF` | **3.68:1** | AA-lg | 白底上仅可用于大文本/粗线，不可作正文色 |
| `#60A5FA` | `#FFFFFF` | **2.54:1** | FAIL | 不可用于白色背景上的文字或细线描边 |
| `#93C5FD` | `#FFFFFF` | **1.80:1** | FAIL | 不可用于白色背景上的任何元素 |
| `#22C55E` (success) | `#FFFFFF` | **2.28:1** | FAIL | 不可用于白色背景上的文字，仅作图标色或暗色区域使用 |

---

### 2.1.4 硬编码颜色统一方案

以下是组件中散落的硬编码颜色，以及对应的统一 token 映射。

#### SecuritySection SVG Glyph 系统

SecuritySection 的 6 个 SVG Glyph（AI Logo, Human Logo, Policy Gate, Execution Ledger, Approval Flow, Data Path）使用了大量硬编码蓝色色阶。

| 硬编码颜色 | 出现位置 | 映射 Token | 说明 |
|------------|---------|-----------|------|
| `#60A5FA` | AI Logo (stroke, fill), Human Logo (stroke), Policy Gate (stroke), Approval Flow (dot, bridge glow) | `var(--color-brand-accent)` 或新建 `--color-accent-light` | `#60A5FA` 是 `#3B82F6` 的 400 级变体，比 brand-accent (#3B82F6) 更亮。在 SVG 描边中用于表现"AI 侧发光"的视觉层次。建议保留为 SVG 专用语义 token `--color-glyph-stroke` |
| `#93C5FD` | AI Logo (orbit dots), Human Logo (sub-stroke), Policy Gate (scan line), Ledger (lines), Approval Flow (dot) | 新建 `--color-glyph-stroke-light` | 作为 Glyph 系统的次要描边色（亮调），用于辅助线条和轨道点 |
| `#2563EB` | Policy Gate (circle), Ledger (circle, lines), Approval Flow (path), Data Path (various) | `var(--color-brand-accent)` 或新建 `--color-glyph-stroke-deep` | 比 brand-accent 更深一级，用于 Glyph 中需要更强对比的描边和填充 |
| `#DBEAFE` | 旧版 Policy Gate / Ledger 圆心填充 | 废弃于当前暗场官网 | 仅保留为历史浅底语境，不用于 SecuritySection 的暗场 glyph |
| `#EFF6FF` | 旧版 Trust Card / Data Path 大面积填充 | 废弃于当前暗场官网 | 仅保留为外部浅底物料，不用于官网暗场 section |
| `#0F172A` | AI Logo (rect fill), Human Logo (rect fill), Policy Gate (rect fill), Ledger (rect fill), Data Path (path stroke) | `var(--color-surface-dark)` | 与 surface-dark 一致，用于 Glyph 的深色基底 |
| `#94A3B8` | Bridge label text | `var(--color-text-on-dark-muted)` | 统一到深色辅助文本 |
| `#64748B` | Trust card description | `var(--color-text-tertiary)` | 统一到辅助文本 |

**建议的 Glyph 专用 Token 方案**:

```css
/* ── SVG Glyph System (dark homepage) ── */
--color-glyph-fill: rgba(59, 130, 246, 0.14);        /* 暗场节点半透明填充 */
--color-glyph-fill-subtle: rgba(59, 130, 246, 0.08); /* 暗场大面积弱填充 */
--color-glyph-stroke: #60A5FA;                       /* 主描边 -- AI 侧发光感 */
--color-glyph-stroke-light: #93C5FD;                 /* 辅助描边 -- 轨道/线条 */
--color-glyph-stroke-deep: #2563EB;                  /* 深描边 -- 仅用于浅底旧稿 */
```

> **设计意图**: 当前暗场官网的 Glyph 系统以深色底座 + 亮描边 + 半透明蓝填充为主，不再使用接近白色的大面积浅蓝块。`#DBEAFE/#EFF6FF` 只作为历史浅底或外部物料的兼容色，不进入官网深色 Security glyph。

#### CommandHeader STATUS_MAP 状态色

| 当前硬编码 | 状态 | 建议映射 | 说明 |
|------------|------|---------|------|
| `#60A5FA` | hero (Signal intake), loop (Loop active) | `var(--color-brand-accent)` | 正常信号状态，与 signal-normal 一致 |
| `#2563EB` | compare (Compressing) | `var(--color-brand-accent)` | 压缩状态也是正常 AI 活跃态 |
| `#A78BFA` | security (Human gate) | `var(--color-brand-accent-alt)` 或 `var(--color-gate-human)` | 紫色非品牌色。Human gate 应映射到 gate-human (#1E3A5F) 或 accent-alt (#6366F1) |
| `#3B82F6` | faq (Decision manual) | `var(--color-brand-accent)` | 已一致 |
| `#22C55E` | footer (Loop closed) | `var(--color-signal-success)` | 已一致，代表闭环完成 |

**修正建议**: `security` 状态的 `#A78BFA` 应改为 `var(--color-gate-human)` 或 `var(--color-brand-accent-alt)`，保持品牌色谱一致性。

#### 交通灯色（macOS 红黄绿）

| 组件 | 用途 | 当前值 | 处理建议 |
|------|------|--------|---------|
| `HeroSection.tsx` L92-L94 | Signal Console 窗口装饰点 | `#EF4444`, `#EAB308`, `#22C55E` | **保留**。这是 macOS 窗口 chrome 的视觉隐喻，不属于 signal 系统。建议提取为 `--color-chrome-close`, `--color-chrome-minimize`, `--color-chrome-maximize` |
| `StorySection.tsx` | 同上窗口装饰点 | `var(--color-chrome-close)`, `var(--color-chrome-minimize)`, `var(--color-chrome-maximize)` | **已统一**。实验窗口保留 macOS chrome 隐喻，作为后续宣传视频承载位 |

**建议提取**:
```css
/* ── Window Chrome (macOS 隐喻) ── */
--color-chrome-close: #EF4444;
--color-chrome-minimize: #EAB308;
--color-chrome-maximize: #22C55E;
```

#### LogoMarquee 流程节点色

| 当前硬编码 | 节点 | 建议映射 | 说明 |
|------------|------|---------|------|
| `#22C55E` | input | `var(--color-signal-success)` | 信号输入，用成功色表示 |
| `#3B82F6` | ai | `var(--color-gate-ai)` | AI 节点 |
| `#F59E0B` | review | `var(--color-signal-warning)` | 审阅节点带警告语义 |
| `#6366F1` | decision | `var(--color-brand-accent-alt)` | 决策节点 |
| `#22C55E` | task | `var(--color-signal-success)` | 任务执行完成 |

#### 品牌标记 Eye Colors

| 当前硬编码 | 位置 | 建议映射 |
|------------|------|---------|
| `#60A5FA` | CommandHeader L70, L77 (eye fills) | 新建 `--color-brand-eye` 或保留为 SVG 常量 |
| `#F8FAFC` | CommandHeader L64 (medallion bg) | `var(--color-text-on-dark)` 或新 `--color-chrome-bg` |

> **说明**: 品牌标记的 eye 颜色 `#60A5FA` 是品牌核心识别元素之一，建议作为 `--color-brand-eye` 保留，而非混入 accent 色。

#### InfoFlowAnimation 节点色

| 当前硬编码 | 建议映射 |
|------------|---------|
| `#1E3A5F` (L118, L131, L134) | `var(--color-brand-primary)` |
| `#475569` (L139) | `var(--color-text-tertiary)` 或新建 `--color-flow-node-stroke` |

#### 完整硬编码到 Token 映射总表

| 硬编码颜色 | HEX | 出现次数 | 标准 Token | 新建 Token (如需) |
|------------|-----|---------|-----------|------------------|
| `#0F172A` | 0F172A | ~12 | `var(--color-surface-dark)` | -- |
| `#334155` | 334155 | ~3 | `var(--color-text-secondary)` | -- |
| `#64748B` | 64748B | ~8 | `var(--color-text-tertiary)` | -- |
| `#94A3B8` | 94A3B8 | ~10 | `var(--color-text-on-dark-muted)` | -- |
| `#F8FAFC` | F8FAFC | ~5 | `var(--color-text-on-dark)` | -- |
| `#F1F5F9` | F1F5F9 | -- | `var(--color-text-on-dark)` | -- |
| `#1E3A5F` | 1E3A5F | ~3 | `var(--color-brand-primary)` | -- |
| `#3B82F6` | 3B82F6 | ~10 | `var(--color-brand-accent)` | -- |
| `#60A5FA` | 60A5FA | ~10 | -- | `--color-glyph-stroke` / `--color-brand-eye` |
| `#93C5FD` | 93C5FD | ~6 | -- | `--color-glyph-stroke-light` |
| `#2563EB` | 2563EB | ~12 | -- | `--color-glyph-stroke-deep` |
| `rgba(59,130,246,0.14)` | -- | -- | -- | `--color-glyph-fill` |
| `rgba(59,130,246,0.08)` | -- | -- | -- | `--color-glyph-fill-subtle` |
| `#DBEAFE` | DBEAFE | legacy | -- | 当前官网禁用，保留给浅底旧稿 |
| `#EFF6FF` | EFF6FF | legacy | `var(--color-surface-tinted)` (近似) | 当前官网禁用，保留给浅底旧稿 |
| `#6366F1` | 6366F1 | ~1 | `var(--color-brand-accent-alt)` | -- |
| `#38BDF8` | 38BDF8 | -- | `var(--color-brand-cyan)` | -- |
| `#22C55E` | 22C55E | ~4 | `var(--color-signal-success)` | -- |
| `#F59E0B` | F59E0B | ~1 | `var(--color-signal-warning)` | -- |
| `#EF4444` | EF4444 | ~1 | `var(--color-signal-risk)` | -- |
| `#A78BFA` | A78BFA | 1 | -- | 废弃，改用 `--color-gate-human` 或 `--color-brand-accent-alt` |
| `#475569` | 475569 | 1 | -- | 建议映射到 `--color-text-tertiary` 或 `--color-flow-node-stroke` |
| `#E2E8F0` | E2E8F0 | 1 | -- | Footer hover 态背景，建议用 `var(--color-surface-elevated)` |
| `#FFFFFF` | FFFFFF | ~8 | `var(--color-surface-card)` | -- |

---

## 2.2 排版系统 Typography

### 2.2.1 字体家族

#### 西文字体栈

```css
--font-sans: 'Inter', 'HarmonyOS Sans SC', 'Noto Sans SC', 'Source Han Sans SC', system-ui, sans-serif;
```

| 角色 | 字体 | 优先级 | 说明 |
|------|------|--------|------|
| 主文本 | Inter | 1 | 通过 `next/font/google` 加载，CSS variable `--font-inter` |
| 中文回退 | HarmonyOS Sans SC | 2 | 华为系统字体，笔画均匀，与 Inter 视觉和谐 |
| 中文回退 | Noto Sans SC | 3 | Google 开源中文字体，覆盖范围广 |
| 中文回退 | Source Han Sans SC | 4 | Adobe 思源黑体，最终回退 |
| 系统回退 | system-ui, sans-serif | 5 | 系统默认无衬线 |

> **注意**: `design-tokens.json` L68 的 sans 栈中**不含 Noto Sans SC**，而 `globals.css` L59 中**含 Noto Sans SC**。应以 `globals.css` 为准（Noto Sans SC 作为中文字体回退是必要的）。

#### 等宽字体栈

```css
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

| 角色 | 字体 | 优先级 | 说明 |
|------|------|--------|------|
| 代码/数据 | JetBrains Mono | 1 | 通过 `next/font/google` 加载，CSS variable `--font-jetbrains-mono` |
| 代码回退 | Fira Code | 2 | 支持连字的等宽字体 |
| 系统回退 | monospace | 3 | 系统默认等宽 |

#### Console 字体栈

```css
--font-console: var(--font-jetbrains-mono), 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace;
```

| 角色 | 字体 | 优先级 | 说明 |
|------|------|--------|------|
| Console 面板 | JetBrains Mono (via CSS var) | 1 | 引用 `--font-jetbrains-mono`（next/font 注入） |
| Console 回退 | IBM Plex Mono | 2 | IBM 设计语言等宽字体 |
| 系统回退 | ui-monospace, SFMono-Regular | 3 | macOS/iOS SF Mono |

> **注意**: `design-tokens.json` 中**未定义** `--font-console` token。此 token 仅在 `globals.css` L61 中存在，属于组件级扩展。建议纳入 W3C token 规范。

### 2.2.2 排版阶梯

| Token | CSS Variable | 值 | font-weight | line-height | 典型使用场景 |
|-------|-------------|-----|-------------|-------------|-------------|
| `text-xs` | `--text-xs` | `0.75rem` (12px) | 400 | 1.5 | 脚注、版权、极小标注 |
| `text-sm` | `--text-sm` | `0.875rem` (14px) | 400-500 | 1.5 | 次要正文、按钮文字、标签 |
| `text-base` | `--text-base` | `1rem` (16px) | 400 | 1.5 | 正文默认 |
| `text-lg` | `--text-lg` | `1.125rem` (18px) | 500 | 1.5 | 强调正文、卡片标题 |
| `text-xl` | `--text-xl` | `1.25rem` (20px) | 600 | 1.2 | 区段副标题 |
| `text-2xl` | `--text-2xl` | `clamp(1.75rem, 3.5vw, 2.5rem)` | 600-700 | 1.2 | 区段标题 |
| `text-3xl` | `--text-3xl` | `clamp(2rem, 4vw, 3rem)` | 700 | 1.1 | 主标题 |
| `text-4xl` | `--text-4xl` | `clamp(2.5rem, 5vw, 4rem)` | 700 | 1.1 | Hero 主标题 |

> **证据来源**: `design-tokens.json` L72-L79, `tokens.css` L63-L70

#### 行高阶梯

| Token | CSS Variable | 值 | 使用场景 |
|-------|-------------|-----|---------|
| `leading-tight` | `--leading-tight` | `1.1` | 大标题（4xl/3xl），紧凑排列 |
| `leading-snug` | `--leading-snug` | `1.2` | 区段标题（2xl/xl），标题与副标题间 |
| `leading-normal` | `--leading-normal` | `1.5` | 正文默认行高 |
| `leading-relaxed` | `--leading-relaxed` | `1.65` | 长段落正文、可读性优化 |
| `leading-loose` | `--leading-loose` | `1.75` | 大段阅读场景、FAQ 正文 |

> **证据来源**: `design-tokens.json` L87-L91, `tokens.css` L72-L76

### 2.2.3 流式排版公式

Hero 标题使用 `clamp()` 实现流式缩放，在 320px 到 1280px 视口范围内平滑过渡。

| Token | clamp 公式 | 最小值 | 首选值 | 最大值 | 设计意图 |
|-------|-----------|--------|--------|--------|---------|
| `text-2xl` | `clamp(1.75rem, 3.5vw, 2.5rem)` | 28px | 3.5vw | 40px | 区段标题在移动端不溢出，桌面端保持视觉冲击 |
| `text-3xl` | `clamp(2rem, 4vw, 3rem)` | 32px | 4vw | 48px | 主标题的流式过渡，确保在 1440px 达到最大尺寸 |
| `text-4xl` | `clamp(2.5rem, 5vw, 4rem)` | 40px | 5vw | 64px | Hero 标题，最小 40px 保证移动可读性，最大 64px 防止桌面过大 |

**断点行为推算**:

| 视口宽度 | text-4xl 实际值 | text-3xl 实际值 | text-2xl 实际值 |
|---------|----------------|----------------|----------------|
| 375px (Mobile S) | 40px (min) | 32px (min) | 28px (min) |
| 640px (Tablet) | 40px (min) | 32px (min) | 28px (min) |
| 768px | 40px (min) | 32px (min) | 28px (min) |
| 1024px | 51.2px | 41.0px | 35.8px |
| 1280px | 64px (max) | 51.2px | 44.8px |
| 1440px+ | 64px (max) | 48px (max) | 40px (max) |

> 首选值使用 `vw` 单位，意味着 `text-4xl` 在 800px 视口时开始从 min 向 max 过渡（`5vw = 40px`）。

### 2.2.4 字体加载策略

#### next/font 注入方式

```tsx
// layout.tsx
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",        // <-- CSS variable 名
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono", // <-- CSS variable 名
});

// 注入到 <html> className
<html className={`${inter.variable} ${jetbrainsMono.variable}`}>
```

**工作原理**:
1. `next/font/google` 在构建时下载字体文件，自动生成 `@font-face` 声明
2. `variable` 参数将字体注入为 CSS custom property
3. `display: "swap"` 确保 FOIT (Flash of Invisible Text) 不发生，使用回退字体直到加载完成
4. `globals.css` 中通过 `var(--font-jetbrains-mono)` 引用加载后的字体

#### 字体回退链路

```
西文文本: Inter (--font-inter)
    ↓ 加载失败
   HarmonyOS Sans SC (系统)
    ↓ 不可用
   Noto Sans SC (系统/Google)
    ↓ 不可用
   Source Han Sans SC (Adobe)
    ↓ 不可用
   system-ui → sans-serif

等宽文本: JetBrains Mono (--font-jetbrains-mono)
    ↓ 加载失败
   Fira Code (系统)
    ↓ 不可用
   IBM Plex Mono (系统)
    ↓ 不可用
   ui-monospace → SFMono-Regular → monospace
```

---

## 2.3 间距系统 Spacing

### 2.3.1 间距阶梯

基于 4px 基础单位的倍数系统。`globals.css` 定义了语义化 shorthand，`tokens.css` / `design-tokens.json` 定义了完整的数值阶梯。

| Token | CSS Variable | 值 | Tailwind 等效 | 使用场景 |
|-------|-------------|-----|-------------|---------|
| `space-1` | `--space-1` | `4px` | `p-1`, `m-1` | 图标与文字间距、极小内边距 |
| `space-2` | `--space-2` | `8px` | `p-2`, `m-2` | 紧凑元素间距、badge 内边距 |
| `space-3` | `--space-3` | `12px` | `p-3`, `m-3` | 输入框内边距、小卡片内边距 |
| `space-4` | `--space-4` | `16px` | `p-4`, `m-4` | 标准内边距、元素间距 |
| `space-5` | `--space-5` | `20px` | `p-5`, `m-5` | 中等间距 |
| `space-6` | `--space-6` | `24px` | `p-6`, `m-6` | 水平内边距标准值 (px-6)、卡片内边距 |
| `space-8` | `--space-8` | `32px` | `p-8`, `m-8` | 区块间距、大卡片内边距 |
| `space-10` | `--space-10` | `40px` | `p-10`, `m-10` | 区段内子块间距 |
| `space-12` | `--space-12` | `48px` | `p-12`, `m-12` | 子区块间距 |
| `space-16` | `--space-16` | `64px` | `p-16`, `m-16` | 区段内元素组间距 |
| `space-20` | `--space-20` | `80px` | `p-20`, `m-20` | 大区块间距 |
| `space-24` | `--space-24` | `96px` | `p-24`, `m-24` | 区域分隔 |
| `space-section` | `--space-section` | `140px` | -- | Section 上下内边距 |

### 2.3.2 语义化间距（globals.css shorthand）

| Token | CSS Variable | 值 | 等效数值 Token | 使用场景 |
|-------|-------------|-----|-------------|---------|
| `space-element` | `--space-element` | `24px` | `space-6` | 单个元素与元素之间的间距 |
| `space-block` | `--space-block` | `64px` | `space-16` | 内容块与内容块之间的间距 |
| `space-section` | `--space-section` | `140px` | -- | Section 上下 padding |

> **注意**: `--space-block` (64px) 与 `space-16` (64px) 值相同但语义不同。`--space-block` 表达的是"内容块间距"，`space-16` 表达的是"64px 数值"。两者在 `tokens.css` 中存在重复。

### 2.3.3 Section 间距规范

**统一规则**: 所有 section 使用 `padding-top: 140px; padding-bottom: 140px`（即 `var(--space-section)`）。

**例外场景**:
- Hero section: 首屏区域，padding 由视口高度决定，不使用 140px
- Footer: 使用 `100vh` 高度自适应，不使用 140px
- 深色区域（InfoLoop）的内部 padding 由组件自行定义

### 2.3.4 水平内边距规范

**统一规则**: `padding-left: 24px; padding-right: 24px`（即 `px-6`）。

这是移动端的安全边距，确保内容不贴边。在更大视口上，由 `max-width` 容器控制居中。

---

## 2.4 圆角系统 Border Radius

### 2.4.1 圆角阶梯

| Token | CSS Variable | 值 | 使用规则 |
|-------|-------------|-----|---------|
| `radius-sm` | `--radius-sm` | `6px` | 小元素: badge、chip、小按钮、小标签 |
| `radius-md` | `--radius-md` | `12px` | 中型元素: 卡片、输入框、对话框 |
| `radius-lg` | `--radius-lg` | `20px` | 大元素: 模态窗口、大面板、Feature 卡 |
| `radius-xl` | `--radius-xl` | `28px` | 特大元素: 品牌容器、Hero 卡片 |
| `radius-full` | `--radius-full` | `9999px` | 完全圆形: 圆形按钮、头像、状态点、Loop 节点 |

**使用原则**:
- 嵌套容器的圆角应 >= 父容器圆角
- 同一视觉层级的元素使用相同圆角值
- 深色面板和浅色卡片可使用不同层级的圆角

---

## 2.5 阴影系统 Shadows

### 2.5.1 阴影阶梯

| Token | CSS Variable | 值 | 使用场景 |
|-------|-------------|-----|---------|
| `shadow-sm` | `--shadow-sm` | `0 10px 28px rgba(0, 0, 0, 0.18)` | 暗场卡片默认态、轻微抬升 |
| `shadow-md` | `--shadow-md` | `0 18px 56px rgba(0, 0, 0, 0.26)` | 暗场卡片 hover 态、中度抬升 |
| `shadow-lg` | `--shadow-lg` | `0 30px 90px rgba(0, 0, 0, 0.34)` | 暗场模态窗口、下拉菜单、强抬升 |
| `shadow-glow` | `--shadow-glow` | `0 0 20px rgba(59, 130, 246, 0.15)` | 品牌色发光、聚焦态、活跃指示 |
| `shadow-node-glow` | `--shadow-node-glow` | `0 0 12px rgba(59, 130, 246, 0.3)` | Loop 节点激活发光、状态点脉冲 |

> **证据来源**: `globals.css` L52-L56, `design-tokens.json` L121-L125

### 2.5.2 毛玻璃阴影组合

以下组件使用 `backdrop-filter: blur()` + 阴影的复合效果：

#### CommandHeader (导航栏)

```css
/* 常态 */
background: rgba(15, 23, 42, 0.84);   /* surface-dark 半透明 */
border: 1px solid rgba(255, 255, 255, 0.10);
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);

/* 滚动后 */
box-shadow: 0 18px 60px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.08);
```

> **证据来源**: `CommandHeader.tsx` L229-L237

#### CommandHeader Mobile Drawer (移动端抽屉)

```css
background: rgba(15, 23, 42, 0.94);
border: 1px solid rgba(148, 163, 184, 0.20);
box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
```

> **证据来源**: `CommandHeader.tsx` L446-L450

#### Dual-key Cards (双密钥信任卡)

```css
background: rgba(15, 23, 42, 0.80);
border: 1px solid rgba(148, 163, 184, 0.18);
box-shadow: 0 24px 70px rgba(0, 0, 0, 0.26), inset 0 1px 0 rgba(255,255,255,0.05);
```

> **证据来源**: `SecuritySection.tsx` L350-L352

#### LoopNodeCard Dark Mode (Loop 节点卡片暗色态)

```css
border: 1px solid rgba(255, 255, 255, 0.08);
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
```

> **证据来源**: `LoopNodeCard.tsx` L263, L267

---

## 2.6 Token 不一致修复方案

### 2.6.1 Duration Tokens 冲突

这是 `globals.css` 与 `tokens.css` 之间最严重的不一致。

| Token 名称 | globals.css (当前在用) | tokens.css (生成) | design-tokens.json (源) | 冲突说明 |
|------------|----------------------|-------------------|------------------------|---------|
| `instant` | -- | `100ms` | `100ms` | globals.css 无此 token |
| `fast` | **150ms** | **200ms** | **200ms** | **冲突**: globals.css 使用 150ms，W3C 规范为 200ms |
| `normal` | **300ms** | **350ms** | **350ms** | **冲突**: globals.css 使用 300ms，W3C 规范为 350ms |
| `slow` | **500ms** | **600ms** | **600ms** | **冲突**: globals.css 使用 500ms，W3C 规范为 600ms |
| `crawl` | -- | `1200ms` | `1200ms` | globals.css 无此 token |

**统一建议**: 以 `globals.css` 为准。原因:
1. `globals.css` 是实际被 `@import` 使用的文件，组件动画均基于这些值
2. 更快的 duration（150/300/500）更符合品牌调性中的"克制"和"精密"
3. `tokens.css` 未被任何文件引入（仅作为 W3C 规范的 CSS 输出存在）

**修复操作**:
- 将 `design-tokens.json` 的 duration 值更新为 150/300/500
- 新增 `instant: 80ms`（比 fast 更短的微交互，如 focus ring）
- 新增 `crawl: 1000ms`（戏剧性展示，比 slow 更慢）
- `tokens.css` 需要重新生成以保持同步

### 2.6.2 Font Stack 差异

| 层级 | globals.css | tokens.css / design-tokens.json | 差异 |
|------|------------|--------------------------------|------|
| sans | 含 `Noto Sans SC` | 不含 `Noto Sans SC` | globals.css 多一个中文字体回退 |
| console | 定义了 `--font-console` | 未定义 | tokens.css 缺少 console 字体栈 |
| easing | `--ease-out` (无 `--ease-default`) | 有 `--ease-default` (与 `--ease-out` 值相同) | naming 差异 |

**统一建议**:
- sans 栈以 `globals.css` 为准，保留 `Noto Sans SC`
- 将 `--font-console` 纳入 `design-tokens.json` 的 typography.fontFamily
- easing 统一使用 `--ease-out` 名称，废弃 `--ease-default`（值相同，保留更语义化的名称）

### 2.6.3 OKLCH vs Hex 统一策略

| 文件 | 颜色格式 | 使用场景 |
|------|---------|---------|
| `globals.css` | 全部 HEX + rgba | 生产环境 CSS |
| `tokens.css` | 全部 HEX + rgba | 生成的 CSS（与 globals.css 一致） |
| `design-tokens.json` | 全部 OKLCH | W3C Design Token 标准存储 |

**统一策略**:
- **W3C Token 源 (design-tokens.json)**: 保持 OKLCH 格式 -- 色彩空间更精确，支持未来广色域
- **CSS 变量 (globals.css)**: 保持 HEX 格式 -- 浏览器兼容性最佳，SVG fill/stroke 直接引用
- **组件代码**: 全部引用 CSS 变量，不直接写 HEX 或 OKLCH
- **命名规则**: 两个文件的值必须保持数学等价（HEX 是 OKLCH 的 sRGB 投影）

**验证方法**: 生成 `tokens.css` 时，应确保 OKLCH -> sRGB -> HEX 的转换与 `globals.css` 中的 HEX 值一致。

### 2.6.4 组件专属 Tokens 取舍

#### globals.css 中定义但 tokens.css 中缺失的 token

| Token | globals.css | tokens.css | 处理建议 |
|-------|------------|-----------|---------|
| `--font-console` | 有 | 无 | **纳入** design-tokens.json |
| `--space-block` (64px) | 有 | 无（有 `--space-16` 等值） | **废弃** -- 与 `--space-16` 重复，使用数值 token |
| `--space-element` (24px) | 有 | 无（有 `--space-6` 等值） | **保留** -- 语义化命名有设计价值，指向 `--space-6` |

#### tokens.css 中定义但 globals.css 中缺失的 token

| Token | tokens.css | globals.css | 处理建议 |
|-------|-----------|-----------|---------|
| `--text-xs` ~ `--text-4xl` | 有 | 无 | **纳入** globals.css -- 排版阶梯应在全局定义 |
| `--leading-tight` ~ `--leading-loose` | 有 | 无 | **纳入** globals.css -- 行高阶梯应在全局定义 |
| `--duration-instant` | 有 | 无 | **纳入** globals.css -- 新增 80ms instant |
| `--duration-crawl` | 有 | 无 | **纳入** globals.css -- 新增 1000ms crawl |
| `--ease-default` | 有 | 无 | **废弃** -- 与 `--ease-out` 重复 |

#### 组件级 Tokens (应保留在 globals.css)

以下 token 仅被特定组件使用，但在 `globals.css` 中全局定义是合理的（它们是品牌级组件规格，不是一次性值）:

| Token | 使用组件 | 保留理由 |
|-------|---------|---------|
| `--ticker-layer1-speed` | LogoMarquee | 轨道动画速度，品牌级规格 |
| `--ticker-layer2-speed` | LogoMarquee | 同上 |
| `--ticker-mask-fade` | LogoMarquee | 遮罩渐变范围 |
| `--simulator-inspector-width` | InfoLoopSection | Inspector 面板宽度 |
| `--faq-question-panel-width` | FAQ Section | 问答面板宽度 |

#### tokens.css 中的组件级 Tokens（需决定是否同步到 globals.css）

| Token 组 | tokens.css | globals.css | 建议 |
|----------|-----------|-----------|------|
| `--loop-rail-*` (5 个) | 有 | 无 | **纳入** -- Loop Rail 是核心品牌组件 |
| `--ticker-chip-*` (3 个) | 有 | 无（部分有 shorthand） | **选择性纳入** -- 仅 gap 和 radius |
| `--transformer-*` (2 个) | 有 | 无 | **不纳入** -- 过于组件化，保留在组件内联样式 |
| `--simulator-*` (4 个) | 有 | 无（inspector-width 已有） | **选择性纳入** -- node-size 和 particle-speed |
| `--gate-*` (4 个) | 有 | 无 | **纳入** -- Gate 是安全门控的核心规格 |
| `--faq-*` (3 个) | 有 | 无（question-panel-width 已有） | **不纳入** -- 过于组件化 |

---

**总修复操作清单**:

- [x] 1. 更新 `design-tokens.json` 的 duration 值: fast=150ms, normal=300ms, slow=500ms
- [x] 2. 新增 instant=80ms, crawl=1000ms 到 design-tokens.json
- [x] 3. 新增 `fontFamily.console` 到 design-tokens.json
- [x] 4. 新增 `Noto Sans SC` 到 design-tokens.json 的 fontFamily.sans
- [x] 5. 废弃 `--ease-default`，统一使用 `--ease-out`
- [ ] 6. 将排版阶梯 (text-xs ~ text-4xl, leading-*) 从 tokens.css 合并到 globals.css
- [ ] 7. 将 Loop Rail 和 Gate 组件 tokens 从 tokens.css 合并到 globals.css
- [ ] 8. 废弃 `--space-block`，用 `--space-16` 替代
- [x] 9. 将 SecuritySection 的 `#A78BFA` 替换为 `var(--color-gate-human)` 或 `var(--color-brand-accent-alt)`
- [x] 10. 将 StorySection 的 macOS 窗口色统一到 HeroSection 版本
- [x] 11. 新增 Glyph 专用 tokens (`--color-glyph-*`) 到 globals.css
- [x] 12. 新增 Window Chrome tokens (`--color-chrome-*`) 到 globals.css
- [x] 13. 新增 `--color-brand-eye` 到 globals.css
- [ ] 14. 批量替换组件中的硬编码颜色为 CSS variable 引用
- [ ] 15. 重新生成 tokens.css 以与 globals.css 保持同步
