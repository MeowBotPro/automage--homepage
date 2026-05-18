# 4. 插图与图标风格 Illustration & Icon Style

---

## 4.1 技术规范 Technical Specs

### 4.1.1 SVG 渲染方式

所有 SVG 插图均为 **inline SVG**（JSX 直接嵌入），不使用 sprite sheet、external `<img>` 或 `<use>` 引用。

| 方式 | 使用 | 说明 |
|------|------|------|
| Inline SVG (JSX) | **全部** | 所有 Glyph、Logo、Diagram、Console 均为 inline `<svg>` |
| `<img>` / `<Image>` | 禁止 | 零位图原则，不允许 raster 或 external SVG |
| `<use>` / sprite | 禁止 | 无 sprite sheet，每个 SVG 自包含 |

> **证据来源**: `SecuritySection.tsx` L10-L101 (6 个 inline Glyph), `ValueCardsSection.tsx` L10-L62 (3 个 inline Diagram), `CommandHeader.tsx` L56-L83 (inline Logo), `FlowNavigation.tsx` L189-L338 (inline Rail), `PageParticles.tsx` L84-L96 (inline Particles), `Footer.tsx` L384-L443 (inline Seal)

### 4.1.2 viewBox 约定

| 组件类别 | viewBox | 说明 |
|---------|---------|------|
| Pipeline Glyph (44px) | `0 0 44 44` | PolicyGate, ExecutionLedger |
| Brand Role Logo (48px) | `0 0 48 48` | AILogo, HumanLogo |
| Trust Card Glyph (56px) | `0 0 56 56` | MaskedData, PermissionBoundary, AuditTrail |
| ValueCard Diagram | `0 0 180 64` | FidelityDiagram, CompressionDiagram, AuditDiagram |
| Octopus Logo | `0 0 416.99 407.84` | 品牌章鱼标识，非正方形，保留原始路径坐标 |
| Loop Rail | `0 0 80 {dynamicHeight}` | FlowNavigation，高度由页面总高动态计算 |
| Loop Seal | `0 0 520 520` | Footer 环形轨道 (RING_CX*2, RING_CY*2) |
| Particle Network | `0 0 1440 800` | Footer 背景粒子网络 |
| Page Particles | `0 0 1920 1080` | 全屏背景粒子，preserveAspectRatio="none" |

**viewBox 命名规则**:
- 小尺寸 Glyph: 正方形 viewBox (44x44, 48x48, 56x56)，内部元素留 4-8px 安全边距
- Diagram: 宽矩形 viewBox (180x64)，适合卡片内水平布局
- 系统级 SVG: 大尺寸 viewBox，匹配容器语义

### 4.1.3 stroke-width 标准

| 用途 | strokeWidth | 使用场景 |
|------|-------------|---------|
| 主描边 | `1.5` | Glyph 边框、轨道路径、六边形边、门框、账本框 |
| 次描边 | `1.6` | AI Logo 六边形、Human Logo 圆框（品牌角色描边略粗于普通 Glyph） |
| 强调描边 | `2` | 扫描线、连接线、数据线、审计路径、确认勾 |
| 粗描边 | `2.4` | Human Logo 确认勾（高对比度的强调元素） |

> **证据来源**:
> - `SecuritySection.tsx` L13: `strokeWidth="1.6"` (AI Logo 六边形), L32: `strokeWidth="2.4"` (确认勾)
> - `SecuritySection.tsx` L42-43: `strokeWidth="1.5"` (PolicyGate 边框), L44: `strokeWidth="2"` (扫描线)
> - `ValueCardsSection.tsx` CSS L339: `stroke-width: 2` (am-path 默认), L362-365: `stroke-width: 1.5` (am-core)

### 4.1.4 stroke-linecap / stroke-linejoin 标准

| 属性 | 值 | 适用范围 |
|------|-----|---------|
| strokeLinecap | `round` | **全部** 线段端点，无一例外 |
| strokeLinejoin | `round` | **全部** 路径连接点，无一例外 |

**禁用值**: `butt`, `square`, `miter` -- 与品牌"精密但克制"的调性冲突。

> **证据来源**: `SecuritySection.tsx` L13: `strokeLinejoin="round"`, L28: `strokeLinecap="round"`, L32: `strokeLinecap="round" strokeLinejoin="round"`. `ValueCardsSection.tsx` CSS L341: `stroke-linecap: round; stroke-linejoin: round`. `HeroSection.tsx` L361: `strokeLinecap="round" strokeLinejoin="round"`.

### 4.1.5 颜色引用方式

**规则**: 优先使用 CSS Variable，受限场景允许硬编码 HEX。

| 引用方式 | 使用场景 | 原因 |
|---------|---------|------|
| CSS Variable `var(--color-*)` | 语义色引用、可切换色 | 保持主题一致性、支持暗底/亮底切换 |
| 硬编码 HEX | Glyph 内部蓝色色阶 (`#60A5FA`, `#93C5FD`, `#2563EB`, `#DBEAFE`, `#EFF6FF`) | SVG `fill`/`stroke` 属性不支持 `var()` 在某些浏览器的 SVG 属性中 |
| 硬编码 HEX | 品牌标识元素（Octopus Logo 眼睛 `#60A5FA`、章鱼路径 `#F8FAFC`） | 品牌核心标识不应受主题切换影响 |

**SVG 属性限制说明**: SVG 元素的 `fill` 和 `stroke` 属性在 JSX 中接受字符串值。CSS Variable 可以在 `style` 对象中生效，但在 SVG 属性直接写 `var(--color-*)` 在部分浏览器中不被解析。当前代码采用混合策略：
- 通过 `style` 对象引用 CSS var（如 FlowNavigation、PageParticles）
- 通过 SVG 属性写硬编码 HEX（如 SecuritySection Glyphs）

**待统一方案**: 将 Glyph 内部硬编码颜色逐步迁移到 `style` 对象中的 CSS Variable 引用（详见 `02-visual-system.md` 2.1.4 硬编码颜色统一方案）。

---

## 4.2 色彩约束 Color Constraints

### 4.2.1 插图中允许使用的颜色列表

以下颜色从品牌色谱派生，构成插图系统的完整色阶：

#### 品牌核心色

| 色阶名 | HEX | CSS Variable | 语义 | 使用限制 |
|--------|-----|--------------|------|---------|
| Navy (Primary) | `#1E3A5F` | `--color-brand-primary` | 人类权威、决策层 | 仅用于人类侧元素、品牌渐变 |
| Blue (Accent) | `#3B82F6` | `--color-brand-accent` | AI 连接、活跃路径 | 主路径色、节点激活色 |
| Cyan | `#38BDF8` | `--color-brand-cyan` | 数据光点、粒子 | 仅用于光点粒子和进程高亮 |

#### Glyph 专用色阶 (蓝色光谱)

| 色阶名 | HEX | 建议 Token | 语义 | 使用场景 |
|--------|-----|-----------|------|---------|
| Deep | `#2563EB` | `--color-glyph-stroke-deep` | 深描边 | PolicyGate 圆心、Ledger 圆心、AuditTrail 圆心、高对比描边 |
| Medium | `#3B82F6` | `--color-brand-accent` | 中描边 | 主路径、连接线、节点默认色 |
| Light | `#60A5FA` | `--color-glyph-stroke` | 轻描边 | AI 侧发光感、六边形边框、指纹外框、品牌眼色 |
| Pale | `#93C5FD` | `--color-glyph-stroke-light` | 辅助描边 | 轨道点、指纹内线、辅助线条 |
| Fill | `#DBEAFE` | `--color-glyph-fill` | 实体填充 | 圆心填充、Brief 卡填充、印章底 |
| Fill Subtle | `#EFF6FF` | `--color-glyph-fill-subtle` | 浅底填充 | Trust Card 背景、大面积底色 |

#### 深底色

| 色阶名 | HEX | CSS Variable | 语义 | 使用场景 |
|--------|-----|--------------|------|---------|
| Dark | `#0F172A` | `--color-surface-dark` | 系统内部 | Glyph 底座 rect fill |
| Deep | `#0B1628` | `--color-surface-deep` | 最深背景 | Console/Inspector 底色 |

#### 信号色（辅助，谨慎使用）

| HEX | CSS Variable | 语义 | 在插图中的使用限制 |
|-----|--------------|------|-------------------|
| `#F59E0B` | `--color-signal-warning` | 预警 | Pipeline 第二阶段连线渐变终点 |
| `#EF4444` | `--color-signal-risk` | 高危 | 决策卡风险标签（非 Glyph 内部） |
| `#22C55E` | `--color-signal-success` | 完成 | Pipeline 第四阶段色、Loop Seal 完成态 |
| `#6366F1` | `--color-brand-accent-alt` | 辅助高亮 | 极少量视觉分层，不用于 Glyph |

#### 禁用颜色

| 禁用色 | 原因 |
|--------|------|
| 纯灰 `#808080`, `#999999` | 品牌中性色使用 Slate 色系（带蓝色调） |
| 霓虹/饱和暖色 | 违反"克制"调性 |
| `#A78BFA` (紫色) | 非品牌色，security 状态的硬编码需修正 |
| `#FFFFFF` (纯白) 在深底 Glyph 内 | 使用 `#F8FAFC` 或 `#F1F5F9` (带蓝色调) |

### 4.2.2 Glyph 色彩矩阵

逐一定义每个 Glyph 使用的具体颜色（基于代码实际实现）：

#### SecuritySection Pipeline Glyphs

| Glyph | 底座 rect fill | 主描边 stroke | 辅助描边 | 圆心 fill | 圆心 stroke | 其他 |
|-------|---------------|-------------|---------|----------|------------|------|
| **AILogo** | `#0F172A` | `#60A5FA` (六边形) | `#93C5FD` (轨道点 fill) | `#60A5FA` (中心圆) | -- | -- |
| **HumanLogo** | `#0F172A` | `#60A5FA` (外圆) | `#93C5FD` (指纹内线) | -- | -- | `#60A5FA` (确认勾) |
| **PolicyGateGlyph** | `#0F172A` | `#60A5FA` (门框) | `#93C5FD` (扫描线) | `#DBEAFE` (圆心) | `#2563EB` (圆心边) | -- |
| **ExecutionLedgerGlyph** | `#0F172A` | `#60A5FA` (账本框) | `#93C5FD` (写入线) | `#DBEAFE` (印章底) | `#2563EB` (印章边) | -- |

#### Trust Card Glyphs

| Glyph | 背景 fill | 主描边 stroke | 辅助描边 | 遮罩/标记色 |
|-------|----------|-------------|---------|-----------|
| **MaskedDataGlyph** | `#EFF6FF` | `#2563EB` (数据线、X 圆边) | `#93C5FD` (虚化线, opacity .5) | `#2563EB` fillOpacity .2 (遮罩区) |
| **PermissionBoundaryGlyph** | `#EFF6FF` | `#2563EB` (网格线、边界墙) | -- | `#2563EB` (agent 点) |
| **AuditTrailCardGlyph** | 无底 rect | `#2563EB` (路径) | `#93C5FD`/`#60A5FA`/`#2563EB` (3 检查点, 由浅到深) | `#DBEAFE` (印章底) |

#### ValueCards Mini Diagrams

| Glyph | 路径 stroke | 节点 fill | 核心 fill/stroke | 输出 fill |
|-------|-----------|----------|-----------------|----------|
| **FidelityDiagram** | `#60A5FA` | `#93C5FD` (input), `#2563EB` (output) | `rgba(37,99,235,0.08)` / `#2563EB` | `#2563EB` |
| **CompressionDiagram** | `#93C5FD` (数据线), `#60A5FA` (路径) | `#2563EB` (core dot) | `#2563EB` (stroke) | `#DBEAFE` (brief 填充) |
| **AuditDiagram** | `#60A5FA` (审计路径) | `#2563EB` (checkpoints) | -- | `#DBEAFE` (印章底) |

### 4.2.3 暗底/亮底色彩切换规则

| 场景 | 背景色 | 前景规则 |
|------|--------|---------|
| **Glyph 底座 (Pipeline)** | `#0F172A` (dark) | 描边使用 light/pale 蓝色色阶 (`#60A5FA`, `#93C5FD`) |
| **Trust Card 背景 (亮底)** | `#EFF6FF` 或 `#FFFFFF` | 描边使用 deep 蓝色色阶 (`#2563EB`) |
| **Console 面板 (深底)** | `var(--color-surface-deep)` | 文字使用 `var(--color-text-on-dark)` / `var(--color-text-on-dark-muted)` |
| **ValueCard Diagram 容器** | 微渐变 (见 L323-325) | 路径使用 `#60A5FA`，节点使用 `#93C5FD`/`#2563EB` |
| **Footer Seal (深底)** | `var(--color-surface-dark)` | 轨道 `#3B82F6` (opacity 0.25)，标签 `#94A3B8` |

**核心原则**: 深底上用亮描边 (light blue spectrum)，亮底上用深描边 (deep blue spectrum)。两个场景都限定在 `#2563EB` -> `#60A5FA` -> `#93C5FD` -> `#DBEAFE` -> `#EFF6FF` 这条蓝色光谱内。

---

## 4.3 风格特征 Style Characteristics

### 4.3.1 线条风格

| 特征 | 规范 | 代码证据 |
|------|------|---------|
| Clean strokes | 所有描边清晰、无锯齿、无多重描边叠加 | 全部 SVG 组件均为单层描边 |
| Rounded caps | `strokeLinecap="round"` 应用于所有线段 | SecuritySection L13, L28, L32; ValueCards CSS L341 |
| Rounded joins | `strokeLinejoin="round"` 应用于所有路径连接 | SecuritySection L13; ValueCards CSS L341 |
| 无虚线 | 主描边不使用 `strokeDasharray`（仅连接线和动画过渡态使用虚线） | ValueCardsSection L257: 连接线 `strokeDasharray="4 8"` |
| 无阴影 | SVG 内部不使用 `<filter>`、`<feDropShadow>` | 代码中无任何 SVG filter |

### 4.3.2 填充策略

| 策略 | 规范 | 示例 |
|------|------|------|
| Minimal fills | 小面积实体填充仅用于关键节点 | AILogo 中心圆 `fill="#60A5FA"` (r=4), PolicyGate 圆心 `fill="#DBEAFE"` |
| Semi-transparent overlays | 大面积填充使用低透明度 | CompressionDiagram am-core: `fill: rgba(37, 99, 235, 0.08)` |
| 底座 rect | 每个 Pipeline Glyph 有一个深色底座 | AILogo: `<rect fill="#0f172a" rx="14">`, PolicyGate: `<rect fill="#0F172A">` |
| 无渐变填充 | SVG 内部不使用 `<linearGradient>` 或 `<radialGradient>` | 所有 SVG 内部均无渐变定义（渐变仅在容器 CSS 中） |

### 4.3.3 几何语言

| 几何元素 | 使用场景 | 具体示例 |
|---------|---------|---------|
| **Circle** | 节点、光点、轨道点、印章 | AILogo 轨道点 r=2, 中心圆 r=4; FlowNavigation 节点 r=6/10 |
| **Path (贝塞尔曲线)** | 连接线、指纹、轨道、信号路径 | HumanLogo 指纹曲线; ValueCards am-path cubic bezier |
| **Rect (圆角矩形)** | 底座、数据卡、门框、账本 | 所有 Glyph 底座 rx=14; PolicyGate 门框 rx=4; MaskedData 卡 rx=8 |
| **Hexagon (六边形)** | AI Logo 专用 | AILogo `<path d="M24 10L35 16.5V31.5L24 38L13 31.5V16.5L24 10Z">` |
| **Line** | 扫描线、连接线、网格 | PolicyGate 扫描线; ValueCards 连接线 |
| **Polyline** | 确认勾 | AuditTrail: `<path d="M27 26L29 28.5L33 23">` |

**禁止的几何元素**: `<polygon>` (过于生硬), `<ellipse>` (与圆形重叠), `<text>` 在 Glyph 内 (文字由容器处理)。

### 4.3.4 抽象程度

**抽象级别**: 高度抽象 (highly abstract)，零现实主义。

| 维度 | 规范 |
|------|------|
| 抽象程度 | 极高 -- 所有形状都是信息流概念的抽象映射，不描绘任何现实物体 |
| 信息流导向 | 每个形状必须对应一个信息流概念（见 4.4 各 Glyph 语义定义） |
| 零现实主义 | 不使用人物轮廓、设备图标、文件图标等具象元素 |
| 几何简练 | 用最少的路径点和几何元素表达语义 |

### 4.3.5 每个插图的信息流语义映射

| 插图 | 形状 | 信息流概念 |
|------|------|-----------|
| AILogo 六边形 | 六边形 + 中心圆 + 3 轨道点 | AI 系统的几何结构：中心决策核心 + 多轨道数据输入 |
| HumanLogo 指纹 | 指纹曲线 + 对勾 | 人类身份确认 + 授权通过 |
| PolicyGate 双门 | 两个圆角矩形门框 + 扫描线 + 圆心 | 权限校验关卡：两道门之间的扫描检查 |
| ExecutionLedger 账本 | 矩形 + 3 行线 + 印章圆 | 执行记录：每条写入都被永久记录和盖章 |
| MaskedData 卡片 | 卡片 + 数据线 + 遮罩区 + X 圆 | 数据脱敏：卡片中的敏感字段被遮罩覆盖 |
| PermissionBoundary 网格 | 网格 + agent 点 + 边界墙 | 权限边界：agent 只能在边界内移动 |
| AuditTrail 路径 | 环形路径 + 3 检查点 + 印章 | 行为审计：每一步都有检查和确认 |
| FidelityDiagram | 3 输入点 -> 核心 -> 输出 | 信息保真：多源信息汇聚为单一保真输出 |
| CompressionDiagram | 4 数据线 -> 高核心 -> brief 卡 | 信息压缩：多条数据线压缩为一张简报 |
| AuditDiagram | 路径 + 检查点 + 印章 | 可追踪执行：每一步都有审计检查 |
| Signal Console | 控制台面板 + 状态条 + 指标 | 信号仪表盘：实时监控组织信号状态 |
| Loop Rail | 垂直轨道 + 6 节点 | 闭环导航：The Loop 的线性投影 |
| Loop Seal | 环形轨道 + 6 节点 | 闭环确认：The Loop 的完整环形呈现 |
| Particle Network | 5 条贝塞尔曲线 + 粒子 | 数据流动：组织信息的持续流动和连接 |
| Octopus Logo | 章鱼形态 | 品牌标识：多触手 = 多信号源同时处理 |

---

## 4.4 SVG Glyph 体系 Glyph System

### 4.4.1 SecuritySection Glyphs (7 个)

#### AILogo

| 属性 | 值 |
|------|-----|
| 尺寸 | 44x44, viewBox `0 0 48 48` |
| 底座 | `<rect x="4" y="4" width="40" height="40" rx="14" fill="#0f172a">` |
| 主体 | 正六边形 `<path d="M24 10L35 16.5V31.5L24 38L13 31.5V16.5L24 10Z" stroke="#60a5fa" strokeWidth="1.6" strokeLinejoin="round">` |
| 中心 | `<circle cx="24" cy="24" r="4" fill="#60a5fa">` |
| 轨道点 | 3 个 `<circle r="2" fill="#93c5fd">` 分布在六边形顶点 (24,15), (32,29), (16,29) |
| 语义 | AI 系统的结构化核心：六边形代表 AI 的精密计算框架，中心圆点代表决策核心，3 个轨道点代表多源数据输入正在环绕处理。隐喻"AI 是一个几何精密的信号处理器"。 |
| 动画 | 轨道点旋转：`transform-origin: 24px 24px; animation: amOrbit 5s linear infinite`，3 个点分别延迟 0s, -1.6s, -3.2s，形成均匀间隔的持续旋转。 |

#### HumanLogo

| 属性 | 值 |
|------|-----|
| 尺寸 | 44x44, viewBox `0 0 48 48` |
| 底座 | `<rect x="4" y="4" width="40" height="40" rx="14" fill="#0f172a">` |
| 外框 | `<circle cx="24" cy="23" r="13" stroke="#60a5fa" strokeWidth="1.6" fill="none">` |
| 指纹外线 | `<path d="M18 24C18 18.5 21 16 24 16C27.5 16 30 19.5 30 24C30 28 28.5 31 24 33" stroke="#93c5fd" strokeWidth="1.7" strokeLinecap="round">` |
| 指纹内线 | `<path d="M22 25C22 22 22.8 20.2 24.2 20.2C26 20.2 26.8 22.2 26.8 25C26.8 27 26 28.6 24 30" stroke="#60a5fa" strokeWidth="1.7" strokeLinecap="round">` |
| 确认勾 | `<path d="M17 37L20.5 40.5L29 32" stroke="#60a5fa" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">` |
| 语义 | 人类身份的生物特征确认：指纹曲线代表独特的个人身份（不可伪造），确认勾代表授权通过（人做了决定）。隐喻"人类拥有最终确认权"。 |
| 动画 | 指纹绘制：`stroke-dasharray: 48; stroke-dashoffset: 48; animation: amFingerDraw 2.8s ease-in-out infinite`，内线延迟 0.18s。确认勾绘制：`stroke-dasharray: 20; stroke-dashoffset: 20; animation: amCheckDraw 2.8s ease-in-out infinite`（从 48% 开始绘制，与指纹形成序贯）。 |

#### PolicyGateGlyph

| 属性 | 值 |
|------|-----|
| 尺寸 | 44x44, viewBox `0 0 44 44` |
| 左门 | `<rect x="10" y="9" width="8" height="26" rx="4" fill="#0F172A" stroke="#60A5FA" strokeWidth="1.5">` |
| 右门 | `<rect x="26" y="9" width="8" height="26" rx="4" fill="#0F172A" stroke="#60A5FA" strokeWidth="1.5">` |
| 扫描线 | `<path d="M14 22H30" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round">` |
| 圆心 | `<circle cx="22" cy="22" r="4" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5">` |
| 语义 | 权限校验关卡：双门代表两道验证关卡，扫描线代表正在执行的策略检查，圆心代表校验核心引擎。隐喻"AI 的每一步建议都必须通过策略校验"。 |
| 动画 | 扫描线脉冲：`animation: scan-gate 1.8s ease-in-out infinite`（CSS @keyframes，具体实现在 globals.css）。 |

#### ExecutionLedgerGlyph

| 属性 | 值 |
|------|-----|
| 尺寸 | 44x44, viewBox `0 0 44 44` |
| 账本框 | `<rect x="11" y="8" width="22" height="28" rx="5" fill="#0F172A" stroke="#60A5FA" strokeWidth="1.5">` |
| 写入线 | 3 条 `<path d="M16 17H28/H25/H22" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round">` 分别在 y=17, 23, 29 |
| 印章 | `<circle cx="30" cy="30" r="4" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5">` |
| 语义 | 执行记录账本：账本框代表记录容器，3 条写入线代表记录正在被逐行写入（长度递减表示新记录越来越短/精确），印章代表每条记录被最终确认盖章。隐喻"决策执行的每一步都被永久记录"。 |
| 动画 | 写入线绘制：`stroke-dasharray: 20; stroke-dashoffset: 20; animation: ledger-write 2.2s ease-in-out infinite`，3 条线延迟 0s, 0.18s, 0.36s（序贯写入效果）。印章脉冲：`transform-origin: center; animation: ledger-seal 2.2s ease-in-out infinite`。 |

#### MaskedDataGlyph

| 属性 | 值 |
|------|-----|
| 尺寸 | 56x56, viewBox `0 0 56 56` |
| 卡片背景 | `<rect x="10" y="14" width="36" height="28" rx="8" fill="#EFF6FF">` |
| 数据线 | `<path d="M18 24H38" stroke="#2563EB" strokeWidth="2" strokeLinecap="round">` (主数据) |
| 虚化线 | `<path d="M18 32H32" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" opacity=".5">` (模糊数据) |
| 遮罩区 | `<rect x="20" y="20" width="16" height="4" rx="2" fill="#2563EB" fillOpacity=".2">` |
| X 圆 | `<circle cx="38" cy="20" r="4" fill="#2563EB" fillOpacity=".15" stroke="#2563EB" strokeWidth="1.5">` + X 交叉线 |
| 语义 | 数据脱敏保护：卡片代表数据容器，主数据线代表可见字段，虚化线 (opacity .5) 代表脱敏后的内容，遮罩区代表被覆盖的敏感字段，X 圆代表"此字段已脱敏"标记。隐喻"你的数据不会裸奔"。 |
| 动画 | 无独立动画 -- Trust Card 内静态展示，依赖卡片入场动画（GSAP opacity+y）。 |

#### PermissionBoundaryGlyph

| 属性 | 值 |
|------|-----|
| 尺寸 | 56x56, viewBox `0 0 56 56` |
| 容器 | `<rect x="10" y="12" width="36" height="32" rx="10" fill="#EFF6FF">` |
| 水平网格 | `<path d="M18 28H38" stroke="#2563EB" strokeWidth="2" strokeLinecap="round">` |
| 垂直网格 | `<path d="M28 18V38" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" opacity=".35">` |
| Agent 点 | `<circle cx="22" cy="28" r="4" fill="#2563EB">` |
| 边界墙 | `<path d="M38 20V36" stroke="#0F172A" strokeWidth="2" strokeLinecap="round">` |
| 语义 | 权限边界控制：容器代表系统范围，网格代表操作空间，Agent 点代表 AI 代理（正在边界内活动），边界墙 (深色 `#0F172A`) 代表不可逾越的权限界限。隐喻"AI 只能在权限范围内活动"。 |
| 动画 | Agent 点微移：`animation: boundary-stop 2.4s ease-in-out infinite`（CSS @keyframes，模拟 agent 在边界内探索但不越界）。 |

#### AuditTrailCardGlyph

| 属性 | 值 |
|------|-----|
| 尺寸 | 56x56, viewBox `0 0 56 56` |
| 环形路径 | `<path d="M14 16H28C34 16 38 20 38 26C38 32 34 36 28 36H18" stroke="#2563EB" strokeWidth="2" strokeLinecap="round">` |
| 检查点 1 | `<circle cx="14" cy="16" r="3" fill="#93C5FD">` (最浅) |
| 检查点 2 | `<circle cx="38" cy="26" r="3" fill="#60A5FA">` (中等) |
| 检查点 3 | `<circle cx="18" cy="36" r="3" fill="#2563EB">` (最深) |
| 印章底 | `<circle cx="30" cy="26" r="6" fill="#DBEAFE">` |
| 确认勾 | `<path d="M27 26L29 28.5L33 23" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">` |
| 语义 | 行为审计追溯：环形路径代表审计流程（非直线，暗示曲折但完整），3 个检查点的色深递进 (`#93C5FD` -> `#60A5FA` -> `#2563EB`) 代表审计深度递增（越往后检查越严格），印章+对勾代表审计通过确认。隐喻"每一次建议、确认、回流都有审计记录"。 |
| 动画 | 无独立动画 -- Trust Card 内静态展示。 |

### 4.4.2 ValueCards Mini Diagrams (3 个)

#### FidelityDiagram

| 属性 | 值 |
|------|-----|
| viewBox | `0 0 180 64` |
| 输入节点 | 3 个 `<circle cx="18" cy={16,32,48} r="4" fill="#93c5fd">` |
| 连接路径 | 3 条贝塞尔曲线从左汇聚到中心：`d="M24 16C52 16 58 32 86 32"`, 直线 `d="M24 32H86"`, 对称曲线 |
| 核心 | `<rect x="86" y="20" width="28" height="24" rx="12" fill="rgba(37,99,235,0.08)" stroke="#2563eb" strokeWidth="1.5">` |
| 核心标记 | `<path d="M94 32H106" stroke="#2563eb" strokeWidth="2" strokeLinecap="round">` |
| 输出 | `<circle cx="158" cy="32" r="6" fill="#2563eb">` + 确认勾 |
| 语义 | 信息保真流程：3 个分散的输入信号 (日报/群聊/会议纪要) 通过汇聚路径流入核心处理区，核心内部的水平线代表信息被结构化，输出节点带确认勾代表保真信息已输出。对应 Value Card "更少失真"。 |

#### CompressionDiagram

| 属性 | 值 |
|------|-----|
| viewBox | `0 0 180 64` |
| 数据线 | 4 条水平线 `d="M16 {14,26,38,50}H62"` stroke `#93c5fd` |
| 高核心 | `<rect x="70" y="12" width="32" height="40" rx="14" fill="rgba(37,99,235,0.08)" stroke="#2563eb" strokeWidth="1.5">` -- 高度大于宽，象征压缩 |
| 核心圆 | `<circle cx="86" cy="32" r="4" fill="#2563eb">` |
| 输出路径 | `<path d="M102 32H128" stroke="#60a5fa" strokeWidth="2">` |
| Brief 卡 | `<rect x="132" y="18" width="30" height="28" rx="8" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5">` + 2 条内容线 |
| 语义 | 信息压缩流程：4 条数据线代表大量原始数据输入，高核心（高宽比 > 1）象征压缩引擎（将大量信息压缩到小空间），输出的 Brief 卡代表压缩后的结构化简报（2 条线代表内容和摘要）。对应 Value Card "更快判断"。 |

#### AuditDiagram

| 属性 | 值 |
|------|-----|
| viewBox | `0 0 180 64` |
| 审计路径 | `<path d="M20 18H70C92 18 94 46 120 46H150" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round">` -- 非直线，分两段方向 |
| 检查点 | 3 个 `<circle r="5" fill="#2563eb">` 在 (20,18), (78,18), (120,46) |
| 印章底 | `<circle cx="152" cy="46" r="11" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5">` |
| 确认勾 | `<path d="M147 46L151 50L158 41" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">` |
| 语义 | 可追踪执行流程：路径的弯折（从 y=18 到 y=46）代表执行过程不是简单的直线，而是有转折和调整的复杂过程。3 个检查点代表关键审计节点，最终印章确认代表执行完成且全程可追溯。对应 Value Card "可追踪执行"。 |

### 4.4.3 Brand Logo: Octopus (章鱼)

| 属性 | 值 |
|------|-----|
| viewBox | `0 0 416.99 407.84` |
| 渲染尺寸 | 21x21px (Header), 按需缩放 |
| 形态 | 章鱼形态 -- 由多组圆环 (`<circle>`) 和连接路径 (`<path>`) 组成的复杂有机结构 |
| 路径 | 主体为一个复杂的 SVG path，定义了章鱼的触手和身体轮廓 |
| 填充 | `#F8FAFC` (主体白色，带蓝色调的近白) |
| 眼睛 | 2 个 `<circle fill="#60A5FA">` (左眼 cx="162.19", 右眼 cx="254.8") -- 品牌眼色 |
| 语义 | AutoMage 品牌标识：章鱼的多触手隐喻"同时处理多个信号源"的能力。眼睛使用品牌蓝 (`#60A5FA`) 代表"AI 的视觉洞察力"。章鱼形态避免了通用的科技图标（大脑/齿轮/拼图），建立了独特的品牌辨识度。 |
| 容器 | 深色圆角方块 (34x34, rx=12)，背景 `linear-gradient(180deg, rgba(15,23,42,.98), rgba(30,41,59,.92))`，带内阴影 `inset 0 0 0 1px rgba(255,255,255,.12)` |
| 动效规格 | 见 4.5.4 |

### 4.4.4 System Diagrams (4 个)

#### Signal Console

| 属性 | 值 |
|------|-----|
| 类型 | HTML/CSS 模拟控制台（非纯 SVG） |
| 容器 | `background: var(--color-surface-deep)`, `border: 1px solid rgba(255,255,255,0.06)`, `borderRadius: var(--radius-lg)`, `padding: 24` |
| 窗口装饰 | macOS 风格三点：`#EF4444` (关闭), `#EAB308` (最小化), `#22C55E` (最大化)，直径 10px |
| 信号芯片 | 3 个 pill 形状态标签 (日报提交/success, 风险升高/warning, 决策待确认/active)，含状态点 |
| 柱状图 | 3 根渐变柱体 (Signals/Risks/Decisions)，从底部 scaleY 生长 |
| Pipeline 指示 | 4 阶段旋转显示：`['Signal intake', 'Risk detected', 'Decision pending', 'Confirmed']` |
| 语义 | 组织信号仪表盘：模拟一个正在运行的 AutoMage 控制台，展示实时信号处理状态。窗口三点 (macOS chrome) 隐喻"这是一个正在运行的桌面级应用"。 |

#### Loop Rail (FlowNavigation)

| 属性 | 值 |
|------|-----|
| 类型 | 纯 SVG (inline) |
| viewBox | `0 0 80 {dynamicHeight}` (高度由页面总高动态计算) |
| 轨道 | 垂直线 `<line x1="40" y1="0" x2="40" y2={height} stroke="var(--color-loop-path)" strokeWidth="2">` |
| 节点 | 6 个 `<circle cx="40" cy={computed} r={6|10}>`，动态 y 坐标基于对应 section 的页面位置 |
| 标签 | `<text>` 在节点右侧显示中文标签 (信号/压缩/审阅/决策/执行/学习) |
| 粒子 | `<circle r="4" fill="var(--color-loop-particle)">` + 2 个尾迹圆 (r=3, r=2) 沿轨道上下移动 |
| 脉冲 | 每个节点有 `<circle r="10" fill="var(--color-loop-node-glow)">` 光晕 |
| 语义 | The Loop 的线性投影：将环形闭环映射为垂直轨道，6 个节点对应 6 个 section，滚动时当前节点高亮、路径段变亮，光点粒子持续沿轨道流动。是页面的"进度条"和"导航锚点"。 |

#### Loop Seal (Footer)

| 属性 | 值 |
|------|-----|
| 类型 | 纯 SVG (inline) |
| viewBox | `0 0 520 520` (RING_CX*2, RING_CY*2) |
| 轨道 | `<circle cx="260" cy="260" r="180" stroke="#3B82F6" strokeWidth="1.5" opacity="0.25" fill="none">` |
| 节点 | 6 个节点分布在环形轨道上，角度: -90, -30, 30, 90, 150, 210 |
| 节点双层 | 外层 `<circle class="node-outer" r={8->18} fill="#3B82F6" opacity={0->0.2}>` + 内层 `<circle class="node-inner" r={0->6} fill="#60A5FA">` |
| 信号点 | `<circle r="5" fill="#3B82F6">` 沿轨道路径运动 |
| 标签 | `<text>` 在节点上方/下方显示英文标签 (Signal/Compress/Review/Decide/Execute/Learn) |
| 语义 | The Loop 的完整闭环确认：环形轨道代表信息闭环的完整性，6 个节点同时亮起代表闭环已闭合，信号点沿轨道运动代表信息持续在闭环中流动。放置在 Footer (页面底部)，象征"所有信息最终回到行动"。 |

#### Particle Network (Footer 背景)

| 属性 | 值 |
|------|-----|
| 类型 | 纯 SVG (inline) + useParticles hook |
| viewBox | `0 0 1440 800` |
| 节点 | 10 个静态圆点 `<circle r="3" fill="#3B82F6" opacity="0.08">` |
| 路径 | 12 条贝塞尔曲线连接节点，`stroke="#3B82F6" strokeWidth="1" opacity="0.06"` |
| 粒子 | 每条路径 1 个粒子，radius [1.5, 3]，color `#3B82F6`，opacity [0.15, 0.25]，speed [5, 9]s |
| 语义 | 组织信息的底层连接网络：节点代表数据源/处理单元，路径代表数据连接，粒子代表正在传输的信号。视觉上极度克制 (opacity 6-25%)，作为背景隐喻"信息始终在流动"。 |

#### Page Particles (全屏背景)

| 属性 | 值 |
|------|-----|
| 类型 | 纯 SVG (inline) + useParticles hook |
| viewBox | `0 0 1920 1080` |
| 路径 | 5 条贝塞尔曲线 `stroke="#3B82F6" strokeWidth="1" opacity="0.06"` |
| 粒子 | 桌面: 每路径 2 粒子, 移动端: 每路径 1 粒子; radius [2, 4], color `#3B82F6`, opacity [0.2, 0.5], speed [3, 5]s |
| 尾迹 | 每粒子 1 个尾迹, delay 0.08s, scale 0.6, opacity 0.3 |
| 布局 | `position: fixed; inset: 0; pointer-events: none; z-index: 1` |
| 语义 | 全局数据流动隐喻：5 条纵向曲线代表信息从上游到下游的自然流动，粒子沿曲线运动代表数据持续传递。视觉上极度克制，用户几乎感知不到但潜意识感受到"系统在运转"。 |

---

## 4.5 动效要求 Animation Requirements

### 4.5.1 动画类型矩阵

| 动画类型 | 英文术语 | 对应信息流语义 | 使用场景 |
|---------|---------|--------------|---------|
| **轨道旋转** | Orbit | 数据环绕处理 | AILogo 3 轨道点持续旋转 |
| **路径绘制** | Stroke Draw | 信息正在生成/记录 | HumanLogo 指纹/确认勾; ValueCards 路径线; Ledger 写入线 |
| **脉冲呼吸** | Pulse/Breathe | 系统活跃/节点激活 | FlowNavigation 节点光晕; StatusDot; SignalConsole active 点 |
| **光点流动** | Particle Flow | 数据持续传输 | Loop Rail 粒子; PageParticles; Footer Network; Approval Bridge 点 |
| **序贯点亮** | Sequential Light-up | 流程正在推进 | Footer Seal 节点逐个亮起; Pipeline stage 逐个展示 |
| **路径扫描** | Path Scan | 正在执行检查 | PolicyGate 扫描线 |
| **边界探索** | Boundary Explore | AI 在权限内活动 | PermissionBoundary agent 点微移 |
| **信号旋转** | Signal Rotation | 流程阶段轮换 | SignalConsole Pipeline 指示器 |
| **脉搏缩放** | Node Pulse | 节点活跃状态 | ValueCards amNodePulse |
| **入场揭示** | Reveal | 内容进入视口 | 所有 section 的 ScrollTrigger 入场动画 |

### 4.5.2 每个 Glyph 必须有的动画类型

| Glyph | 动画类型 | 具体实现 | 时长 | 缓动 |
|-------|---------|---------|------|------|
| **AILogo** | 轨道旋转 (Orbit) | 3 个轨道点绕中心旋转 | `5s` | `linear` |
| **HumanLogo** | 路径绘制 (Stroke Draw) | 指纹曲线 + 确认勾序贯绘制 | `2.8s` | `ease-in-out` |
| **PolicyGateGlyph** | 路径扫描 (Path Scan) | 扫描线在双门间脉冲移动 | `1.8s` | `ease-in-out` |
| **ExecutionLedgerGlyph** | 路径绘制 (Stroke Draw) + 脉冲 | 写入线序贯绘制 + 印章脉冲 | `2.2s` | `ease-in-out` |
| **MaskedDataGlyph** | 无独立动画 | 依赖容器入场动画 (GSAP) | `0.4s` | `power2.out` |
| **PermissionBoundaryGlyph** | 边界探索 (Boundary Explore) | agent 点在边界内微移 | `2.4s` | `ease-in-out` |
| **AuditTrailCardGlyph** | 无独立动画 | 依赖容器入场动画 (GSAP) | `0.4s` | `power2.out` |
| **FidelityDiagram** | 路径绘制 + 脉搏缩放 | 路径线绘制 + 节点脉冲 | `2.8s` | `ease-in-out` |
| **CompressionDiagram** | 路径绘制 + 脉搏缩放 | 数据线绘制 + 节点脉冲 | `2.8s` | `ease-in-out` |
| **AuditDiagram** | 路径绘制 + 脉搏缩放 | 审计路径绘制 + 节点脉冲 | `2.8s` | `ease-in-out` |
| **Octopus Logo** | 入场揭示 | Logo 缩放入场 + 眼睛弹出 | `0.48s` + `0.3s` | `power2.out` + `back.out(2.5)` |
| **Signal Console** | 入场揭示 + 信号旋转 | 整体渐入 + Pipeline 阶段轮换 | `0.4s` 入场, `3s` 轮换 | `power2.out` |
| **Loop Rail** | 光点流动 + 脉冲呼吸 | 粒子沿轨道流动 + 节点光晕 | `3s` 流动, `1s` 脉冲 | `sine.inOut`, `sine.inOut` |
| **Loop Seal** | 序贯点亮 + 光点流动 | 节点逐个亮起 + 信号点沿轨道运动 | scrub 驱动 (滚动关联) | `power2.out`, `none` |
| **Particle Network** | 光点流动 | 粒子沿贝塞尔路径运动 | `5-9s` (随机) | 自动 (useParticles) |
| **Page Particles** | 光点流动 | 粒子沿贝塞尔路径运动 + 尾迹 | `3-5s` (随机) | 自动 (useParticles) |

### 4.5.3 动画时长规范

#### CSS @keyframes 时长

| 时长等级 | 值 | 使用场景 |
|---------|-----|---------|
| 微交互 | `1.5s` - `1.8s` | 快速脉冲 (PolicyGate 扫描, StatusDot 闪烁) |
| 标准循环 | `2.2s` - `2.8s` | 路径绘制、写入线、指纹绘制 (Ledger, Human, ValueCards) |
| 慢速循环 | `5s` | 轨道旋转 (AILogo) |
| 探索微移 | `2.4s` | 边界探索 (PermissionBoundary) |

#### GSAP 时长

| 时长等级 | 值 | 使用场景 |
|---------|-----|---------|
| 微动画 | `0.1s` - `0.2s` | hover 态, 状态切换 |
| 入场动画 | `0.3s` - `0.5s` | 元素从 opacity:0 到 1, y 偏移恢复 |
| 序贯动画 | `0.06s` - `0.15s` stagger | 多元素依次出现 |
| 戏剧性展示 | `0.6s` - `0.8s` | 核心球脉冲, 柱状图生长 |
| 粒子流动 | `3s` - `9s` | Loop Rail 粒子, Page/Network 粒子 |

### 4.5.4 动画缓动函数规范

| 缓动 | GSAP 表达式 | CSS 等效 | 使用场景 |
|------|------------|---------|---------|
| **power2.out** | `ease: 'power2.out'` | `cubic-bezier(0.16, 1, 0.3, 1)` ≈ `--ease-out` | 入场动画、状态切换（主缓动，80% 场景使用） |
| **power2.in** | `ease: 'power2.in'` | `cubic-bezier(0.55, 0, 1, 0.45)` ≈ `--ease-in` | 退出/消失动画（噪声碎片被吸入核心） |
| **sine.inOut** | `ease: 'sine.inOut'` | `cubic-bezier(0.37, 0, 0.63, 1)` | 粒子流动、脉冲呼吸（平滑往复运动） |
| **back.out(2.5)** | `ease: 'back.out(2.5)'` | 无直接 CSS 等效 | 品牌标识特殊动画（Logo 眼睛弹出，仅此一处） |
| **back.out(2)** | `ease: 'back.out(2)'` | 无直接 CSS 等效 | Footer Seal 节点内圆弹出 |
| **linear** | `ease: 'linear'` | `linear` | 轨道旋转（AILogo 轨道点）、循环粒子 |
| **power1.in/out** | `ease: 'power1.in'` / `'power1.out'` | -- | 粒子透明度变化、轻柔状态切换 |
| **none** (scrub) | `ease: 'none'` | `linear` | ScrollTrigger scrub 动画（路径绘制、节点点亮） |

**禁止的缓动**: `bounce`, `elastic`, `steps` -- 违反"克制"调性。

### 4.5.5 Octopus Logo 动效规格

Logo 启动动画（页面加载时触发）：

| 阶段 | 动画 | 时长 | 缓动 | 延迟 |
|------|------|------|------|------|
| 1. Logo 容器 | `opacity: 0->1, y: -3->0, scale: 0.96->1` | `0.48s` | `power2.out` | `0.1s` |
| 2. 眼睛出现 | `opacity: 0->1, scale: 0.5->1` (两眼 stagger 0.08s) | `0.3s` | `back.out(2.5)` | `-=0.15s` (与容器重叠) |
| 3. 品牌名 | `opacity: 0->1, y: 5->0` | `0.3s` | `power2.out` | `-=-0.12s` |
| 4. 导航项 | `opacity: 0->1, y: 5->0` (stagger 0.06s) | `0.25s` | `power2.out` | 依次 |
| 5. 状态芯片 | `opacity: 0->1, y: 5->0` | `0.25s` | `power2.out` | `-=-0.05s` |
| 6. CTA 按钮 | `opacity: 0->1, y: 5->0` | `0.3s` | `power2.out` | `-=-0.1s` |

**品牌标记悬停态**: 仅在滚动后 (isDark) 添加 `box-shadow` 变化，不添加缩放或旋转。

### 4.5.6 Reduced Motion 回退

**强制要求**: 所有动画必须在 `prefers-reduced-motion: reduce` 下提供回退。

| 回退策略 | 适用组件 | 具体实现 |
|---------|---------|---------|
| CSS `animation: none !important` | SecuritySection Glyphs, ValueCards Diagrams | `@media (prefers-reduced-motion: reduce) { .am-mini-diagram * { animation: none !important; } }` |
| GSAP `gsap.set()` 设置最终态 | HeroSection, CompareSection, SecuritySection 入场 | `if (reduced) { gsap.set(el, { opacity: 1, y: 0 }); return; }` |
| 跳过 GSAP timeline 创建 | FlowNavigation, Footer | `if (reduced) return;` |
| 移除粒子 | useParticles hook | `if (prefersReducedMotion) return;` 不创建粒子 |
| 简化入场 | CommandHeader | `if (reducedMotion) { setBooted(true); return; }` 直接展示最终态 |

**最终态规范**:
- 所有元素 `opacity: 1`
- 所有描边完全绘制 (`stroke-dashoffset: 0`)
- 所有节点显示 (`r` 值为最终态)
- 所有 transform 归零 (`y: 0, scale: 1`)

> **证据来源**: 全部 10 个组件文件中均实现了 reduced-motion 检测。`globals.css` L236-245 (推测存在) 定义了全局回退。

---

## 4.6 设计反面约束 Design Anti-patterns

### 4.6.1 禁止的插图风格

| 禁止项 | 原因 | 替代方案 |
|--------|------|---------|
| **具象人物插画** | 与"高度抽象"风格矛盾，分散对信息流叙事的注意力 | 使用抽象的 HumanLogo (指纹+勾) 代表人类角色 |
| **3D 渲染/等轴测图** | 与 2D 几何语言不兼容，增加视觉复杂度 | 使用平面几何 (circle, rect, path) |
| **扁平插画 (Flat illustration)** | 通用 SaaS 风格，与竞品混淆 | 使用线条描边 + 最小填充的自定义 Glyph |
| **渐变彩虹色** | 违反"克制"调性 | 仅使用 `#1E3A5F -> #3B82F6` 品牌渐变 |
| **AI 大脑/神经网络插画** | 暗示"AI 替代人类"，与品牌核心矛盾 | 使用六角几何 + 轨道旋转的 AILogo |
| **对话气泡** | 暗示"聊天工具"定位 | 使用 Pipeline 流程图和 Loop 路径 |
| **人物照片/团队照** | 与"系统/OS"调性不匹配 | 使用抽象信号图标和数据图表 |
| **装饰性背景插画** | 违反"每个元素都有存在的理由"原则 | 使用极低透明度的 Particle Network 作为隐喻背景 |

### 4.6.2 禁止的图标风格

| 禁止项 | 原因 | 替代方案 |
|--------|------|---------|
| **FontAwesome / Material Icons** | 通用图标库丧失品牌辨识度 | 使用自定义 SVG Glyph 系统 |
| **Lucide / Heroicons / Phosphor** 用于品牌标识 | 品牌标识 Glyph 必须使用自定义 SVG | 品牌标识 Glyph（AILogo, HumanLogo, PolicyGate 等）必须使用自定义 SVG。功能性 UI 图标允许使用 lucide-react |
| **通用 SaaS 图标** (火箭/齿轮/拼图/灯泡) | 与竞品 (飞书/钉钉/Notion) 混淆 | 使用代码中已有的 Glyph: AILogo, PolicyGate, ExecutionLedger |
| **Emoji 作为图标** | 与"精密"和"权威"调性冲突 | 使用自定义 SVG |
| **位图图标** (PNG/JPG) | 违反"零位图"原则 | 使用 inline SVG |

### 4.6.3 禁止的动画风格

| 禁止项 | 原因 | 替代方案 |
|--------|------|---------|
| **装饰性粒子雨/雪花** | 纯装饰动画违反"每个动画必须传达信息流语义" | 使用有路径约束的 Particle Flow (沿贝塞尔曲线运动)。例外：背景装饰粒子（如 InfoLoopSection 的 SIGNAL_PARTICLES）允许使用 CSS 漂浮动画，但必须有 reduced-motion 回退 |
| **循环弹跳 (bounce)** | 违反"克制"调性 | 使用 `power2.out` 或 `sine.inOut` |
| **弹性效果 (elastic)** | 过于活泼，破坏信任感 | 使用 `power2.out` 或 `back.out(2.5)` (仅限品牌标识) |
| **闪烁/抖动 (flash/shake)** | 破坏"精密"和"信任"调性 | StatusDot 的 `pulse` 除外（表达系统活跃状态） |
| **无意义的几何漂浮** | 没有信息流语义的纯装饰 | 使用有明确路径和语义的 Particle Network |
| **连续旋转 (spin)** | 像 loading spinner，暗示"等待"而非"运转" | 使用 AILogo 轨道点旋转（有几何约束的有意义旋转） |
| **弹出/弹入 (pop-in)** | 过于游戏化 | 使用 `power2.out` 的 opacity + y 偏移入场 |
| **滚动视差 (parallax)** | 复杂度过高，与"极简留白"冲突 | 使用 ScrollTrigger scrub 驱动的序贯揭示 |
| **无限循环的 hover 动画** | 分散注意力 | hover 仅使用 150-200ms 的 transform/shadow 过渡 |

### 4.6.4 动画密度限制

| 规则 | 规范 |
|------|------|
| 同时可见动画上限 | 页面任意时刻最多 **3 个独立动画循环** (粒子网络 + 当前 section Glyph 动画 + Header StatusDot) |
| 入场动画不重叠 | 同一 section 内的入场动画通过 stagger 间隔 0.06-0.15s |
| 循环动画不闪烁 | 所有循环动画的 opacity 变化范围不低于 0.2 (最低可见) 到 1.0 |
| 动画不能延迟用户操作 | 所有入场动画使用 `toggleActions: 'play none none none'` (不 reverse) |

---

## 附录 A: Glyph SVG 路径速查表

| Glyph | viewBox | 元素数量 | 独立动画 | 证据文件:行号 |
|-------|---------|---------|---------|-------------|
| AILogo | 0 0 48 48 | 5 (rect + hex + center + 3 dots) | amOrbit 5s | SecuritySection.tsx:10-19 |
| HumanLogo | 0 0 48 48 | 5 (rect + circle + 2 paths + check) | amFingerDraw 2.8s + amCheckDraw 2.8s | SecuritySection.tsx:22-35 |
| PolicyGateGlyph | 0 0 44 44 | 4 (2 rects + scan + circle) | scan-gate 1.8s | SecuritySection.tsx:39-48 |
| ExecutionLedgerGlyph | 0 0 44 44 | 5 (rect + 3 lines + dot) | ledger-write 2.2s + ledger-seal 2.2s | SecuritySection.tsx:50-59 |
| MaskedDataGlyph | 0 0 56 56 | 7 (rect + 2 lines + mask rect + circle + 2 X lines) | 无 | SecuritySection.tsx:64-76 |
| PermissionBoundaryGlyph | 0 0 56 56 | 5 (rect + 2 paths + circle + wall) | boundary-stop 2.4s | SecuritySection.tsx:78-88 |
| AuditTrailCardGlyph | 0 0 56 56 | 6 (path + 3 circles + seal bg + check) | 无 | SecuritySection.tsx:90-101 |
| FidelityDiagram | 0 0 180 64 | 8 (3 circles + 3 paths + rect + path + circle + check) | amLineDraw 2.8s + amNodePulse 2.8s | ValueCardsSection.tsx:10-27 |
| CompressionDiagram | 0 0 180 64 | 8 (4 lines + rect + dot + path + rect + 2 lines) | amLineDraw 2.8s + amNodePulse 2.8s | ValueCardsSection.tsx:29-47 |
| AuditDiagram | 0 0 180 64 | 6 (path + 3 circles + seal bg + check) | amLineDraw 2.8s + amNodePulse 2.8s | ValueCardsSection.tsx:49-62 |

## 附录 B: 颜色到 Token 迁移清单

| 当前硬编码 | 出现 Glyph | 目标 Token | 迁移方式 |
|-----------|-----------|-----------|---------|
| `#60A5FA` | AILogo, HumanLogo, PolicyGate, AuditTrail | `var(--color-glyph-stroke)` | style 对象 |
| `#93C5FD` | AILogo, HumanLogo, PolicyGate, Ledger, Fidelity, Compression, Audit | `var(--color-glyph-stroke-light)` | style 对象 |
| `#2563EB` | PolicyGate, Ledger, MaskedData, PermissionBoundary, AuditTrail, Fidelity, Compression, Audit | `var(--color-glyph-stroke-deep)` | style 对象 |
| `#DBEAFE` | PolicyGate, Ledger, Compression, Audit | `var(--color-glyph-fill)` | style 对象 |
| `#EFF6FF` | MaskedData, PermissionBoundary | `var(--color-glyph-fill-subtle)` | style 对象 |
| `#0F172A` | AILogo, HumanLogo, PolicyGate, Ledger, PermissionBoundary | `var(--color-surface-dark)` | style 对象 |
| `#3B82F6` | PageParticles, Footer Network | `var(--color-brand-accent)` | 已部分使用 CSS var |
| `#60A5FA` | Octopus Logo 眼睛 | `var(--color-brand-eye)` (待建) | style 对象 |
| `#F8FAFC` | Octopus Logo 主体 | 保留硬编码 (品牌标识) | 不迁移 |

> **迁移注意**: SVG 属性 `fill` 和 `stroke` 在 JSX 中直接写 `var(--color-*)` 在所有现代浏览器中均有效（Chrome 80+, Firefox 72+, Safari 13.1+）。但需注意 `fillOpacity` 和 `strokeWidth` 等属性不支持 CSS Variable。
