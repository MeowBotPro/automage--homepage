# AutoMage 设计规范 Design System Specification

> 版本: 1.0.0 | 日期: 2026-05-14 | 基于 AutoMage Homepage v1.0 代码库
>
> 本文件为 AutoMage 官网首页的**唯一权威设计规范**。所有子文档（01-06）为详细参考，本文件为可独立阅读的完整摘要与修复后的统一标准。

---

## 目录

1. [品牌核心 Brand Core](#1-品牌核心-brand-core) (详见 `01-brand-core.md`)
2. [视觉系统 Visual System](#2-视觉系统-visual-system) (详见 `02-visual-system.md`，已修复不一致)
3. [组件规范 Component & Layout](#3-组件规范-component--layout) (详见 `03-component-layout.md`)
4. [插图风格 Illustration Style](#4-插图风格-illustration-style) (详见 `04-illustration-style.md`)
5. [插图 Prompt 指南 Illustration Prompts](#5-插图-prompt-指南-illustration-prompts) (详见 `05-illustration-prompts.md`)
6. [动效语言 Motion Language](#6-动效语言-motion-language) (详见 `06-motion-language.md`，已修复不一致)
7. [一致性审查 Consistency Audit](#7-一致性审查-consistency-audit) (详见 `07-consistency-audit.md`)

---

## 设计规范摘要 Design System Summary

以下摘要涵盖所有关键设计决策，可独立阅读，无需打开子文档。

### 品牌定位

AutoMage 是**组织信息流 OS**，将前线噪声压缩为结构化判断，将决策转化为任务，将执行结果回流到数据闭环。它不是聊天工具、不是项目管理器、不是 BI 仪表盘。核心心智模型是 **The Loop** 六节点闭环：Signal -> Compress -> Review -> Decide -> Execute -> Learn。

品牌面向中国企业的 Boss/决策者/高管，核心诉求是：AI 压缩信息，管理者只做判断。AI 可以建议，但不能越权。系统负责生成选项，人负责做决定。

品牌调性五关键词：**权威** (Authoritative)、**克制** (Restrained)、**精密** (Precise)、**流动** (Flowing)、**信任** (Trustworthy)。

### 色彩速查

#### 品牌四色谱

| 角色 | Token | HEX | OKLCH | CSS Variable | 语义 | 禁止场景 |
|------|-------|-----|-------|--------------|------|---------|
| **Primary** | `brand-primary` | `#1E3A5F` | `oklch(0.25 0.04 250)` | `--color-brand-primary` | 深海蓝 -- 人类权威、决策层、不可动摇的最终确认 | 不可用于 AI 建议节点、AI 状态指示 |
| **Accent** | `brand-accent` | `#3B82F6` | `oklch(0.55 0.18 260)` | `--color-brand-accent` | 信号蓝 -- AI 活跃连接、建议传递、节点间路径 | 不可用于"人类已确认"状态 |
| **Accent Alt** | `brand-accent-alt` | `#6366F1` | `oklch(0.50 0.20 280)` | `--color-brand-accent-alt` | 靛蓝 -- 谨慎辅助高亮，极少量视觉分层 | 不作主色、不作大面积背景 |
| **Cyan** | `brand-cyan` | `#38BDF8` | `oklch(0.70 0.12 220)` | `--color-brand-cyan` | 高亮光点 -- 数据流动、进程推进、信号粒子 | 不做标题色、Card 背景、品牌标识色 |

> **修复说明**: `brand-accent-alt` (#6366F1) 在 `globals.css` L7 中已定义，但 `01-brand-core.md` 1.4 节遗漏了此色。本规范将其正式纳入品牌色谱，语义定义见上方表格。

#### 信号色体系（辅助，仅状态标注）

| Token | HEX | CSS Variable | 语义 | 使用场景 |
|-------|-----|--------------|------|---------|
| `signal-normal` | `#3B82F6` | `--color-signal-normal` | 正常信号 | 日报提交等常规状态 |
| `signal-warning` | `#F59E0B` | `--color-signal-warning` | 预警信号 | 风险升高、预算超阈值 |
| `signal-risk` | `#EF4444` | `--color-signal-risk` | 高危信号 | 决策卡高风险标签、错误状态 |
| `signal-success` | `#22C55E` | `--color-signal-success` | 完成信号 | 闭环完成、已确认、Loop closed |

#### Gate 门控色（权限语义）

| Token | HEX | CSS Variable | 语义 |
|-------|-----|--------------|------|
| `gate-ai` | `#3B82F6` | `--color-gate-ai` | AI 建议侧 |
| `gate-human` | `#1E3A5F` | `--color-gate-human` | 人类确认侧 |
| `gate-unlocked` | `#22C55E` | `--color-gate-unlocked` | 门控通过 |
| `gate-locked` | `rgba(100, 116, 139, 0.3)` | `--color-gate-locked` | 门控锁定 |

#### 深色表面

| Token | HEX | CSS Variable | 语义 |
|-------|-----|--------------|------|
| `surface-dark` | `#0F172A` | `--color-surface-dark` | 系统内部、控制台、Inspector 面板 |
| `surface-deep` | `#0B1628` | `--color-surface-deep` | 最深背景层、Hero 全幅、Loop 区域 |

#### 颜色使用禁区

- Navy (`#1E3A5F`) 不用于 AI 侧 -- 专属于人类确认、决策层
- Blue (`#3B82F6`) 不用于人类确认 -- 专属于 AI 建议、信号路径
- 禁止纯灰 -- 中性色使用 Slate 色系（带蓝色调）
- 禁止暖色大面积 -- amber/red 仅用于信号警告
- Cyan (`#38BDF8`) 不做主色 -- 仅用于光点粒子和进程高亮

### 排版速查

#### 字体栈

```css
--font-sans: 'Inter', 'HarmonyOS Sans SC', 'Noto Sans SC', 'Source Han Sans SC', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-console: var(--font-jetbrains-mono), 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace;
```

- **主文本**: Inter（通过 `next/font/google` 加载，CSS var `--font-inter`）
- **等宽**: JetBrains Mono（通过 `next/font/google` 加载，CSS var `--font-jetbrains-mono`）
- **Console 面板**: 引用 `--font-jetbrains-mono`，回退到 IBM Plex Mono

> **修复说明**: `design-tokens.json` 的 sans 栈不含 `Noto Sans SC`，以 `globals.css` 为准（保留 Noto Sans SC 作为中文回退）。

#### 排版阶梯

| Token | 值 | font-weight | line-height | 典型场景 |
|-------|-----|-------------|-------------|---------|
| `text-xs` | `0.75rem` (12px) | 400 | 1.5 | 脚注、版权 |
| `text-sm` | `0.875rem` (14px) | 400-500 | 1.5 | 次要正文、按钮文字 |
| `text-base` | `1rem` (16px) | 400 | 1.5 | 正文默认 |
| `text-lg` | `1.125rem` (18px) | 500 | 1.5 | 卡片标题 |
| `text-xl` | `1.25rem` (20px) | 600 | 1.2 | 区段副标题 |
| `text-2xl` | `clamp(1.75rem, 3.5vw, 2.5rem)` | 600-700 | 1.2 | 区段标题 |
| `text-3xl` | `clamp(2rem, 4vw, 3rem)` | 700 | 1.1 | 主标题 |
| `text-4xl` | `clamp(2.5rem, 5vw, 4rem)` | 700 | 1.1 | Hero 主标题 |

### 动效速查

#### 缓动曲线系统

**CSS Duration Token（单次过渡/入场动画，权威值）**:

| Token | CSS Variable | 值 | 语义 | 使用场景 |
|-------|-------------|-----|------|---------|
| `instant` | `--duration-instant` | `80ms` | 微交互即时反馈 | focus ring、阴影切换、边框颜色变化 |
| `fast` | `--duration-fast` | `150ms` | 快速交互反馈 | hover 态、下划线变化、badge 过渡 |
| `normal` | `--duration-normal` | `300ms` | 标准过渡 | 卡片 hover、CSS transition 默认值 |
| `slow` | `--duration-slow` | `500ms` | 戏剧性入场 | 大型元素入场（卡片组、标题渐变） |
| `crawl` | `--duration-crawl` | `1000ms` | 缓慢展示 | 进度条、大范围描边绘制 |

> **修复说明**: `design-tokens.json` / `tokens.css` 中的 fast=200ms / normal=350ms / slow=600ms 为冲突值，以 `globals.css` 为准（150/300/500）。`instant` 和 `crawl` 为新增 token，需同步到 `globals.css`。详见附录 A。

> **重要区分**: 以上 duration token 适用于 CSS transition 和单次 GSAP 入场动画。CSS @keyframes 循环动画（如 Glyph 轨道旋转 5s、指纹绘制 2.8s）的时长由各组件自行定义，不受此阶梯约束（见 `04-illustration-style.md` 4.5.3）。

**CSS Easing Token（缓动函数）**:

| Token | CSS Variable | 公式 | 语义 | 使用场景 |
|-------|-------------|------|------|---------|
| `ease-out` | `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | 减速入场 | 80%+ 入场动画、hover 过渡（默认缓动） |
| `ease-in` | `--ease-in` | `cubic-bezier(0.55, 0, 1, 0.45)` | 加速离场 | 噪声碎片被吸入、淡出 |
| `ease-in-out` | `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | 平滑往返 | SVG path draw、Loop-back 路径绘制 |
| `ease-spring` | `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 微妙弹性过冲 | 品牌标记眼睛弹出（仅限此处） |

**GSAP 缓动与 CSS 近似映射**:

| GSAP 缓动 | CSS 语义近似 | 精确公式差异 | 使用场景 |
|-----------|-------------|-------------|---------|
| `power2.out` | `--ease-out` | 数学近似 | 所有 section 入场（默认） |
| `power2.in` | `--ease-in` | 数学近似 | 噪声碎片被吸入 |
| `back.out(2.5)` | `--ease-spring` | GSAP 特有过冲 | Logo 眼睛弹出（仅此一处） |
| `back.out(2)` | `--ease-spring` | GSAP 特有过冲 | Footer Seal 节点弹出 |
| `sine.inOut` | `--ease-in-out` (语义近似) | 不同数学曲线 | 粒子流动、脉冲呼吸 |
| `power2.inOut` | `--ease-in-out` (语义近似) | 不同数学曲线 | InfoLoop loop-back 路径绘制 |
| `none` / `linear` | `linear` | 完全一致 | 轨道旋转、ScrollTrigger scrub |

> **修复说明**: GSAP 缓动与 CSS 缓动在数学上不等价（例如 `sine.inOut` 为 `cubic-bezier(0.37, 0, 0.63, 1)`，与 CSS `--ease-in-out` 的 `cubic-bezier(0.65, 0, 0.35, 1)` 不同）。上表为"语义近似"，即视觉效果相似、用途相同。CSS 动画应使用 CSS token，GSAP 动画使用 GSAP 缓动名。

### 组件速查

#### 核心组件列表

| 组件 | 角色 | Loop 节点 | 主题 | max-width |
|------|------|-----------|------|-----------|
| CommandHeader | 全局导航栏 | -- | dark (毛玻璃) | `min(1180px, calc(100% - 32px))` |
| FlowNavigation | 右侧 Loop Rail 导航 | 6 节点 | -- | 80px (SVG rail) |
| HeroSection | 首屏信号控制台 | Signal | light | `max-w-7xl` (1280px) |
| LogoMarquee | 信号流无限滚动 | -- | dark | `min(1120px, calc(100vw - 48px))` |
| CompareSection | 噪声到决策转化 | Compress | light | 1100px |
| InfoLoopSection | 信息闭环模拟器 | Review | dark | 1000px |
| ValueCardsSection | 三大决策价值 | Decide | light | 1100px |
| MetricsBar | 指标数据 | -- | light | 1200px |
| SecuritySection | 安全门控 | Execute | light | 900px |
| Footer | 闭环收口 + 粒子网络 | Learn / Loop closed | dark | 1200px (links) |

#### Loop 节点命名体系（两层映射）

The Loop 有两层命名，概念层用于品牌叙事，技术层用于代码变量：

| 概念节点 | 代码变量名 | Section | 语义 |
|----------|-----------|---------|------|
| Signal | Staff | section-hero | 信号进入 |
| Compress | AI | section-compare | 噪声压缩 |
| Review | Manager | section-loop | 审阅确认 |
| Decide | Dream | section-value | 决策输出 |
| Execute | Boss | section-security | 执行确认 |
| Learn | Task | section-footer | 回流学习 |

> **修复说明**: 01-brand-core 的代码注释中使用了技术层名称（Staff/AI/Manager/Dream/Boss/Task），可能造成混淆。品牌叙事和对外文档应统一使用概念层名称（Signal/Compress/Review/Decide/Execute/Learn）。

#### z-index 层级

| 层级 | z-index | 组件 |
|------|---------|------|
| z-0 | 0 | Footer (揭示式布局底层) |
| z-1 | 1 | main-content-wrapper, PageParticles, AccordionItem 边框, ValueCards |
| z-50 | 50 | FlowNavigation (右侧 Loop Rail) |
| z-99 | 99 | Mobile Command Drawer (遮罩层) |
| z-100 | 100 | CommandHeader (最高可见层级) |

#### 样式方案四层体系

| 层级 | 方式 | 使用场景 |
|------|------|---------|
| 第 1 层 | CSS Custom Properties (`:root`) | 颜色、字体、间距、圆角、阴影、动效 token |
| 第 2 层 | Tailwind CSS 4 Utilities | 布局结构 (grid/flex)、响应式断点、通用间距 |
| 第 3 层 | Inline Styles | CSS variable 引用、`clamp()` 计算、条件样式、GSAP 初始状态 |
| 第 4 层 | Scoped `<style>` Tags | `@keyframes`、伪元素、复杂选择器、CSS mask/clip-path |

**禁止**: CSS Modules、Styled Components、CSS-in-JS、Tailwind `@apply`。

### 红线速查

**品牌一致性红线 Top 5**:

1. **禁止通用 SaaS 图标** -- 不使用火箭、齿轮、拼图、灯泡等。使用自定义 SVG Glyph 系统（AI Logo、Human Logo、Policy Gate、Execution Ledger）。
2. **禁止 AI 大脑/神经网络插画** -- 暗示"AI 替代人类"，与核心立场矛盾。使用六角几何 + 轨道旋转的 AI Logo。
3. **禁止对话气泡** -- 暗示"聊天工具"定位。使用 Pipeline 流程图和 Loop 路径。
4. **禁止装饰性动画** -- 每个动画必须传达信息流语义。粒子沿路径流动（非随机漂浮），节点激活有几何约束。
5. **禁止 `bounce`/`elastic` 缓动** -- 破坏"克制"和"精密"调性。`back.out` 仅限品牌标识特殊动画（Logo 眼睛弹出），其他场景禁止使用。

**动画禁区补充**:
- 禁止闪烁/抖动（StatusDot 的 pulse 除外 -- 表达系统活跃状态）
- 禁止鲜艳霓虹渐变 -- 仅使用 `#1E3A5F -> #3B82F6` 品牌渐变
- 所有动画必须有 `prefers-reduced-motion: reduce` 回退

---

## 1. 品牌核心 Brand Core

> 详细内容见 `specs/01-brand-core.md`

**核心要点**:

- **品牌定位**: 组织信息流 OS，将噪声压缩为决策，决策转化为任务，任务回流为数据
- **核心模型**: The Loop 六节点闭环 (Signal -> Compress -> Review -> Decide -> Execute -> Learn)
- **目标受众**: 中国企业 Boss / 决策者 / 高管
- **品牌调性**: 权威、克制、精密、流动、信任
- **文案风格**: 陈述句、数据化、结构化，禁止感叹号和情绪化表达
- **色彩语义**: Navy=人类权威, Blue=AI 连接, Cyan=数据粒子, Dark=系统内部

**品牌一致性红线**: 见上方"红线速查"章节

---

## 2. 视觉系统 Visual System

> 详细内容见 `specs/02-visual-system.md`

### 2.1 色彩系统

品牌色、语义色、信号色、Gate 色、Loop Rail 色的完整定义见上方"色彩速查"。

**WCAG 对比度关键数据**:

| 前景色 | 背景色 | 对比度 | WCAG |
|--------|--------|--------|------|
| `#0F172A` (text-primary) | `#FAFBFC` (page) | 17.23:1 | AAA |
| `#F1F5F9` (on-dark) | `#0F172A` (dark) | 16.30:1 | AAA |
| `#3B82F6` (accent) | `#0F172A` (dark) | 4.85:1 | AA |
| `#38BDF8` (cyan) | `#0F172A` (dark) | 8.33:1 | AAA |
| `#3B82F6` (accent) | `#FFFFFF` (card) | 3.68:1 | AA-lg only |

**不可用于白底文字**: `#60A5FA` (2.54:1), `#93C5FD` (1.80:1), `#22C55E` (2.28:1)

### 2.2 排版系统

字体栈和排版阶梯见上方"排版速查"。

### 2.3 间距系统

基于 4px 基础单位的倍数系统：

| Token | CSS Variable | 值 | 典型场景 |
|-------|-------------|-----|---------|
| `space-1` | `--space-1` | 4px | 图标与文字间距 |
| `space-4` | `--space-4` | 16px | 标准内边距 |
| `space-6` | `--space-6` | 24px | 水平内边距 (px-6)、卡片内边距 |
| `space-16` | `--space-16` | 64px | 区块间距 |
| `space-section` | `--space-section` | 140px | Section 上下 padding |

**统一规则**: 所有 section 使用 `padding-top: 140px; padding-bottom: 140px`（Hero 和 Footer 除外）。水平内边距统一 `padding: 0 24px`。

### 2.4 圆角系统

| Token | 值 | 典型场景 |
|-------|-----|---------|
| `radius-sm` | 6px | badge、chip、小按钮 |
| `radius-md` | 12px | 卡片、输入框 |
| `radius-lg` | 20px | 模态窗口、大面板 |
| `radius-xl` | 28px | 品牌容器、Hero 卡片 |
| `radius-full` | 9999px | 圆形按钮、状态点、Loop 节点 |

### 2.5 阴影系统

| Token | 值 | 使用场景 |
|-------|-----|---------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` | 卡片默认态 |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.06)` | 卡片 hover 态 |
| `shadow-lg` | `0 12px 32px rgba(0,0,0,0.08)` | 模态窗口 |
| `shadow-glow` | `0 0 20px rgba(59,130,246,0.15)` | 品牌色发光、聚焦态 |
| `shadow-node-glow` | `0 0 12px rgba(59,130,246,0.3)` | Loop 节点激活发光 |

### 2.6 Glassmorphism 参数

| 组件 | backdrop-filter | background | border |
|------|----------------|------------|--------|
| CommandHeader | `blur(22px)` | `rgba(15,23,42,0.78)` | `1px solid rgba(255,255,255,0.10)` |
| Mobile drawer panel | `blur(24px)` | `rgba(255,255,255,0.92)` | `1px solid rgba(148,163,184,0.2)` |
| Dual-key cards | `blur(14px)` | `rgba(255,255,255,0.78)` | `1px solid rgba(148,163,184,0.2)` |

---

## 3. 组件规范 Component & Layout

> 详细内容见 `specs/03-component-layout.md`

### 3.1 页面架构

12 个 section 按以下顺序渲染：CommandHeader -> HeroSection -> LogoMarquee -> CompareSection -> InfoLoopSection -> ValueCardsSection -> MetricsBar -> StorySection -> SocialProof -> SecuritySection -> BetaSection -> FAQSection -> Footer。

**非常规布局**:
- Footer 使用 `position: fixed; bottom: 0` + main `marginBottom: 100vh` 实现揭示式布局
- FlowNavigation 使用 `fixed right-10` 定位，仅在 lg (1024px+) 显示
- PageParticles 使用 `position: fixed; inset: 0; z-index: 1; pointer-events: none` 全屏覆盖
- Lenis 平滑滚动 + ScrollTrigger 同步（`lenis.on('scroll', () => ScrollTrigger.update())`）

### 3.2 Section 组件模式

所有 section 遵循统一骨架：
1. `'use client'` + useRef + useEffect
2. `safeContext()` 包裹所有 GSAP 操作（Turbopack 兼容性回退）
3. `ScrollTrigger` 初始化（多数使用 `start: 'top 80%'`）
4. `prefers-reduced-motion: reduce` 检测 + 最终态设置
5. 统一 `padding: var(--space-section)` 和 `max-width` 容器

### 3.3 技术约束

| 约束 | 规范 |
|------|------|
| 动画库 | GSAP 3.15 + ScrollTrigger + CSS @keyframes + rAF（禁止 Three.js / Framer Motion / Lottie） |
| 粒子预算 | 桌面 <= 12 路径 / 移动 <= 4 路径 |
| ScrollTrigger | <= 25 个实例 |
| SVG path | <= 50 个 |
| 构建 | Next.js 16.2.6 + React 19.2.4 + Tailwind CSS v4 + Static Export |

---

## 4. 插图风格 Illustration Style

> 详细内容见 `specs/04-illustration-style.md`

### 4.1 技术规范

- **渲染方式**: 全部 inline SVG (JSX)，禁止 `<img>`、sprite sheet、位图
- **stroke-width**: 主描边 1.5，强调 2，品牌角色 1.6
- **linecap/linejoin**: 全部 `round`，禁止 `butt`/`square`/`miter`
- **填充策略**: 最小填充，大面积使用半透明 overlay，SVG 内部不使用渐变

### 4.2 色彩约束

Glyph 专用色阶（蓝色光谱）：

| 色阶 | HEX | Token | 语义 |
|------|-----|-------|------|
| Deep | `#2563EB` | `--color-glyph-stroke-deep` | 深描边、高对比需求 |
| Medium | `#3B82F6` | `--color-brand-accent` | 主路径色 |
| Light | `#60A5FA` | `--color-glyph-stroke` | AI 侧发光感 |
| Pale | `#93C5FD` | `--color-glyph-stroke-light` | 轨道点、辅助线条 |
| Fill | `#DBEAFE` | `--color-glyph-fill` | 实体区域填充 |
| Fill Subtle | `#EFF6FF` | `--color-glyph-fill-subtle` | 大面积浅底填充 |

**核心原则**: 深底上用亮描边 (light blue)，亮底上用深描边 (deep blue)。

### 4.3 风格特征

- **抽象程度**: 高度抽象，零现实主义
- **几何语言**: Circle (节点/光点), Path (连接线/指纹), Rect (底座/门框), Hexagon (AI Logo), Line (扫描线/网格)
- **禁止元素**: `<polygon>`, `<ellipse>`, `<text>` (在 Glyph 内), `<filter>`
- **信息流语义**: 每个形状必须对应一个信息流概念

### 4.4 Glyph 体系速查

| Glyph | viewBox | 独立动画 | 时长 |
|-------|---------|---------|------|
| AILogo | 0 0 48 48 | 轨道旋转 (amOrbit) | 5s linear |
| HumanLogo | 0 0 48 48 | 指纹+勾绘制 (amFingerDraw + amCheckDraw) | 2.8s ease-in-out |
| PolicyGate | 0 0 44 44 | 扫描线脉冲 (scan-gate) | 1.8s ease-in-out |
| ExecutionLedger | 0 0 44 44 | 写入线+印章 (ledger-write + ledger-seal) | 2.2s ease-in-out |
| MaskedData | 0 0 56 56 | 无独立动画 | -- |
| PermissionBoundary | 0 0 56 56 | 边界探索 (boundary-stop) | 2.4s ease-in-out |
| AuditTrail | 0 0 56 56 | 无独立动画 | -- |

---

## 5. 插图 Prompt 指南 Illustration Prompts

> 详细内容见 `specs/05-illustration-prompts.md`

### 5.1 Prompt 构建框架

所有 prompt 必须包含三段品牌锚定前缀：

1. **风格锚定**: Minimalist technical illustration, geometric abstraction, clean vector linework 1.5-2px, round line caps, translucent layered overlays
2. **色彩约束**: Strict color palette: navy #1E3A5F / blue #3B82F6 / cyan #38BDF8 / dark #0F172A / off-white #FAFBFC. Signal only: amber #F59E0B / red #EF4444 / green #22C55E
3. **调性关键词**: Authoritative yet restrained, precise and clinical, flowing information energy, trustworthy system aesthetic

### 5.2 场景模板

| 编号 | 场景 | 尺寸 | 适用平台 |
|------|------|------|---------|
| 5.2.1 | 产品概念图 (Loop 闭环) | 自适应 | 文章配图 / deck |
| 5.2.2 | 信息流叙事图 (噪声到决策) | 1200x630 | og:image / 社交分享 |
| 5.2.3 | 权限门控图 (双密钥) | 自适应 | 安全主题文章 / deck |
| 5.2.4 | 社交媒体分享图 | 1200x630 / 900x500 | og:image / 微信 |
| 5.2.5 | 演讲/PPT 配图 | 1920x1080 (16:9) | 幻灯片背景 |

### 5.3 核心 Negative Prompt

每次必须包含：`flat illustration, 3D render, isometric 3D, cartoon, anime, cyberpunk, neon, photorealistic, brain neural network, chat bubbles, rocket icon, gear icon, warm colors, pure gray, decorative elements`

---

## 6. 动效语言 Motion Language

> 详细内容见 `specs/06-motion-language.md`

### 6.1 核心原则

- **"Animation as information"** -- 每个动画必须传达信息流语义
- **框架限制**: GSAP 3.15 + Lenis + CSS Keyframes（禁止 Three.js / Framer Motion / Lottie）
- **四种类型**: entrance (入场), loop (循环), feedback (交互反馈), narrative (叙事)

### 6.2 Section 动效矩阵

| Section | 入场缓动 | ScrollTrigger | Reduced Motion 回退 |
|---------|---------|---------------|-------------------|
| CommandHeader | `power2.out`, `back.out(2.5)` (eyes) | 首次加载 | `setBooted(true)` 直接展示 |
| HeroSection | `power2.out` | 首次加载 | `gsap.set` opacity:1, y:0 |
| CompareSection | `power2.out`, `power2.in` (吸入) | `start: top 70%` | 噪声缩至 0.6, 决策卡直接显示 |
| InfoLoopSection | `power2.out`, `none` (scrub) | `pin: true, scrub: 0.5` | 跳过 timeline |
| ValueCardsSection | `power2.out` | `start: top 80%` | `gsap.set` 最终态 |
| SecuritySection | `power2.out` | `start: top 75%` | `gsap.set` 最终态 |
| Footer | `power2.out`, `back.out(2)` (inner) | `scrub: 0.6` | `gsap.set` 最终态 |

### 6.3 粒子系统

| 场景 | 粒子数 | 颜色 | 速度 | Reduced Motion |
|------|--------|------|------|----------------|
| PageParticles | 桌面 10 / 移动 3 | `#3B82F6` | 3-5s | 完全跳过 |
| Footer Network | 12 | `#3B82F6` | 5-9s | 完全跳过 |
| FlowNavigation | 1 + 2 尾迹 | `#38BDF8` | 3s | 粒子不启动 |
| InfoLoopSection | 1 + 2 尾迹 | `#38BDF8` | 6s scrub | 跳过 |

### 6.4 禁止项

| 禁止项 | 替代方案 |
|--------|---------|
| `bounce` / `elastic` 缓动 | `power2.out` / `sine.inOut` |
| `back.out` 用于非品牌标识元素 | 仅限 Logo 眼睛弹出和 Footer Seal 节点弹出 |
| 装饰性粒子雨/雪花 | 沿贝塞尔路径约束的 Particle Flow |
| 无限循环 hover 动画 | hover 仅使用 150-200ms 的 transform/shadow |
| 滚动视差 | ScrollTrigger scrub 驱动的序贯揭示 |
| 无 `prefers-reduced-motion` 回退的动画 | 所有动画必须提供 reduced-motion 回退 |

---

## 7. 一致性审查 Consistency Audit

> 详细内容见 `specs/07-consistency-audit.md`

### 审查统计

| 严重度 | 数量 |
|--------|------|
| CRITICAL | 4 |
| WARNING | 3 |
| INFO | 1 |

### CRITICAL 修复摘要

| # | 问题 | 修复方式 |
|---|------|---------|
| C1 | Duration Token 数值冲突 | 以 globals.css 为准 (150/300/500)，新增 instant/crawl |
| C2 | Loop 节点命名双重体系 | 明确区分概念层和技术层，文档统一使用概念名称 |
| C3 | brand-accent-alt 缺失 | 纳入品牌核心色彩定义 |
| C4 | 缓动曲线映射不一致 | 修正为"语义近似"而非"数学等价" |

---

## 附录

### A. Token 不一致修复清单

以下操作需在代码层面执行以完成设计规范与代码的同步：

| # | 操作 | 涉及文件 | 优先级 | 状态 |
|---|------|---------|--------|------|
| 1 | 更新 `design-tokens.json` 的 duration 值: fast=150ms, normal=300ms, slow=500ms | `design-tokens.json` | CRITICAL | DONE |
| 2 | 新增 `instant: 80ms`, `crawl: 1000ms` 到 `design-tokens.json` | `design-tokens.json` | CRITICAL | DONE |
| 3 | 将 `--duration-instant: 80ms` 和 `--duration-crawl: 1000ms` 新增到 `globals.css` | `globals.css` L80-L82 区域 | CRITICAL | DONE |
| 4 | 新增 `fontFamily.console` 到 `design-tokens.json` | `design-tokens.json` | WARNING | DONE |
| 5 | 新增 `Noto Sans SC` 到 `design-tokens.json` 的 `fontFamily.sans` | `design-tokens.json` | WARNING | DONE |
| 6 | 废弃 `--ease-default`，统一使用 `--ease-out` | `tokens.css` | WARNING | |
| 7 | 将排版阶梯 (text-xs ~ text-4xl, leading-*) 从 `tokens.css` 合并到 `globals.css` | `globals.css` | WARNING | |
| 8 | 将 Loop Rail 和 Gate 组件 tokens 从 `tokens.css` 合并到 `globals.css` | `globals.css` | WARNING | |
| 9 | 废弃 `--space-block`，用 `--space-16` 替代 | `globals.css` | WARNING | DONE |
| 10 | 将 SecuritySection 的 `#A78BFA` 替换为 `var(--color-gate-human)` 或 `var(--color-brand-accent-alt)` | `SecuritySection.tsx` | WARNING | DONE |
| 11 | 将 StorySection 的 macOS 窗口色统一到 HeroSection 版本 | `StorySection.tsx` | WARNING | DONE |
| 12 | 新增 Glyph 专用 tokens (`--color-glyph-*`) 到 `globals.css` | `globals.css` | WARNING | DONE |
| 13 | 新增 Window Chrome tokens (`--color-chrome-*`) 到 `globals.css` | `globals.css` | INFO | DONE |
| 14 | 新增 `--color-brand-eye` 到 `globals.css` | `globals.css` | INFO | DONE |
| 15 | 批量替换组件中的硬编码颜色为 CSS variable 引用 | 各组件文件 | WARNING | |
| 16 | 重新生成 `tokens.css` 以与 `globals.css` 保持同步 | `tokens.css` | CRITICAL | |
| 17 | 接受 lucide-react 用于功能性 UI 图标（品牌 Glyph 仍用自定义 SVG） | `specs/04-illustration-style.md` | INFO | |
| 18 | 接受背景装饰粒子动画（需有 reduced-motion 回退） | `specs/04-illustration-style.md` | INFO | |

### B. 硬编码颜色统一方案

以下是散落在组件中的硬编码颜色的完整映射表。统一方案的详细论证见 `02-visual-system.md` 2.1.4 节。

| 硬编码颜色 | 映射 Token | 新建 Token (如需) | 状态 |
|------------|-----------|------------------|------|
| `#0F172A` | `var(--color-surface-dark)` | -- | 已有 |
| `#334155` | `var(--color-text-secondary)` | -- | 已有 |
| `#64748B` | `var(--color-text-tertiary)` | -- | 已有 |
| `#94A3B8` | `var(--color-text-on-dark-muted)` | -- | 已有 |
| `#F8FAFC` | `var(--color-text-on-dark)` (近似: 实际 #F8FAFC, token #F1F5F9) | -- | 已有 |
| `#F1F5F9` | `var(--color-text-on-dark)` | -- | 已有 |
| `#1E3A5F` | `var(--color-brand-primary)` | -- | 已有 |
| `#3B82F6` | `var(--color-brand-accent)` | -- | 已有 |
| `#6366F1` | `var(--color-brand-accent-alt)` | -- | 已有 |
| `#38BDF8` | `var(--color-brand-cyan)` | -- | 已有 |
| `#60A5FA` | -- | `--color-glyph-stroke` / `--color-brand-eye` | 待建 |
| `#93C5FD` | -- | `--color-glyph-stroke-light` | 待建 |
| `#2563EB` | -- | `--color-glyph-stroke-deep` | 待建 |
| `#DBEAFE` | -- | `--color-glyph-fill` | 待建 |
| `#EFF6FF` | `var(--color-surface-tinted)` (近似) | `--color-glyph-fill-subtle` | 待建 |
| `#22C55E` | `var(--color-signal-success)` | -- | 已有 |
| `#F59E0B` | `var(--color-signal-warning)` | -- | 已有 |
| `#EF4444` | `var(--color-signal-risk)` | -- | 已有 |
| `#A78BFA` | 废弃 | 改用 `--color-gate-human` 或 `--color-brand-accent-alt` | 待修复 |
| `#475569` | `var(--color-text-tertiary)` 或新建 `--color-flow-node-stroke` | -- | 待决定 |
| `#E2E8F0` | (无精确匹配，保留原值) | -- | 已有 |
| `#FFFFFF` | `var(--color-surface-card)` | -- | 已有 |
| `#EF4444` (chrome) | -- | `--color-chrome-close` | 待建 |
| `#EAB308` (chrome) | -- | `--color-chrome-minimize` | 待建 |
| `#22C55E` (chrome) | -- | `--color-chrome-maximize` | 待建 |

### C. 未使用组件清单

| 组件 | 路径 | 状态 | 建议 |
|------|------|------|------|
| **AccordionItem** | `src/components/ui/AccordionItem.tsx` | 未使用 -- FAQSection 自行实现了 accordion 逻辑，功能上是 AccordionItem 的超集 | 保留但标记为 legacy。如未来有更多 accordion 需求，可提取为通用组件 |
| **LoopNodeCard** | `src/components/ui/LoopNodeCard.tsx` | 未使用 -- 包含 6 种视觉模式 (ReportLines/SummaryBullets/ApprovalCheck/DecisionOptions/SelectedOption/TaskCards) | 保留但标记为备用。可用于 Loop 节点的卡片化展示 |
| **InfoFlowAnimation** | `src/components/svg/InfoFlowAnimation.tsx` | 未使用 -- 6 节点线性信息流动画，带粒子路径和节点呼吸脉冲 | 保留但标记为备用。可作为 Hero 区域替代装饰或移动端简化版 Loop 叙事 |

---

> **文档维护**: 本文件为 AutoMage 设计规范的单一权威来源。修改设计决策时，应先更新本文件，再同步到对应的子文档（01-06）。子文档中的代码证据索引和详细实现说明应保持不变。
