# 可用性研究移交 · supply-chain-slice-20261007

Status: closed at iteration_cap（见 `convergence-report.md`）

## 最终规格

- 冻结的研究合同：`study-spec.md`、`role-goals.yaml`、`journey-oracle.yaml`（只给协调者）、`journey-branches.yaml`、`coverage-matrix.yaml`、`run-fixture-contract.yaml`（只读研究，不需要 fixture）。
- 累积变更规格：`change-spec.md`。
- 回访问题：`tasks/debrief.md`。参与者包：`participant-packets/`。

## 实现 CR 与版本

- 实现位于 `feat/homepage-vnext` 工作区，尚未提交：
  - `src/lib/supply-chain-world.ts`：确定性的 14 天场景模型
  - `src/components/supply-chain/*`：工作单、桌面栏、库存图、来源弹层、时间轴，以及拆开看和重放
  - `src/app/scenarios/supply-chain/page.tsx`：页面
  - `tests/supply-chain-world.test.cjs`：模型单测
- 各轮请求和回执：`iterations/I0{1,2,3}/implementation-{request.yaml,return.md}`。最后的 BUILD_ID 是 `I4MlRjrBr2yaM-bM2rmZq`（/tmp/am-build 生产构建）。

## 验证与复测

- 三轮共 8 个 run 的脱敏证据：`iterations/I0*/runs/*`，包括决策记录、浏览器事件、verdict 和回访。原始截图和 Session 结果在仓库外的 `/tmp/rcut-sc-20261007/`。
- 参与者的启动方式：从 `/tmp` 下运行无头 `claude -p`，使用工具白名单。用 Agent 工具启动的子会话会继承项目 memory 里的产品定位，等于污染了参与者，所以没有用。

## 后续恢复入口

- 如果要验证 F-010、F-016：复制 I03 的两份参与者包，换一个新的 run-id，并把运行版本指向新的构建。先在 `status.yaml` 中经 owner 同意提高 iteration_cap，再运行 `advance_iteration.py`。
- Homepage 和 Capability 阶段可以复用本研究的角色合同和回访问题框架，但不要复用本研究的 oracle 或 run。
