# Next Session 启动 Prompt（直接粘贴使用）

你是在一个新的 coding session 中工作，仓库为 `/root/neko/automage--homepage`（分支 `feat/homepage-vnext`）。产品与官网的设计讨论已在前一个 session 完成并冻结。你的职责是：**读取本地资料 → 理解已冻结的方向 → 修改前端 → 运行验证 → 根据实际界面做局部修正。** 你的目标是执行、验证和局部修正，而不是重新定义问题。

## 第一步：按顺序完整阅读

1. `docs/automage-website-implementation-handoff-20261007.md` —— **最高优先级**，canonical implementation contract；
2. `docs/experience-architecture-20261007.md` —— 设计推演记录，与 handoff 冲突处以 handoff 为准；
3. handoff §3.1/§3.2/§6 列出的现有实现文件（重点：`src/app/scenarios/supply-chain/page.tsx`、`src/components/homepage-vnext/ScenarioWorkbench.tsx`、`src/lib/homepage-vnext.ts`、`src/components/sections/CompareSection.tsx`）；
4. 本仓库 `AGENTS.md`：这是修改过 API/约定的 Next.js 版本，写框架代码前必须先读 `node_modules/next/dist/docs/` 中相关指南。

## 工作规则

1. 以 implementation handoff 为最高优先级依据；历史 specs（`specs/01–09`）和 memory 中与 handoff 冲突的旧约束一律不作数。
2. **不要**重新做产品定位和 Narrative Architecture；**不要**重新设计三个页面的职责（handoff §1、§7 是 frozen）。
3. 当前唯一主要任务：实现 **Supply Chain vertical slice**（handoff §3）。核心体验是 premise invalidation → reopen，两个 interaction hypothesis（三层拆开透镜、改规矩 replay）与验收标准都写在 §3.3/§3.5。
4. 允许你基于运行结果对局部 interaction 和视觉实现做调整——handoff §2 列出的 Design Hypotheses 就是留给你的调整空间。
5. **不能**因为自己的偏好推翻 frozen decisions；不得让六节点循环、粒子装饰、统一 section 模板、"ERP 写死论"、Market 购物车化等已退役内容回归。
6. 发现 handoff 与真实代码冲突时：先核对事实 → 尽量在既定设计意图下解决 → 只有确实无法实现或会造成明显错误时才提出 blocker（附最小复现和两个候选方案）。
7. 实现过程中**实际运行页面**（`npm run dev`，webpack 路径）、截图检查、走查交互并迭代；只看代码不算验证。按 §3.6 用新会话做 RCUT preflight，报告写观察到的理解/误解，不写成真实客户验证，不使用简单比例门槛。
8. **暂时不要顺手重构 Homepage、Capability 或整个 Design System**；不要触碰 `/contact`、`/market` 的行为；不接任何真实后端、不调用网络 API、不自动提交表单。
9. 证据纪律（handoff §1.5）：已实现 / 真实背景重构的 Scenario / direction-simulation 三层不能混淆；replay 配置不得伪装成已上线的产品设置界面；企业身份未经 owner 确认不得出现。
10. 是否 commit/push 按任务指示执行；未获指示时保持工作区，不主动推送。

## Open Questions

handoff §5 的 Q1–Q4 需要 owner 确认，但都不阻塞开工——按表中"默认处理"执行即可，涉及处留出易改的常量/文案位。

现在从 handoff §3 开始工作。
