# 3. 组件规范与布局系统 Component & Layout

---

## 3.1 页面架构 Page Architecture

### Section 渲染顺序与映射

页面由 `layout.tsx` 包裹，`page.tsx` 定义 `<main>` 内的 section 顺序。Footer 在 layout 层级渲染（非 children 内部），通过 fixed 定位实现揭示式布局。

| 顺序 | 组件 | section ID | max-width | 主题 | Loop 节点 |
|------|------|-----------|-----------|------|----------|
| - | CommandHeader | — | `min(1180px, calc(100% - 32px))` | dark（固定深色毛玻璃） | — |
| - | FlowNavigation | — | 80px（SVG rail） | — | 6 节点导航 |
| - | PageParticles | — | 全屏覆盖 | — | — |
| 1 | HeroSection | `section-hero` | `max-w-7xl` (1280px) | light | Signal |
| 2 | LogoMarquee | — | `min(1120px, calc(100vw - 48px))` | dark（`--color-surface-deep`） | — |
| 3 | CompareSection | `section-compare` | 1100px | light | Compress |
| 4 | InfoLoopSection | `section-loop` | 1160px（外容器，桌面端内部 flow 1120px） | dark（`--color-surface-deep`） | Review |
| 5 | ValueCardsSection | `section-value` | 1100px | light | Decide |
| 6 | MetricsBar | `section-metrics` | 1200px | light | — |
| 7 | SecuritySection | `section-security` | 900px | light | Execute |
| 8 | StorySection | `section-story` | 860px | dark（`--color-surface-command`） | — |
| 9 | SocialProof | `section-social` | 1200px | light + dark cards | — |
| 10 | FAQSection | `section-faq` | 1000px | light | Learn |
| 11 | BetaSection | `section-beta` | 600px | light | — |
| 12 | Footer | — | 1200px（links） | dark（`--color-surface-dark`） | Loop closed |

> **破晓黎明模型（2026-06-02）**: 中后段从旧版 `StorySection -> SocialProof -> SecuritySection -> BetaSection -> FAQSection` 调整为 `SecuritySection -> StorySection -> SocialProof -> FAQSection -> BetaSection`。视觉节奏为浅色安全原则 -> 全深色 Story 叙事暗场 -> 浅底深色评价卡片 -> 浅色 FAQ / 内测转化尾部。StorySection 保留原有三幕布局：标题、引号卡片、实验视频占位窗口、洞察线，避免改成控制台面板集合。
>
> **证据来源**: `page.tsx` 定义 `<main>` 内 11 个 section 的渲染顺序；`layout.tsx` 将 Footer 渲染在 children 之前；每个组件的 `max-width` 值从各组件的 `style.maxWidth` 属性提取。

### 非常规布局模式

#### Footer fixed + marginBottom: 100vh 的揭示式布局原理

Footer 使用 `position: fixed; bottom: 0; z-index: 0` 固定在视口底部。主内容区域 `.main-content-wrapper` 设置 `marginBottom: 100vh`，当用户滚动到页面底部时，main 内容滚出视口，Footer 自然露出。

```
┌─────────────────────────────┐ ← viewport top
│  main-content-wrapper       │
│  (position: relative, z-1)  │
│  marginBottom: 100vh        │
│                             │
├─────────────────────────────┤ ← 内容结束
│  (空白 margin 100vh)        │
│                             │
└─────────────────────────────┘ ← viewport bottom
                                ↑ Footer 在这里露出
                                  (position: fixed, bottom: 0, z-0)
```

> **证据来源**: `layout.tsx` L38-L46: `main-content-wrapper` 设置 `position: 'relative', zIndex: 1, marginBottom: '100vh'`；`Footer.tsx` L257-L261: footer 设置 `position: 'fixed', bottom: 0, zIndex: 0`。

#### FlowNavigation fixed right rail 的层叠规则

FlowNavigation 使用 Tailwind 的 `fixed right-10 top-1/2 -translate-y-1/2 z-50` 定位，仅在 `lg` 断点（1024px+）以上显示。它通过 ScrollTrigger 监听各 section 的进入/离开来激活对应节点。

节点位置不使用固定间距，而是根据各 section 在文档中的实际滚动位置动态计算 `cy` 值（`FlowNavigation.tsx` L103-L126），使 rail 上的节点与页面 section 一一对应。

> **证据来源**: `FlowNavigation.tsx` L185: `className="hidden lg:block fixed right-10 top-1/2 -translate-y-1/2 z-50"`；L103-L126: `compute()` 函数根据 `getBoundingClientRect()` 计算节点位置。

#### PageParticles 全页覆盖层的 z-index 体系

PageParticles 使用 `position: fixed; inset: 0` 覆盖全屏，`z-index: 1` 与 main-content-wrapper 同级。通过 `pointer-events: none` 确保不阻挡交互。SVG viewBox 为 `1920x1080`，使用 `preserveAspectRatio="none"` 拉伸适配。

桌面端 5 条路径，每条 2 个粒子（共 10 个）；移动端 3 条路径，每条 1 个粒子（共 3 个）。

> **证据来源**: `PageParticles.tsx` L77-L82: `className="fixed inset-0 w-screen h-screen pointer-events-none"`, `style={{ zIndex: 1 }}`；L57-L73: 桌面端 5 路径 x 2 粒子，移动端 3 路径 x 1 粒子。

#### Lenis 平滑滚动与 ScrollTrigger 的同步机制

LenisProvider 在 layout 最外层包裹所有内容。Lenis 实例通过 `lenis.on('scroll', () => ScrollTrigger.update())` 与 ScrollTrigger 同步。使用独立的 `requestAnimationFrame` 循环（而非 `gsap.ticker`），因为 Turbopack 环境下 `gsap.ticker` 会崩溃。

Lenis 配置：`duration: 1.2`，缓动函数 `Math.min(1, 1.001 - Math.pow(2, -10 * t))`，`smoothWheel: true`，`touchMultiplier: 2`。

> **证据来源**: `LenisProvider.tsx` L17-L22: Lenis 配置；L25-L27: ScrollTrigger 同步（`try/catch` 包裹以处理 Turbopack MotionPathPlugin 崩溃）；L31-L35: 独立 RAF 循环。

### Z-index 层级体系

从代码中提取的实际 z-index 值：

| 层级 | z-index | 组件 | 定位方式 | 说明 |
|------|---------|------|---------|------|
| z-0 | 0 | Footer | `position: fixed; bottom: 0` | 页面底层，被 main wrapper 遮盖后通过滚动揭示 |
| z-0 | 0 | Footer 内部 SVG 网络 | absolute | 粒子网络背景 |
| z-1 | 1 | `.main-content-wrapper` | `position: relative` | 所有 section 内容的容器 |
| z-1 | 1 | PageParticles | `position: fixed; inset: 0` | 全屏粒子覆盖层，`pointer-events: none` |
| z-1 | 1 | AccordionItem 左边框 | absolute | 展开时的蓝色竖线指示器 |
| z-1 | 1 | ValueCardsSection 卡片 | `position: relative` | 盖住连接线 SVG |
| z-50 | 50 | FlowNavigation | `position: fixed; right-10` | 右侧 Loop Rail 导航（Tailwind `z-50`） |
| z-99 | 99 | Mobile Command Drawer | `position: fixed; inset: 0` | 移动端导航抽屉遮罩层 |
| z-100 | 100 | CommandHeader | `position: fixed; top: 20` | 主导航栏，最高可见层级 |

> **证据来源**: `Footer.tsx` L261 (`zIndex: 0`)、L275 (`zIndex: 0`)；`layout.tsx` L42 (`zIndex: 1`)；`PageParticles.tsx` L81 (`zIndex: 1`)；`AccordionItem.tsx` L124 (`zIndex: 1`)；`ValueCardsSection.tsx` L277 (`zIndex: 1`)；`FlowNavigation.tsx` L185 (`z-50`)；`CommandHeader.tsx` L428 (`zIndex: 99`)、L222 (`zIndex: 100`)。

---

## 3.2 Section 组件模式 Section Component Pattern

### 统一结构

每个 section 遵循以下标准骨架：

```tsx
'use client';

import { useRef, useEffect } from 'react';
import { gsap, safeContext } from '@/lib/gsap';

export default function XxxSection() {
  const sectionRef = useRef<HTMLElement>(null);
  // ... 其他 DOM refs

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = safeContext(() => {
      if (reduced) {
        // 展示最终态，跳过动画
        gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',        // 或 'top 70%' / 'top 75%'
          toggleActions: 'play none none none',
        },
      });

      // 动画序列...
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="section-xxx"
      ref={sectionRef}
      style={{
        paddingTop: 'var(--space-section)',
        paddingBottom: 'var(--space-section)',
      }}
    >
      <div style={{ maxWidth: XXXX, margin: '0 auto', padding: '0 24px' }}>
        <h2>标题</h2>
        {/* 内容 */}
      </div>
    </section>
  );
}
```

**关键模式说明：**

1. **safeContext 包裹**: 所有 GSAP 操作必须在 `safeContext()` 内执行。该函数在 GSAP 不可用时（Turbopack 兼容性问题）自动回退，将 scope 内 `opacity: 0` 的元素恢复为可见。

2. **ScrollTrigger 初始化**: 多数 section 使用 `start: 'top 80%'` + `toggleActions: 'play none none none'`（进入时播放一次）。InfoLoopSection 使用 `pin: true` + `scrub: 0.5` 实现滚动驱动的 pinned 动画。

3. **Reduced motion 检测**: 每个组件在 useEffect 内通过 `window.matchMedia('(prefers-reduced-motion: reduce)')` 检测。检测到时直接 `gsap.set()` 设置最终态，跳过所有动画。

> **证据来源**:
> - `safeContext` 模式: `CompareSection.tsx` L37-L48、`SecuritySection.tsx` L133-L138、`SocialProof.tsx` L29-L37
> - ScrollTrigger 配置: `CompareSection.tsx` L50-L56（`start: 'top 70%'`）、`SecuritySection.tsx` L141-L146（`start: 'top 75%'`）、`SocialProof.tsx` L48-L53（`start: 'top 80%'`）
> - InfoLoopSection pinned: `InfoLoopSection.tsx` L79-L88（`pin: true, scrub: 0.5, start: 'top 84px', end: '+=2000'`）

### Section 主题切换

#### useSectionTheme 的滚动触发主题切换规则

`useSectionTheme` hook 已在 `src/hooks/useSectionTheme.ts` 中定义，但当前代码中**未被任何组件调用**。它提供的能力是：

- 接收 `ThemeZone[]` 数组，每个 zone 指定 `triggerSelector`、`targetColor`、`startOffset`（默认 `'top bottom'`）、`endOffset`（默认 `'top center'`）
- 使用 ScrollTrigger 的 `scrub: true` 模式，在滚动过程中平滑过渡 `body` 的 `backgroundColor`
- Reduced motion 下使用 `onEnter`/`onLeaveBack` 即时切换

#### Dark surface section 的使用场景

当前直接在组件内设置深色背景的 section：

| Section | 背景色 | CSS 变量 | HEX |
|---------|--------|---------|-----|
| LogoMarquee | `var(--color-surface-deep)` | `--color-surface-deep` | `#0B1628` |
| InfoLoopSection | `var(--color-surface-deep)` | `--color-surface-deep` | `#0B1628` |
| Footer | `var(--color-surface-dark)` | `--color-surface-dark` | `#0F172A` |

深色 section 使用 `--color-text-on-dark`（`#F1F5F9`）和 `--color-text-on-dark-muted`（`#94A3B8`）作为文字色。

> **证据来源**: `LogoMarquee.tsx` L137: `background: 'var(--color-surface-deep)'`；`InfoLoopSection.tsx` L235: `background: 'var(--color-surface-deep)'`；`Footer.tsx` L263: `background: 'var(--color-surface-dark)'`。

---

## 3.3 全局 UI 组件 Global UI Components

### CommandHeader

#### 状态机

CommandHeader 有 4 个状态维度，通过 `data-state` 和 `data-theme` 属性标记：

| 状态 | 触发条件 | data-state | data-theme |
|------|---------|-----------|-----------|
| **boot** | 页面加载，GSAP timeline 播放期间 | — | — |
| **idle/top** | `scrollY <= 80` | `top` | `light` |
| **scrolled** | `scrollY > 80` | `scrolled` | `light` |
| **dark-theme** | Footer 进入视口 | `scrolled` | `dark` |

状态转换链：`boot` → `idle`（GSAP timeline 完成后 `setBooted(true)`）→ `scrolled`（滚动 > 80px）→ `dark-theme`（Footer ScrollTrigger `onEnter`）

Boot 动画序列（GSAP timeline）：
1. Logo 出现（`data-boot="logo"`, opacity 0→1, y 5→0）
2. Brand mark 出现（scale 0.96→1）
3. Logo eyes 出现（scale 0.5→1, `back.out(2.5)` 缓动, stagger 0.08）
4. Brand mark 添加 `.am-booted` 类触发 `signal-boot` CSS 动画
5. 名称 "AutoMage" 出现
6. 导航项逐个出现（stagger 0.06）
7. Status chip 出现
8. CTA 按钮出现
9. `setBooted(true)`

> **证据来源**: `CommandHeader.tsx` L106-L111: 状态定义；L148-L149: scroll 阈值 80px；L163-L193: section 追踪和 Footer dark-theme 触发；L120-L143: boot 动画 timeline。

#### 毛玻璃参数矩阵

**CommandHeader（light & scrolled 状态）：**

| 属性 | idle/top 状态 | scrolled 状态 |
|------|-------------|--------------|
| `backdrop-filter` | `blur(22px)` | `blur(22px)` |
| `background` | `rgba(15, 23, 42, 0.78)` | `rgba(15, 23, 42, 0.78)` |
| `border` | `1px solid rgba(255,255,255,0.10)` | `1px solid rgba(255,255,255,0.10)` |
| `box-shadow` | `inset 0 1px 0 rgba(255,255,255,0.08)` | `0 18px 60px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.08)` |

注意：`isDark` 状态（Footer 进入时）对 background 和 border 无实际变化，两者使用相同值。

**Brand Mark hover（header hover 时）：**
```css
box-shadow:
  inset 0 0 0 1px rgba(255,255,255,.12),
  0 10px 30px rgba(15,23,42,.16),
  0 0 12px rgba(96,165,250,.18);
```

> **证据来源**: `CommandHeader.tsx` L228-L237: 毛玻璃参数；L229-L231: background 两种状态相同；L234: border 两种状态相同；`globals.css` L223-L228: hover shadow。

#### Mobile drawer 的交互状态

| 属性 | 遮罩层 | 面板 |
|------|-------|------|
| `background` | `rgba(15,23,42,0.4)` | `rgba(255,255,255,0.92)` |
| `backdrop-filter` | `blur(4px)` | `blur(24px)` |
| `border` | — | `1px solid rgba(148,163,184,0.2)` |
| `border-radius` | — | `20px` |
| `box-shadow` | — | `0 24px 80px rgba(15,23,42,0.12)` |
| `opacity` 过渡 | 0↔1 (0.3s) | — |
| `transform` 过渡 | — | `translateY(-12px)` ↔ `translateY(0)` (0.35s, `--ease-out`) |

打开时 `pointerEvents: 'auto'`，关闭时 `pointerEvents: 'none'`。打开时 `document.body.style.overflow = 'hidden'` 阻止背景滚动。

> **证据来源**: `CommandHeader.tsx` L428-L450: drawer 容器和遮罩；L439-L451: 面板样式；L201-L204: body overflow 锁定。

#### 信号线动画规格

```css
/* globals.css */
.am-signal-line-inner {
  animation: signal-line-sweep 4s linear infinite;
}

@keyframes signal-line-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
```

- 持续时间: 4s
- 缓动: `linear`
- 循环: `infinite`
- 运动范围: 从 `-100%` 到 `400%`（穿越整个元素宽度）

> **证据来源**: `globals.css` L194-L197: `signal-line-sweep` 关键帧定义；L210-L212: `.am-signal-line-inner` 应用。

### Footer

#### 粒子网络的技术规格

| 参数 | 值 |
|------|-----|
| SVG viewBox | `1440 x 800` |
| preserveAspectRatio | `xMidYMid slice` |
| 节点数 | 10 个（`generateNodes()` 固定坐标） |
| 连接线数 | 12 条贝塞尔曲线 |
| 路径颜色 | `#3B82F6`，strokeWidth 1，opacity 0.06 |
| 节点圆点 | r=3，fill `#3B82F6`，opacity 0.08 |
| 粒子数 | 每条路径 1 个（共 12 个） |
| 粒子半径 | `[1.5, 3]` 随机 |
| 粒子颜色 | `#3B82F6` |
| 粒子透明度 | `[0.15, 0.25]` 随机 |
| 粒子速度 | `[5, 9]` 秒随机 |

> **证据来源**: `Footer.tsx` L12-L22: 10 个节点坐标；L24-L36: 12 条贝塞尔路径；L85-L103: `useParticles` 配置。

#### Loop Seal 的渲染逻辑

Loop Seal 是 Footer 中心的环形 6 节点示意图：

| 参数 | 值 |
|------|-----|
| 中心坐标 | `(260, 260)` |
| 半径 | 180px |
| SVG 尺寸 | `520 x 520` |
| 轨道路径 | `<circle>` 元素，stroke `#3B82F6`，strokeWidth 1.5，opacity 0.25 |
| 节点标签 | Signal / Compress / Review / Decide / Execute / Learn |
| 节点角度 | -90° / -30° / 30° / 90° / 150° / 210°（从顶部顺时针） |

动画序列（ScrollTrigger scrub，`start: 'top 80%'`, `end: 'top 10%'`）：
1. 轨道路径 draw（strokeDashoffset 动画，占时间线 0-0.5）
2. 节点依次亮起（outer r 8→18, inner r 0→6，stagger 0.08，从 0.05 开始）
3. 信号光点沿轨道运动（使用 `getPointAtLength` native SVG API，从 0.05 到 0.65）
4. 标题淡入（0.55）
5. 副标题淡入（0.6）
6. 按钮淡入（stagger 0.05，0.7）
7. Footer links 淡入（stagger 0.03，0.8）

> **证据来源**: `Footer.tsx` L46-L62: Loop Seal 几何参数；L139-L146: ScrollTrigger scrub 配置；L148-L235: 动画序列。

#### "Decision Receipt" 的展示规则

Decision Receipt 位于 Loop Seal 下方，Footer links 上方：

| 属性 | 值 |
|------|-----|
| 最大宽度 | 560px |
| 边框 | `1px solid rgba(255,255,255,0.06)` |
| 圆角 | `var(--radius-md)` (12px) |
| 内边距 | `16px 20px` |
| 背景 | `rgba(255,255,255,0.02)` |
| 标题字体 | `var(--font-console)`，0.7rem，letter-spacing 0.06em |
| 标题颜色 | `#64748B` |
| 键值对字体 | `var(--font-console)`，0.7rem |
| 键颜色 | `#64748B` |
| 值颜色 | `#3B82F6` |

展示内容（固定数据）：
- `Decision Receipt #AM-2026`
- `Signal intake` → `Completed`
- `Human approval` → `Required`
- `Execution loop` → `Active`
- `Audit trail` → `Enabled`

> **证据来源**: `Footer.tsx` L450-L498: Decision Receipt 完整实现。

### FlowNavigation (Loop Rail)

#### 6 节点的 IntersectionObserver 检测规则

FlowNavigation 使用 ScrollTrigger（非 IntersectionObserver）检测 section 可见性：

| 节点 | label | zhLabel | sectionId | 角度 |
|------|-------|---------|-----------|------|
| 0 | Signal | 信号 | `section-hero` | 0° |
| 1 | Compress | 压缩 | `section-compare` | 60° |
| 2 | Review | 审阅 | `section-loop` | 120° |
| 3 | Decide | 决策 | `section-value` | 180° |
| 4 | Execute | 执行 | `section-security` | 240° |
| 5 | Learn | 学习 | `section-cta` | 300° |

注意：`section-cta` 在当前页面中不存在（未在 `page.tsx` 中渲染），Learn 节点无法被激活。

检测规则：每个 section 创建一个 ScrollTrigger，`start: 'top center'`, `end: 'bottom center'`，`onEnter` 和 `onEnterBack` 均触发 `activateNode(i)`。

> **证据来源**: `FlowNavigation.tsx` L14-L21: 6 个节点定义；L134-L146: ScrollTrigger 创建逻辑。

#### 粒子流动方向和速度

| 参数 | 值 |
|------|-----|
| 粒子形状 | circle, r=4 |
| 粒子颜色 | `var(--color-loop-particle)` (`#38BDF8`) |
| 粒子透明度 | 0.8 |
| 运动方向 | 沿 rail 垂直方向（y: 0 → svgHeight） |
| 运动模式 | `repeat: -1, yoyo: true`（来回循环） |
| 速度 | 3 秒单程 |
| 缓动 | `sine.inOut` |
| 尾迹 | 2 个 circle，r=3 和 r=2，opacity 0.3 和 0.2 |
| 尾迹延迟 | `(i + 1) * 0.15` 秒 |

> **证据来源**: `FlowNavigation.tsx` L149-L167: 粒子和尾迹动画配置；L228-L249: 粒子和尾迹 SVG 元素。

#### 节点激活/失活的状态转换

| 状态 | 节点半径 | 节点颜色 | label 透明度 |
|------|---------|---------|------------|
| 活跃（当前 section） | r=10 | `var(--color-loop-node-active)` (`#3B82F6`) | 1 |
| 已经过 | r=6 | `var(--color-loop-node-active)` | 0.6 |
| 未到达 | r=6 | `var(--color-loop-node-inactive)` (`rgba(59,130,246,0.15)`) | 0.4 |

路径段颜色：已走过的段使用 `var(--color-loop-path-active)` (`rgba(59,130,246,0.4)`)，未走过的使用 `var(--color-loop-path)` (`rgba(59,130,246,0.10)`)。

活跃节点有脉冲光晕效果：`r: 10→14, opacity: 0.3→0, repeat: -1, yoyo: true, duration: 1s, ease: 'sine.inOut'`。

> **证据来源**: `FlowNavigation.tsx` L45-L93: `activateNode` 函数的完整状态转换逻辑。

---

## 3.4 Glassmorphism 参数矩阵

| 组件 | backdrop-filter | background | border | shadow |
|------|----------------|------------|--------|--------|
| **CommandHeader (idle/top)** | `blur(22px)` | `rgba(15, 23, 42, 0.78)` | `1px solid rgba(255,255,255,0.10)` | `inset 0 1px 0 rgba(255,255,255,0.08)` |
| **CommandHeader (scrolled)** | `blur(22px)` | `rgba(15, 23, 42, 0.78)` | `1px solid rgba(255,255,255,0.10)` | `0 18px 60px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.08)` |
| **CommandHeader (dark-theme)** | `blur(22px)` | `rgba(15, 23, 42, 0.78)` | `1px solid rgba(255,255,255,0.10)` | 同 scrolled |
| **Mobile drawer backdrop** | `blur(4px)` | `rgba(15,23,42,0.4)` | — | — |
| **Mobile drawer panel** | `blur(24px)` | `rgba(255,255,255,0.92)` | `1px solid rgba(148,163,184,0.2)` | `0 24px 80px rgba(15,23,42,0.12)` |
| **Dual-key role cards** | `blur(14px)` | `rgba(255, 255, 255, 0.78)` | `1px solid rgba(148, 163, 184, 0.2)` | `0 14px 40px rgba(15, 23, 42, 0.06)` |
| **Signal Console** | — | `var(--color-surface-deep)` (`#0B1628`) | `1px solid rgba(255,255,255,0.06)` | — |
| **Signal Bus (LogoMarquee)** | — | `linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.88))` | `1px solid rgba(148, 163, 184, 0.18)` | `0 20px 60px rgba(15, 23, 42, 0.16)` |
| **Inspector Panel (InfoLoop)** | — | `var(--color-surface-dark)` (`#0F172A`) | `1px solid rgba(255,255,255,0.06)` | — |
| **LoopNodeCard (light)** | — | `var(--color-surface-card)` (`#FFFFFF`) | `1px solid var(--color-border-default)` (`rgba(0,0,0,0.06)`) | `var(--shadow-sm)` (`0 1px 2px rgba(0,0,0,0.04)`) |
| **LoopNodeCard (dark)** | — | `var(--color-surface-dark)` (`#0F172A`) | `1px solid rgba(255,255,255,0.08)` | `0 4px 24px rgba(0,0,0,0.3)` |
| **Brand Mark (light, idle)** | — | `radial-gradient(circle at 50% 45%, rgba(96,165,250,.28), transparent 60%), linear-gradient(180deg, rgba(15,23,42,.98), rgba(30,41,59,.92))` | `inset 0 0 0 1px rgba(255,255,255,.12), 0 8px 24px rgba(15,23,42,.18)` | — |
| **Brand Mark (dark)** | — | `linear-gradient(180deg, rgba(15,23,42,.98), rgba(30,41,59,.92))` | `inset 0 0 0 1px rgba(255,255,255,.12)` | — |

> **证据来源**: 以上所有值均从对应组件的 inline style 和 `<style>` 标签中提取，已在各组件章节中标注具体行号。

---

## 3.5 样式方案规范 Styling Approach

### 四层样式体系

#### 第 1 层: CSS Custom Properties (`globals.css :root`)

设计 tokens，定义在 `globals.css` 的 `:root` 选择器内（L3-L90）。包括：

- **Brand colors**: `--color-brand-primary`, `--color-brand-accent`, `--color-brand-cyan`
- **Text colors**: `--color-text-primary` 到 `--color-text-on-dark-muted`（5 级）
- **Surface colors**: `--color-surface-page` 到 `--color-surface-deep`（6 级）
- **Border colors**: `--color-border-default`, `--color-border-strong`, `--color-border-brand`
- **Loop Rail tokens**: 7 个以 `--color-loop-` 为前缀的变量
- **Signal/Gate colors**: 8 个语义色
- **Shadow tokens**: 5 个 shadow 变量
- **Typography**: `--font-sans`, `--font-mono`, `--font-console`
- **Spacing**: `--space-section` (140px), `--space-block` (64px), `--space-element` (24px)
- **Radius**: `--radius-sm` (6px) 到 `--radius-full` (9999px)
- **Motion**: 4 个 ease 函数 + 3 个 duration
- **Component tokens**: ticker 速度、inspector 宽度、FAQ 面板宽度

#### 第 2 层: Tailwind CSS 4 Utility Classes

用于布局和间距：

| 用途 | Tailwind 类 | 使用场景 |
|------|-----------|---------|
| 容器居中 | `mx-auto w-full` | 所有 section 的内容容器 |
| Grid 布局 | `grid grid-cols-1 md:grid-cols-3 gap-6` | ValueCards、SocialProof、TrustCards |
| Flex 对齐 | `flex items-center justify-center` | 居中元素、Pipeline 横向排列 |
| 响应式隐藏 | `hidden md:flex` / `hidden lg:block` | 桌面专属内容（nav、status chip） |
| 文字 | `font-semibold`, `font-medium`, `text-center` | 标题、正文、居中对齐 |
| 间距 | `mt-6`, `mb-8`, `p-6`, `gap-4` | 元素间距 |

> **证据来源**: `HeroSection.tsx` L286: `className="mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8"`；`CommandHeader.tsx` L269: `className="hidden lg:flex items-center"`；`SocialProof.tsx` L66: `className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto"`。

#### 第 3 层: Inline Styles（动态值和 CSS variable 引用）

用于：
- 引用 CSS variable: `background: 'var(--color-surface-deep)'`
- 动态计算值: `fontSize: 'clamp(2rem, 4vw, 3rem)'`
- 条件样式: `color: isActive ? '#0F172A' : '#334155'`
- GSAP 初始状态: `opacity: 0`, `transform: 'scale(0.92)'`

> **证据来源**: 几乎所有组件的 JSX 都大量使用 inline style 引用 CSS variable。

#### 第 4 层: Scoped `<style>` Tags

用于复杂 CSS，主要是动画关键帧、伪元素、hover 状态和组件特定样式：

| 组件 | `<style>` 标签内容 |
|------|-------------------|
| `HeroSection` (SignalConsole) | `@keyframes pulse-dot`, `@keyframes blink-dots`, `@media (prefers-reduced-motion)` |
| `LogoMarquee` | `.signal-bus` 容器样式、`.signal-chip` 样式、`.signal-bus__track` 动画、mask-image 渐变、`@keyframes signal-marquee` |
| `SecuritySection` | `.am-dual-key` 布局、`.am-role-card` 毛玻璃样式、`.am-approval-bridge` 动画、`.am-orbit-dot` 旋转、`.finger-line` stroke 动画、`.am-moving-dot` 移动点 |
| `globals.css` | 所有 `@keyframes` 定义（draw-path, node-pop, orbit, signal-line-sweep 等）、`.am-status-dot` 脉冲、`.am-brand-mark` boot 动画、`@media (prefers-reduced-motion)` 全局回退 |

> **证据来源**: `HeroSection.tsx` L204-L217；`LogoMarquee.tsx` L145-L214；`SecuritySection.tsx` L334-L470+；`globals.css` L114-L245。

### 命名和使用规则

**何时用 CSS variable**: 颜色、字体、间距、圆角、阴影等设计 token — 所有可能需要全局调整的值。

**何时用 Tailwind class**: 布局结构（grid/flex）、响应式断点（`md:`, `lg:`）、通用间距和文字样式。

**何时用 inline style**: CSS variable 引用、`clamp()` 计算值、条件样式（三元表达式）、GSAP 动画的初始/目标状态。

**何时用 `<style>` 标签**: `@keyframes` 动画定义、伪元素（`::before`, `::after`）、复杂选择器（`.parent:hover .child`）、CSS mask/clip-path、不能通过 inline style 表达的属性。

**禁止**: 不引入 CSS Modules、Styled Components 或 CSS-in-JS 库。不使用 Tailwind 的 `@apply` 指令。

---

## 3.6 技术约束 Technical Constraints

### 动画库约束

| 约束 | 说明 |
|------|------|
| **允许** | GSAP 3.15 + ScrollTrigger（已注册） |
| **允许** | CSS `@keyframes` 动画 |
| **允许** | `requestAnimationFrame` 自定义循环 |
| **允许** | `IntersectionObserver`（MetricsBar 使用） |
| **禁止引入** | Three.js / Framer Motion / Lottie / MotionPathPlugin |

**MotionPathPlugin 替代方案**: 项目实现了 `motionPathTo()` 函数（`src/lib/gsap.ts` L66-L98），使用 native SVG 的 `getPointAtLength()` + `getCTM()` 实现路径跟随动画。Footer 的 Loop Seal 直接使用 `getPointAtLength()` 驱动信号光点。

> **证据来源**: `package.json` 仅依赖 `gsap` 和 `lenis`；`gsap.ts` L66-L98: `motionPathTo` 实现；`Footer.tsx` L196: `orbitEl.getPointAtLength()`；`gsap.ts` L58-59 注释: "Replaces MotionPathPlugin which crashes in Turbopack dev mode"。

### 性能预算

| 指标 | 当前值 | 限制 |
|------|--------|------|
| **PageParticles 粒子数** | 桌面 10 个，移动端 3 个 | 桌面 ≤ 12，移动端 ≤ 4 |
| **Footer 网络粒子数** | 12 个（每条路径 1 个） | ≤ 15 |
| **FlowNavigation 粒子** | 1 主粒子 + 2 尾迹 | 固定 3 个 |
| **GSAP timeline 数量** | 每 section 1-2 个 | 每页 ≤ 20 |
| **ScrollTrigger 实例数** | ~15 个（Header 5 + Footer 1 + FlowNav 6 + 各 section） | ≤ 25 |
| **SVG path 总数** | ~30（Footer 12 + PageParticles 5 + InfoLoop 1 + 其他） | ≤ 50 |

**IntersectionObserver 替代 ScrollTrigger 的场景**: `MetricsBar` 使用 IntersectionObserver（而非 ScrollTrigger）来触发计数动画，因为其动画是一次性的数字增长，不需要 scrub 或精确的滚动位置关联。

> **证据来源**: `MetricsBar.tsx` L99-L108: `IntersectionObserver` 配置，`threshold: 0.2`，触发后 `observer.disconnect()`。

### 构建约束

| 约束 | 配置 | 证据 |
|------|------|------|
| **Static Export** | `output: 'export'` | `next.config.ts` L4 |
| **React Compiler** | `reactCompiler: true` | `next.config.ts` L5 |
| **单文件构建** | `inline.mjs` 将所有 CSS/JS/font 内联为 `automage-single.html` | `inline.mjs` 完整实现 |
| **Next.js 版本** | 16.2.6 | `package.json` L15 |
| **React 版本** | 19.2.4 | `package.json` L16-L17 |
| **Tailwind CSS** | v4（`@tailwindcss/postcss`） | `package.json` L21 |

**inline.mjs 构建流程**:
1. 读取 `out/index.html` 和所有 `_next/` 下的 CSS/JS/font 文件
2. 将 CSS 内联为 `<style>` 标签（含 font data URI 替换）
3. 移除 preload 链接
4. 将 JS chunk 编码为 base64，通过 bootstrap 脚本按序加载
5. 内联 favicon
6. 输出 `out/automage-single.html`

> **证据来源**: `next.config.ts` L3-L6；`inline.mjs` 完整文件（140 行）。

### 未使用组件清单

以下组件在代码库中已定义但未被任何其他文件 import：

| 组件 | 路径 | 状态 | 建议 |
|------|------|------|------|
| **AccordionItem** | `src/components/ui/AccordionItem.tsx` | 未使用 — FAQSection 自己实现了 accordion 逻辑 | **保留但标记为 legacy**。FAQSection 的内联实现包含了 `grid-template-rows: 0fr/1fr` 技巧和左蓝色竖线动画，功能上是 AccordionItem 的超集。如未来有更多 accordion 需求，可提取为通用组件 |
| **LoopNodeCard** | `src/components/ui/LoopNodeCard.tsx` | 未使用 — 包含 6 种视觉模式（ReportLines/SummaryBullets/ApprovalCheck/DecisionOptions/SelectedOption/TaskCards）和 `usePathDraw` 集成 | **保留但标记为备用**。视觉质量高，可用于 Loop 节点的卡片化展示。依赖 `usePathDraw` hook（已实现） |
| **InfoFlowAnimation** | `src/components/svg/InfoFlowAnimation.tsx` | 未使用 — 6 节点线性信息流动画，带粒子路径和节点呼吸脉冲 | **保留但标记为备用**。可作为 Hero 区域的替代装饰或移动端简化版 Loop 叙事。使用了 `useParticles` hook |

> **证据来源**: `Grep` 搜索 `LoopNodeCard|InfoFlowAnimation` 仅匹配到各自文件内的定义，无 import 引用；`Grep` 搜索 `import.*AccordionItem` 无结果。
