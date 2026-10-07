# 可用性研究规格 - supply-chain-slice-20261007

Status: frozen（快速 preflight）

## 研究问题

重建后的 `/scenarios/supply-chain`（14 天工作世界）能否让第一次接触 AutoMage 的企业负责人，仅凭页面形成 handoff §3.5 的三项理解：

- A（必须）：说出 AutoMage 接手了什么。
- B（必须）：区分企业原有的环境/规则、AutoMage 承担的行为、企业交给 AutoMage 的自主边界；否则页面会被理解成一套供应链软件。
- C（独立指标）：给一个新的条件变化，能否预测「这次 AutoMage 自己处理还是回来找我」并说出依据。
- 附加：「改规矩重放」是否被误认为已上线的产品配置（handoff §1.5 / §3.3B）。

## 本地证据

- `docs/automage-website-implementation-handoff-20261007.md` §3.3、§3.5、§3.6。
- 运行版本：`/tmp/am-build` 生产构建（`next build --webpack`，源码与工作区 `src/` 同步于 2026-10-07），`node .next/standalone/server.js` 于 `http://127.0.0.1:3108`。

## 候选角色与开发者决策

- `ceo-manufacturing`（主要目标客户）：两名参与者，数字化熟练度 medium / low。
- `ceo-services`（非供应链行业）：一名参与者，用于检验 B——页面是否被读成「供应链软件」。
- 角色合同沿用 `role-contracts/` 中已冻结的版本；本研究只改入口 URL 与证据目录（见 participant-packets）。
- 无需 owner 决策：只读页面、无账号、无写入。

## 任务范围

参与者直接从场景页开始（研究对象是指定页面，不考察首页找入口）。任务只给现实背景和目标，不提三层、透镜、重放等页面概念。浏览结束后由协调者发出固定的回访问题（见 `tasks/debrief.md`），回答记录为 Participant 的显式陈述。

## 数据、风险与 Teardown

只读：页面全部为前端确定性模拟，不调用 API、不提交表单。无账号、无 seed。teardown 仅关闭参与者自己的 agent-browser session。

## 隔离策略

`best_effort`：每名参与者为不含协调者对话的新 Session（Agent 子会话），独立 agent-browser session。工具/文件 allowlist 未由 harness 强制，依赖 prompt 约束；原始证据写在仓库外 `/tmp/rcut-sc-20261007/`，协调者复核后提升脱敏摘要。

## 运行与综合计划

1. 三名参与者并行浏览，写决策记录与 verdict。
2. 协调者发出回访问题，记录回答。
3. 对照 `journey-oracle.yaml` 的语义 milestone 与理解目标写 `iterations/I01/findings.md`：观察到的理解/误解、失败模式、据此做的修正。不使用通过比例作为放行门槛（handoff §3.6）。

## 偏离说明

- handoff §3.6 指定本 Session 同时负责实现与 preflight；Participant 均为新 Session，但协调者与实现者是同一 Session。据此做的修正在 findings 中逐条列出，复测使用全新参与者。
- 多个合成参与者不是人口统计样本，也不是真实客户验证。

## 迭代与收敛

- iteration_cap: 3（I02 后由 2 调整为 3，用于一次针对 F-010 的复测，理由见 status.yaml 的 cap_change）
- 每轮使用全新 Participant 和浏览器 profile。
