# 6. 动效语言 Motion Language

---

## 6.1 核心原则 Motion Principles

### "Animation as information"

每个动画必须传达 The Loop 的信息流语义。动画不是装饰，而是信息的载体。AutoMage 的动画系统严格限于 GSAP 3.15 + Lenis + CSS Keyframes，禁止引入其他动画框架。

### 动效分类

| 类型 | 语义 | 触发方式 | 典型场景 |
|------|------|---------|---------|
| **entrance (入场)** | 信号到达决策层 | ScrollTrigger / 首次加载 | 卡片 fade-in、字符逐个出现 |
| **loop (循环)** | 系统持续运转 | CSS infinite / GSAP repeat: -1 | StatusDot 脉冲、粒子流动、信号滚动 |
| **feedback (交互反馈)** | 用户操作确认 | hover / focus / click | 按钮上移、下划线绘制、焦点粒子 |
| **narrative (叙事)** | 信息流语义传达 | ScrollTrigger scrub | 噪声压缩、Loop 闭环巡游、环形路径绘制 |

### 禁止项清单

| 禁止项 | 规则 | 替代方案 |
|--------|------|---------|
| Three.js | 三维引擎与信息流调性不符 | SVG + GSAP 2D 动画 |
| Framer Motion | 声明式动画库与 GSAP 指令式冲突 | GSAP safeContext 封装 |
| Lottie | JSON 动画文件增加加载负担 | CSS @keyframes + GSAP |
| 装饰性动画 | 每个动画必须传达信息流语义 | 粒子沿路径流动（非随机漂浮） |
| 循环弹跳 | 使用 `power2.out` / `power2.in` 缓动 | 不使用 `bounce`、`elastic` |
| 闪烁/抖动 | 品牌调性为"克制"和"精密" | StatusDot 的 pulse 表达系统活跃状态（唯一例外） |
| 鲜艳霓虹渐变动画 | 破坏权威/克制调性 | 仅 `#1E3A5F -> #3B82F6` 品牌渐变 |

---

## 6.2 缓动曲线系统 Easing System

### 6.2.1 CSS 缓动 Token (4 个)

| Token | CSS Variable | 公式 | 语义 | 使用场景 |
|-------|-------------|------|------|---------|
| `ease-out` | `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | 元素进入视野的减速感 | 大多数入场动画、hover 过渡、卡片出现 |
| `ease-in` | `--ease-in` | `cubic-bezier(0.55, 0, 1, 0.45)` | 元素离开视野的加速感 | 信息消失（噪声碎片被吸入）、淡出 |
| `ease-in-out` | `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | 平滑的往返运动 | SVG path draw、Loop-back 路径绘制 |
| `ease-spring` | `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 微妙的弹性过冲 | 眼睛弹出（品牌标记启动）、节点 pop |

**使用规则**:
- `ease-out` 为默认缓动，覆盖 80% 以上的入场动画
- `ease-in` 仅用于元素被"压缩/吸入"的语义（如 CompareSection 噪声碎片）
- `ease-spring` 仅用于品牌标记眼睛弹出（`back.out(2.5)` 的 CSS 等效），限制使用范围
- 所有 CSS 过渡默认使用 `var(--ease-out)`

### 6.2.2 GSAP 缓动映射

| GSAP 缓动 | 对应 CSS | 语义 | 使用 Section |
|-----------|---------|------|-------------|
| `power2.out` | `--ease-out` | 标准入场减速 | 所有 section 的 entrance 动画（默认） |
| `power2.in` | `--ease-in` | 噪声碎片被吸入 | CompareSection 噪声碎片消失 |
| `back.out(2)` | `--ease-spring` | 轻微弹性过冲 | Footer Loop Seal 节点 inner 弹出 |
| `back.out(2.5)` | `--ease-spring` | 强弹性过冲 | CommandHeader 品牌标记眼睛弹出 |
| `sine.inOut` | `--ease-in-out` | 正弦缓入缓出 | FlowNavigation 垂直粒子流动 |
| `power2.inOut` | `--ease-in-out` | 二次缓入缓出 | InfoLoopSection loop-back 路径绘制 |
| `none` (linear) | `linear` | 匀速运动 | 粒子沿路径移动、ScrollTrigger scrub |
| `power1.in` | 轻度 `--ease-in` | 轻度加速进入 | Footer 信号光点出现 |

> **注意**: 上表为"语义近似"映射，即视觉效果相似、用途相同。`sine.inOut` 的精确公式为 `cubic-bezier(0.37, 0, 0.63, 1)`，`power2.inOut` 为 `cubic-bezier(0.45, 0, 0.55, 1)`，与 CSS `--ease-in-out` 的 `cubic-bezier(0.65, 0, 0.35, 1)` 数学上不等价。CSS 动画应使用 CSS token，GSAP 动画使用 GSAP 缓动名。

### 6.2.3 Lenis 滚动缓动

Lenis 滚动引擎提供平滑的滚动体验：

| 参数 | 值 | 行为描述 |
|------|-----|---------|
| 缓动函数 | 内置 `smooth` | 基于 lerp 的惯性滚动，不使用 CSS 缓动曲线 |
| duration | 自适应 | 根据滚动距离动态调整，远距离滚动更平滑 |
| 行为 | 平滑滚动 + 惯性 | 停止滚动后有微小惯性延迟 |

**与 ScrollTrigger 的交互**: Lenis 管理原生滚动，ScrollTrigger 通过 scrub 机制感知滚动进度。两者互不干扰，Lenis 提供视觉平滑度，ScrollTrigger 提供动画控制。

---

## 6.3 时长阶梯 Duration Scale

> **时长体系说明**: 以下 duration token 适用于 CSS transition 和单次 GSAP 入场动画。CSS @keyframes 循环动画（如 Glyph 轨道旋转 5s、指纹绘制 2.8s）的时长由各 Glyph 组件自行定义（见 `04-illustration-style.md` 4.5.3），不受此阶梯约束。

### 6.3.1 CSS Duration Token（统一后）

以 `globals.css` 为准，与品牌"克制"和"精密"调性一致：

| Token | CSS Variable | 值 | 语义 | 使用场景 |
|-------|-------------|-----|------|---------|
| `instant` | `--duration-instant` | `80ms` | 微交互即时反馈 | focus ring、阴影切换、边框颜色变化 |
| `fast` | `--duration-fast` | `150ms` | 快速交互反馈 | hover 态、下划线颜色变化、badge 过渡 |
| `normal` | `--duration-normal` | `300ms` | 标准过渡 | 卡片 hover、CSS transition 默认值、面板切换 |
| `slow` | `--duration-slow` | `500ms` | 戏剧性入场 | 大型元素入场（卡片组、标题渐变） |
| `crawl` | `--duration-crawl` | `1000ms` | 缓慢展示 | 进度条、大范围描边绘制 |

**与 `design-tokens.json` / `tokens.css` 的冲突修复**:

| Token | globals.css (在用) | tokens.css (未引入) | 统一值 |
|-------|-------------------|--------------------|----|
| fast | 150ms | 200ms | **150ms** (globals.css 为准) |
| normal | 300ms | 350ms | **300ms** |
| slow | 500ms | 600ms | **500ms** |
| instant | (缺失) | 100ms | **80ms** (新增) |
| crawl | (缺失) | 1200ms | **1000ms** (新增) |

### 6.3.2 GSAP Duration 映射

从代码中提取的实际 GSAP duration 值：

| 时长 (s) | 使用场景 | Section |
|----------|---------|---------|
| `0.1` | Footer 底部链接淡入 stagger | Footer |
| `0.12` | Footer 按钮淡入 stagger | Footer |
| `0.15` | Footer 文本淡入 | Footer |
| `0.2` | Focus particle 闪烁 | BetaSection focus 交互 |
| `0.25` | CommandHeader nav 项入场 stagger | CommandHeader |
| `0.3` | 单个元素快速淡入、节点尺寸变化、路径激活 | CommandHeader, InfoLoop, FlowNavigation |
| `0.35` | 品牌标记入场 | CommandHeader logo |
| `0.4` | 标准入场动画（覆盖最多） | Hero, Compare, Security, Beta, FAQ |
| `0.48` | 品牌标记淡入 | CommandHeader brand mark |
| `0.5` | 决策卡入场、连接线绘制、轨道路径绘制 | Compare, Security, Footer |
| `0.6` | 压缩核心脉冲、柱状图入场、门控连线 | Hero bars, Compare core |
| `0.8` | Hero 渐变文字入场、路径绘制、边框绘制 | Hero, Story, InfoLoop |
| `1.0` | usePathDraw 默认 duration | 通用 |
| `3.0` | 粒子路径遍历（短路径） | PageParticles, FlowNavigation |
| `5.0` | 粒子路径遍历（中路径） | Footer particles |
| `6.0` | InfoLoop 粒子全环遍历、scrub timeline | InfoLoop |

### 6.3.3 Stagger 间隔汇总

| 间隔 (s) | 使用场景 | Section |
|----------|---------|---------|
| `0.03` | Hero 标题字符逐个出现、Footer 链接 | Hero, Footer |
| `0.06` | CommandHeader nav 项 | CommandHeader |
| `0.08` | FAQ 项入场、噪声碎片入场 | FAQ, Compare |
| `0.1` | 信号芯片入场、节点、连接线、柱状图 | Hero, Compare, Security |
| `0.12` | ValueCards 卡片入场、SVG 路径延迟 | ValueCards |
| `0.15` | BetaSection 表单字段、决策卡入场 | Beta, Compare |
| `0.25` | 页面粒子路径偏移 | useParticles |
| `0.3` | Security pipeline 节点入场 | Security |

---

## 6.4 Section 动效矩阵

### 完整 Section 动效覆盖

| Section | 入场动画 | ScrollTrigger | Stagger | Duration | Easing | Reduced Motion |
|---------|---------|---------------|---------|----------|--------|----------------|
| **CommandHeader** | 逐级启动: logo -> brand mark -> eyes -> name -> nav -> status -> CTA | 无 (首次加载) | 0.06s (nav) | 0.25-0.48s | `power2.out`, `back.out(2.5)` (eyes) | 直接显示最终态 (`setBooted(true)`) |
| **HeroSection** | 标题逐字出现 + 渐变文字 + 副标题 + CTA | 无 (首次加载) | 0.03s (chars) | 0.4-0.8s | `power2.out` | `gsap.set` 直接显示 opacity:1 |
| **HeroSection SignalConsole** | Console 滑入 + 芯片 stagger-in + 柱状图 scaleY + Pipeline 轮转 | 无 (延迟 1.2s) | 0.1s (chips/bars) | 0.3-0.6s | `power2.out` | CSS `animation: none !important` + 静态显示 |
| **LogoMarquee** | 信号流无限滚动 | 无 (CSS infinite) | N/A | 28s 循环 | `linear` | `animation: none !important` |
| **CompareSection** | 噪声碎片出现 -> 核心脉冲 -> 3 张高价值信号吸入 -> 5 张残留噪声稳定保留 -> 核心闪光 -> 决策卡滑入 -> 连接线绘制 | `start: 'top 70%'` | 0.02-0.15s | 0.2-0.6s | `power2.out`, `power2.in` (吸入) | 3 张转化噪声隐藏，5 张残留/队列噪声保持可见，决策卡直接显示 |
| **InfoLoopSection** | 粒子巡游 + 节点逐个激活 + Inspector 切换 + 闭环完成 + Loop-back 绘制 | `pin: true, scrub: 0.5, start: 'top top', end: '+=2000'` | 1s/node (6 nodes) | 0.3s (node), 0.6s (glow), 0.8s (loop-back) | `power2.out`, `none` (scrub) | Reduced motion 检测后跳过所有动画 |
| **ValueCardsSection** | 卡片 scale+fade + 连接线淡入 | `start: 'top 80%'` | 0.12s | 0.4s (cards), 0.6s (lines) | `power2.out` | `gsap.set` 显示最终态 |
| **MetricsBar** | 数字计数器 + 卡片 scale 出现 | `IntersectionObserver threshold: 0.2` | 0.1s | 1200ms (count), 500ms (card CSS) | ease-out cubic (RAF) | 直接显示最终数值 |
| **StorySection** | 深色研发控制台面板入场 + 日志行序贯显示 + 状态灯信息脉冲 | `start: 'top 72%'` | 0.08s (panels), 0.04s (logs) | 0.25-0.45s | `power2.out` | `gsap.set` 面板与日志为最终可见态，状态灯静态显示 |
| **SecuritySection** | Pipeline 节点逐个入场 + 连线 scaleX + Dual-key 入场 + Trust 卡片入场 | `start: 'top 75%'` | 0.3s (stages), 0.12s (trust) | 0.3-0.5s | `power2.out` | `gsap.set` 显示最终态 |
| **BetaSection** | 表单字段 stagger-in + 下划线绘制 + 按钮 scale; Focus: 粒子跑动 + 下划线变色 | `start: 'top 80%'` | 0.15s | 0.3-0.5s | `power2.out` | `gsap.set` 显示最终态，focus 动画禁用 |
| **FAQSection** | 桌面 FAQ 项 stagger-in + 答案面板 cross-fade | `start: 'top 80%'` | 0.08s | 0.3-0.4s | `power2.out` | 不执行入场动画，显示默认态 |
| **Footer** | 轨道路径绘制 -> 节点逐个点亮 -> 信号光点巡游 -> 标题/副标题/按钮淡入 -> 链接淡入 | `scrub: 0.6, start: 'top 80%', end: 'top 10%'` | 0.03s (links), 0.05s (btns) | 0.08-0.5s (scrub normalized) | `power2.out`, `back.out(2)` (inner), `none` (orbit) | `gsap.set` 显示最终态，粒子系统跳过 |
| **FlowNavigation** | 节点按 section 滚动位置激活 + 垂直粒子往复流动 | 6 个 trigger: `start: 'top center', end: 'bottom center'` | N/A | 0.3s (node), 3s (particle) | `power2.out`, `sine.inOut` (particle) | 粒子不启动，节点直接激活 |
| **PageParticles** | 5 条路径的粒子无限流动 | 无 (首次加载, repeat: -1) | 路径间 0.4s 偏移 | 3-5s per path | `none` (linear) | `useParticles` 内部检测后跳过 |

---

## 6.5 粒子系统规范 Particle System

### 6.5.1 useParticles API 规格

```typescript
interface ParticleConfig {
  paths: PathConfig[];           // 路径配置数组
  particlesPerPath?: number;     // 每条路径的粒子数，默认 1
  radius?: [number, number];     // 圆半径范围 [min, max]，默认 [3, 5]
  color?: string;                // 填充色，默认 '#3B82F6'
  opacity?: [number, number];    // 可见时透明度范围，默认 [0.3, 0.6]
  trailCount?: number;           // 尾随圆数量，默认 0
  trailDelay?: number;           // 尾随元素间延迟 (s)，默认 0.08
  trailScale?: number;           // 每级尾随半径倍率，默认 0.6
  trailOpacity?: number;         // 每级尾随透明度倍率，默认 0.3
}

interface PathConfig {
  id: string;
  pathSelector: string;          // SVG 容器内的 CSS 选择器
  speed: [number, number];       // 动画时长范围 [min, max] (s)
}
```

### 性能预算

| 约束 | 值 | 说明 |
|------|-----|------|
| 桌面端最大 SVG 数 | 5 (PageParticles) + 12 (Footer) + 1 (InfoLoop) + 2 (FlowNavigation) | 总计约 20 个 SVG 圆，GPU 加速后可接受 |
| 移动端最大路径数 | 3 (PageParticles 降级) | `MOBILE_PATHS` 只保留 3 条 |
| 每条路径粒子数 | 桌面 2 / 移动 1 | `particlesPerPath` 响应式 |
| 粒子总数估算 | 桌面: ~35 / 移动: ~18 | 含尾随粒子 |
| GSAP timeline 数量 | 1 per SVG container | 每个容器共用一个 timeline，`repeat: -1` |
| Reduced Motion | 完全跳过 | `prefers-reduced-motion: reduce` 下不创建任何粒子 |

### 6.5.2 粒子使用场景参数

#### PageParticles (全页粒子背景)

| 参数 | 值 |
|------|-----|
| 路径数量 | 桌面 5 条 / 移动 3 条 |
| 每条路径粒子数 | 桌面 2 / 移动 1 |
| radius | `[2, 4]` |
| color | `#3B82F6` |
| opacity | `[0.2, 0.5]` |
| trailCount | `1` |
| trailDelay | `0.08` |
| trailScale | `0.6` |
| trailOpacity | `0.3` |
| speed | `[3, 5]` |
| viewBox | `0 0 1920 1080` |
| SVG 描边 | `stroke: #3B82F6, strokeWidth: 1, opacity: 0.06` |
| 路径类型 | 5 条 S 曲线从顶部到底部均匀分布 |

**路径定义**:
```
pp1: M 200,0  C 250,200 150,400 220,600  S 180,800 200,1080
pp2: M 600,0  C 550,180 680,350 620,540  S 700,750 640,1080
pp3: M 960,0  C 1000,250 920,450 980,650 S 900,850 960,1080
pp4: M 1300,0 C 1350,220 1250,420 1320,620 S 1280,820 1300,1080
pp5: M 1700,0 C 1650,300 1750,500 1680,700 S 1720,900 1700,1080
```

#### Footer (粒子网络背景)

| 参数 | 值 |
|------|-----|
| 路径数量 | 12 条 (贝塞尔曲线网络) |
| 每条路径粒子数 | 1 |
| radius | `[1.5, 3]` |
| color | `#3B82F6` |
| opacity | `[0.15, 0.25]` |
| trailCount | `0` (无尾迹) |
| speed | `[5, 9]` |
| viewBox | `0 0 1440 800` |
| 网络节点 | 10 个，分布在 1440x800 空间 |
| 连接关系 | 12 条贝塞尔曲线连接 `[0-1, 1-2, 2-3, 3-4, 5-6, 6-7, 7-8, 8-9, 0-5, 1-6, 3-8, 4-9]` |
| 路径描边 | `stroke: #3B82F6, strokeWidth: 1, opacity: 0.06` |
| 节点描边 | `r: 3, fill: #3B82F6, opacity: 0.08` |

#### InfoLoopSection (Loop 轨道粒子)

| 参数 | 值 |
|------|-----|
| 粒子类型 | SVG circle (非 useParticles，直接 GSAP 驱动) |
| 主粒子半径 | `6` |
| 尾迹 1 半径 | `4` |
| 尾迹 2 半径 | `2` |
| 填充色 | `var(--color-loop-particle)` (`#38BDF8`) |
| 主粒子最大 opacity | `1` |
| 尾迹最大 opacity | `0.3` (trail1), `0.2` (trail2) |
| 轨道半径 | `180` |
| 轨道中心 | `(220, 220)` |
| 遍历时长 | `6s` (scrub 驱动) |
| 尾迹延迟 | `0.02 * progress` (值域偏移) |
| 运动方式 | 三角函数直接计算坐标 (`placeAtProgress`) |

#### FlowNavigation (Loop Rail 垂直粒子)

| 参数 | 值 |
|------|-----|
| 粒子类型 | SVG circle (直接 GSAP 驱动) |
| 主粒子半径 | `4` |
| 主粒子 opacity | `0.8` |
| 尾迹 1 半径 | `3`, opacity `0.3` |
| 尾迹 2 半径 | `2`, opacity `0.2` |
| 填充色 | `var(--color-loop-particle)` |
| 运动方式 | `cy` 从 0 到 `svgHeight`，`yoyo: true, repeat: -1` |
| 时长 | `3s` |
| 缓动 | `sine.inOut` |
| 尾迹延迟 | `(i + 1) * 0.15` |

---

## 6.6 SVG Path Draw 规范

### 6.6.1 usePathDraw API

```typescript
interface PathDrawConfig {
  pathSelector: string;          // SVG 容器内的 CSS 选择器
  duration?: number;             // 描边时长 (s)，默认 1.0
  ease?: string;                 // GSAP 缓动，默认 'power2.inOut'
  stagger?: number;              // 多路径间的延迟 (s)，默认 0.1
  scrollTrigger?: {
    trigger?: string;            // 触发元素选择器
    start?: string;              // 默认 'top 80%'
    end?: string;
    scrub?: boolean | number;    // 默认 false
  };
  once?: boolean;                // 是否只播放一次，默认 true
}
```

**实现原理**: 计算 `getTotalLength()` 后设置 `strokeDasharray = length`，动画 `strokeDashoffset` 从 `length` 到 `0`。

**Reduced Motion 回退**: 直接设置 `strokeDashoffset: 0`，跳过动画过程。

### 6.6.2 CSS @keyframes Draw 系列

所有 Glyph 系统动画定义在 `globals.css`，供 SecuritySection 和 ValueCardsSection 使用：

| Keyframes 名称 | 触发方式 | duration | 行为描述 | 使用 Section |
|---------------|---------|----------|---------|-------------|
| `draw-path` | CSS `animation` | 自定义 | `stroke-dashoffset` 从当前值到 0 | 通用 SVG path 描边 |
| `node-pop` | CSS `animation` | 自定义 | scale 0.6->1 + opacity 0->1 | 节点出现 |
| `node-pulse` | CSS `animation` | 自定义 | opacity 在 0.55 和 1 间循环 | 节点活跃态脉冲 |
| `compress-in` | CSS `animation` | 自定义 | translateX 0->8->0 + opacity 0.35->1->0.35 | 压缩行为表达 |
| `audit-node` | CSS `animation` | 自定义 | opacity 0->1 | 审计节点渐显 |
| `orbit` | CSS `animation` | `5s linear infinite` | rotate 0->360deg | AI Logo 轨道点旋转 (SecuritySection) |
| `scan-gate` | CSS `animation` | `1.8s ease-in-out infinite` | translateY -8->0->8 + opacity 0.2->1->0.2 | Policy Gate 扫描线 (SecuritySection) |
| `finger-draw` | CSS `animation` | `2.8s ease-in-out infinite` | stroke-dashoffset 42->0 + opacity 0.2->1->0.4 | Human Logo 指纹线绘制 (SecuritySection) |
| `check-draw-loop` | CSS `animation` | `2.8s ease-in-out infinite` | 延迟 45% 后 stroke-dashoffset 18->0 + opacity 0->1->0.5 | Human Logo 确认勾 (SecuritySection) |
| `ledger-write` | CSS `animation` | `2.2s ease-in-out infinite` | stroke-dashoffset 20->0 + opacity 0.2->1->0.4 | Execution Ledger 账本行写入 (SecuritySection) |
| `ledger-seal` | CSS `animation` | `2.2s ease-in-out infinite` | 延迟 45% 后 opacity 0.3->1->0.6 | Execution Ledger 封印 (SecuritySection) |
| `boundary-stop` | CSS `animation` | `2.4s ease-in-out infinite` | translateX -6->8->8->-6 + opacity 0.4->1->1->0.4 | Permission Boundary 移动代理停止 (SecuritySection) |
| `signal-marquee` | CSS `animation` | `28s linear infinite` | translateX 0->-50% | LogoMarquee 信号流滚动 (LogoMarquee) |
| `status-pulse` | CSS `animation` | `2s ease-in-out infinite` | opacity 1->0.5->1 + scale 1->0.8->1 | CommandHeader StatusDot 脉冲 |
| `signal-line-sweep` | CSS `animation` | `4s linear infinite` | translateX -100%->400% | CommandHeader 信号线扫过 |
| `signal-boot` | CSS `animation` | `1.6s ease-in-out both` | drop-shadow 0->8px->2px (一次性) | CommandHeader 品牌标记启动发光 |
| `amLineDraw` | CSS `animation` | `2.8s ease-in-out infinite` | stroke-dashoffset 100->0 + opacity 0.18->1->0.48 | ValueCards 迷你图线条绘制 |
| `amNodePulse` | CSS `animation` | `2.8s ease-in-out infinite` | opacity 0.55->1->0.55 | ValueCards 迷你图节点脉冲 |
| `amApprovalMove` | CSS `animation` | `2.4s ease-in-out infinite` | left 0->calc(100%-7px) + opacity 0.25->1->0.25 | SecuritySection 审批桥上的光点移动 |
| `amOrbit` | CSS `animation` | `5s linear infinite` | rotate 0->360deg | SecuritySection AI Logo 轨道点 |
| `amFingerDraw` | CSS `animation` | `2.8s ease-in-out infinite` | stroke-dashoffset 48->0 + opacity 0.2->1->0.55 | SecuritySection Human Logo 指纹线 |
| `amCheckDraw` | CSS `animation` | `2.8s ease-in-out infinite` | 延迟 48% 后 stroke-dashoffset 20->0 + opacity 0->1->0.55 | SecuritySection Human Logo 确认勾 |
| `pulse-dot` | CSS `animation` (内联) | `2s ease-in-out infinite` | opacity 1->0.4->1 | HeroSection SignalConsole 活跃状态点 |
| `blink-dots` | CSS `animation` (内联) | `1.5s step-end infinite` | 三点闪烁 | HeroSection 处理指示器省略号 |

### 6.6.3 Stagger 延迟表

以下 @keyframes 在同组元素间使用 `animation-delay` 实现 stagger 效果：

| 元素 | 延迟值 | 说明 |
|------|-------|------|
| `.am-orbit-dot.d1` | `0s` | AI Logo 轨道点 1 |
| `.am-orbit-dot.d2` | `-1.6s` (偏移) | AI Logo 轨道点 2 |
| `.am-orbit-dot.d3` | `-3.2s` (偏移) | AI Logo 轨道点 3 |
| `.finger-line.inner` | `0.18s` | Human Logo 内部指纹线 |
| `.execution-ledger .l2` | `0.18s` | Ledger 行 2 |
| `.execution-ledger .l3` | `0.36s` | Ledger 行 3 |
| `.am-mini-diagram .p2, .l2` | `0.12s` | ValueCards 迷你图路径 2 |
| `.am-mini-diagram .p3, .l3` | `0.24s` | ValueCards 迷你图路径 3 |
| `.am-mini-diagram .l4` | `0.36s` | ValueCards 迷你图路径 4 |

---

## 6.7 ScrollTrigger 规范

### 6.7.1 使用模式

| 模式 | 行为 | 代表 Section |
|------|------|-------------|
| **固定 pin 模式** | Section 固定在视口，scrub 驱动 timeline | InfoLoopSection (2000px range, scrub: 0.5) |
| **入场触发模式** | 元素进入视口后播放一次 | 大多数 section: start "top 80%" |
| **滚动链接模式** | 节点按 section 位置激活 | FlowNavigation: 6 个 trigger point |
| **背景切换模式** | Body 背景色跟随滚动变化 | useSectionTheme: scrub: true |

### 6.7.2 完整 ScrollTrigger 配置表

| Section | start | end | scrub | pin | once | toggleActions | 说明 |
|---------|-------|-----|-------|-----|------|---------------|------|
| **CompareSection** | `top 70%` | (默认) | `false` | `false` | (默认 true) | `play none none none` | 噪声压缩序列 |
| **InfoLoopSection** | `top top` | `+=2000` | `0.5` | `true` | `false` | (scrub 模式) | 固定 + scrub 驱动闭环动画 |
| **ValueCardsSection** | `top 80%` | (默认) | `false` | `false` | (默认 true) | `play none none none` | 卡片入场 |
| **StorySection** | `top 72%` | (默认) | `false` | `false` | `true` | `play none none none` | 深色研发控制台面板与日志流入场 |
| **SecuritySection** | `top 75%` | (默认) | `false` | `false` | (默认 true) | `play none none none` | Pipeline + Dual-key + Trust 卡 |
| **BetaSection** | `top 80%` | (默认) | `false` | `false` | (默认 true) | `play none none none` | 表单入场 |
| **FAQSection** | `top 80%` | (默认) | `false` | `false` | (默认 true) | `play none none none` | FAQ 项入场 |
| **Footer** | `top 80%` | `top 10%` | `0.6` | `false` | `false` | (scrub 模式) | 轨道绘制 + 节点点亮 + 文本入场 |
| **FlowNavigation (x6)** | `top center` | `bottom center` | `false` | `false` | `false` | (onEnter 回调) | 每个 section 对应一个 trigger |
| **useSectionTheme** | `top bottom` (默认) | `top center` (默认) | `true` | `false` | `false` | (scrub 模式) | Body 背景色平滑过渡 |

### 6.7.3 FlowNavigation 6 个 Trigger Point

| 节点 | sectionId | trigger | start | end | 激活行为 |
|------|-----------|---------|-------|-----|---------|
| Signal | `section-hero` | hero section | `top center` | `bottom center` | 节点 r->10, fill active |
| Compress | `section-compare` | compare section | `top center` | `bottom center` | 同上 |
| Review | `section-loop` | loop section | `top center` | `bottom center` | 同上 |
| Decide | `section-value` | value section | `top center` | `bottom center` | 同上 |
| Execute | `section-security` | security section | `top center` | `bottom center` | 同上 |
| Learn | `section-cta` | footer section | `top center` | `bottom center` | 同上 |

### 6.7.4 useSectionTheme 背景切换

`useSectionTheme` hook 管理 body 背景色的 scroll-linked 过渡：

- 默认 start: `top bottom` (元素顶部到达视口底部)
- 默认 end: `top center` (元素顶部到达视口中心)
- scrub: `true` (颜色随滚动进度平滑插值)
- Reduced Motion: `gsap.set` 直接切换 (snap)

---

## 6.8 Reduced Motion 完整回退策略

### 6.8.1 检测方式

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

所有组件在 effect 初始化时检测一次，缓存结果。

### 6.8.2 GSAP 回退

| Section | 回退行为 |
|---------|---------|
| **CommandHeader** | `setBooted(true)` 跳过启动动画，所有 `[data-boot]` 元素通过 JSX 初始 `opacity: reducedMotion ? 1 : 0` 直接可见 |
| **HeroSection** | `gsap.set` 所有元素为 `{opacity: 1, y: 0}` |
| **HeroSection SignalConsole** | CSS `animation: none !important` |
| **CompareSection** | 3 张 `convert` 噪声直接进入隐藏终态；5 张 `retain` / `queue` 噪声直接进入可见残留终态；决策卡 `gsap.set({opacity: 1, x: 0})` |
| **InfoLoopSection** | `if (reduced) return;` 跳过整个 ScrollTrigger timeline |
| **ValueCardsSection** | `gsap.set(cards, {opacity: 1, scale: 1})`；连接线 `gsap.set({opacity: 0.06})` |
| **MetricsBar** | 直接显示最终数值 `el.textContent = m.value`；卡片 `style.opacity = '1'` |
| **StorySection** | 面板与日志行 `gsap.set({opacity: 1, y: 0})`；状态灯 CSS 动画禁用并保持可见 |
| **SecuritySection** | Pipeline `gsap.set({opacity: 1})`；连线 `gsap.set({scaleX: 1})`；Trust 卡 `gsap.set({opacity: 1, y: 0})` |
| **BetaSection** | 表单 `gsap.set({opacity: 1, y: 0})`；下划线 `gsap.set({width: '100%'})`；按钮 `gsap.set({scale: 1})` |
| **FAQSection** | 不执行入场 GSAP 动画 |
| **Footer** | 节点 `gsap.set({r: 18, opacity: 0.2})` + `gsap.set({r: 6, opacity: 1})`；文本/按钮 `gsap.set({opacity: 1, y: 0, scale: 1})` |
| **FlowNavigation** | 粒子不启动 (`!reduced` 条件守卫)；节点仍通过 ScrollTrigger 正常激活 |

### 6.8.3 CSS Keyframes 回退

各组件内 `<style>` 块中独立的 reduced-motion 规则：

```css
/* globals.css (Header) */
@media (prefers-reduced-motion: reduce) {
  .am-status-dot,
  .am-signal-line-inner,
  .am-brand-mark.am-booted {
    animation: none !important;
  }
  .am-status-dot { opacity: 0.7; }
}

/* HeroSection (SignalConsole) */
@media (prefers-reduced-motion: reduce) {
  .signal-console * { animation: none !important; }
}

/* LogoMarquee */
@media (prefers-reduced-motion: reduce) {
  .signal-bus__track { animation: none !important; }
}

/* ValueCardsSection */
@media (prefers-reduced-motion: reduce) {
  .am-mini-diagram * { animation: none !important; }
}

/* SecuritySection */
@media (prefers-reduced-motion: reduce) {
  .am-dual-key *,
  .security-glyph *,
  .permission-boundary * {
    animation: none !important;
  }
}
```

### 6.8.4 粒子系统回退

`useParticles` 内部首先检测 reduced motion，若匹配则直接 `return`，不创建任何 SVG 元素或 GSAP timeline：

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) return;
```

影响的粒子场景：
- PageParticles: 完全不创建粒子，仅保留 SVG 路径描边 (opacity: 0.06)
- Footer: 完全不创建粒子，仅保留网络路径和节点静态显示
- InfoLoopSection: 粒子循环跳过 (timeline 中的 `if (reduced) return`)
- FlowNavigation: `!reduced` 条件守卫阻止粒子启动

### 6.8.5 Lenis 回退

Lenis **保持活跃**，即使在 reduced motion 模式下。原因：

1. Lenis 提供的是滚动物理行为（平滑滚动），不是视觉装饰动画
2. 去除 Lenis 会导致生硬的原生跳转，可能对运动敏感用户造成更大的不适
3. Lenis 的平滑度本身有助于减少视觉突变

### 6.8.6 ScrollTrigger 回退

| 模式 | Reduced Motion 行为 |
|------|---------------------|
| Scrub 模式 (InfoLoop, Footer) | 跳过 timeline 创建，显示静态最终态 |
| 入场触发模式 (大多数 section) | 跳过动画，直接设置最终态 |
| useSectionTheme | `gsap.set` 直接切换背景色，不做平滑过渡 |
| FlowNavigation | 节点激活动画仍执行 (非装饰性，是信息反馈)；粒子不启动 |

---

## 6.9 动效与信息流语义映射

所有动画映射到 The Loop 的六节点信息流概念：

| 信息流概念 | Loop 节点 | 动画表现 | 使用位置 | 语义说明 |
|-----------|-----------|---------|---------|---------|
| **信号进入** | Signal | Signal chip stagger-in (0.1s 间隔, power2.out) | Hero SignalConsole | 组织中的一线信号逐条到达控制台 |
| **信息压缩** | Compress | 噪声碎片被吸向中心 + 核心闪光 | CompareSection | 散落的噪声被 AI 压缩为结构化决策 |
| **光点流动** | Review | 粒子沿环形轨道巡游 (6s scrub) | InfoLoopSection | 信息在闭环节点间流转 |
| **节点激活** | Review | 节点 r 14->20 + 光环扩散 (r 20->28, opacity 0.4->0) | InfoLoopSection, FlowNavigation | 当前正在处理的信息节点 |
| **决策输出** | Decide | 卡片 scale 0.95->1 + opacity 0->1 | ValueCardsSection, CompareSection 决策卡 | 结构化决策信息呈现给人类 |
| **执行确认** | Execute | Pipeline 节点逐个入场 (0.3s stagger) + 连线 scaleX | SecuritySection | AI 建议 -> 策略校验 -> 人类确认 -> 执行 |
| **门控通过** | Execute | 审批桥光点从左到右移动 (2.4s ease-in-out) | SecuritySection Dual-key | 信息通过人类确认门控 |
| **闭环回流** | Learn | 轨道路径绘制 (strokeDashoffset) + 节点逐个点亮 | Footer Loop Seal | 信息从执行回流到学习，闭环完成 |
| **数据流动** | (全局) | 粒子沿路径无限流动 | PageParticles, Footer 网络 | 持续的数据流动态表达系统运转 |
| **系统活跃** | (全局) | StatusDot 脉冲 (2s ease-in-out) | CommandHeader | 系统正在处理信息的实时状态指示 |
| **信息到达** | (全局) | 元素 fade-in + translateY (power2.out) | 所有 section 入场 | 信息从无到有的呈现 |
| **滚动追踪** | (全局) | FlowNavigation 节点按 section 激活 | FlowNavigation | 用户在信息流中的当前位置 |
| **信号流转** | (全局) | LogoMarquee 信号流无限滚动 (28s) | LogoMarquee | The Loop 的 5 步信号流持续运转 |
| **路径描边** | (全局) | SVG strokeDashoffset 从 length 到 0 | usePathDraw, SecuritySection Glyph | 信息路径的逐步建立 |
| **节点脉冲** | (全局) | opacity 0.55 <-> 1 循环 | ValueCards, SecuritySection Glyph | 节点处于活跃/待处理状态 |
| **压缩行为** | Compress | translateX 0->8->0 + opacity 循环 | CSS compress-in | 信息被压缩的微观动效表达 |
| **审计追踪** | Execute | 账本行 stroke-dashoffset 写入 | Execution Ledger Glyph | 执行记录被逐行写入账本 |
| **边界防护** | Execute | 代理 translateX 到达边界后停止 | Permission Boundary Glyph | AI 代理遇到权限边界自动停止 |
| **扫描校验** | Execute | 扫描线上下移动 (scan-gate) | Policy Gate Glyph | 策略校验的持续扫描行为 |
| **指纹确认** | Execute | 指纹线 stroke-dashoffset 绘制 | Human Logo | 人类用生物特征确认决策 |
| **决策收据** | Learn | 底部 Decision Receipt 静态展示 | Footer | 完整闭环的决策收据输出 |

---

## 6.10 交互反馈动效规范

### 6.10.1 Hover 反馈

| 元素 | 动画 | duration | easing | Section |
|------|------|----------|--------|---------|
| CTA 按钮 | background 色变 + translateY(-1px) + boxShadow | 200ms | CSS `--ease-out` | CommandHeader |
| CTA 箭头 | translateX(2px) | 200ms | CSS `--ease-out` | CommandHeader `.am-cta-primary:hover span` |
| Ghost 按钮 | borderColor + color 变亮 | 200ms | CSS 默认 ease | CommandHeader |
| 价值卡 | translateY(-2px) + boxShadow: `--shadow-md` | 200ms | `--ease-out` | ValueCardsSection |
| Footer CTA | scale(1.02) + background 变化 + glow | 200ms | CSS `ease` | Footer |
| Footer 链接 | color `#64748B` -> `#FFFFFF` | 200ms | CSS `ease` | Footer |
| FAQ 手风琴箭头 | rotate(0 -> 180deg) | 300ms | `--ease-out` | FAQSection (mobile) |
| FAQ 手风琴面板 | `grid-template-rows: 0fr -> 1fr` | 300ms | `--ease-out` | FAQSection (mobile) |
| Hero CTA | background `--primary` -> `--accent` | 200ms | CSS transition | HeroSection |
| Header brand mark hover | box-shadow 增加 glow | 300ms | CSS `ease` | CommandHeader |
| FlowNavigation 节点 | r 6->8 + fill active | 200ms | GSAP `power2.out` | FlowNavigation |
| BetaSection 按钮 | background 变色 + glow shadow | 200ms | `--ease-out` | BetaSection |

### 6.10.2 Focus 反馈

| 元素 | 动画 | Section |
|------|------|---------|
| BetaSection 输入框 focus | 下划线变色为 accent + 粒子从左到右跑动 (0.3s) | BetaSection |
| BetaSection 输入框 blur | 下划线恢复默认色 (0.2s) + 粒子淡出 (0.15s) | BetaSection |
| FlowNavigation 按钮 focus | outline: 2px solid accent, offset 2px | FlowNavigation |

### 6.10.3 Focus 粒子详细规格 (BetaSection)

```
触发: onFocus
行为:
1. 粒子 x=0, opacity=0 -> 1 (0.1s)
2. 粒子 x -> wrapperWidth-6 (0.3s, power2.out)
3. 粒子 opacity -> 0 (0.15s)
4. 重置 x=0
粒子: 6x6px 圆, fill: var(--color-brand-accent)
下划线: width -> 100%, background -> accent (0.2s)
```

---

## 6.11 动效系统组件依赖关系

```
globals.css
  ├── CSS @keyframes (Glyph 系统 + Header 系统 + Marquee 系统)
  ├── CSS transition tokens (--ease-out, --duration-fast 等)
  └── prefers-reduced-motion 全局回退

src/lib/gsap.ts
  ├── gsap (核心引擎)
  ├── ScrollTrigger (滚动触发)
  ├── safeContext (Turbopack 兼容封装)
  ├── gsapReady (运行时检测)
  └── motionPathTo (原生 SVG path 替代 MotionPathPlugin)

src/hooks/useParticles.ts
  ├── gsap.timeline({ repeat: -1 })
  ├── motionPathTo (粒子路径追踪)
  └── safeContext (生命周期管理)

src/hooks/usePathDraw.ts
  ├── gsap.to (strokeDashoffset 动画)
  ├── ScrollTrigger (滚动触发)
  └── safeContext (生命周期管理)

src/hooks/useSectionTheme.ts
  ├── gsap.to (body 背景色 scrub)
  └── ScrollTrigger (滚动链接)
```
