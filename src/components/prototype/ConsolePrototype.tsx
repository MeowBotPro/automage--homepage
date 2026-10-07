"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PrototypeHeader from "./PrototypeHeader";
import {
  CAPABILITY_CATALOG,
  CONSOLE_NAV_ITEMS,
  DEFAULT_CAPABILITY_IDS,
  PROTOTYPE_PLAN_STORAGE_KEY,
  type ConsoleNavId,
} from "@/lib/market-console-prototype";
import styles from "./MarketConsolePrototype.module.css";

const CONFIG_STEPS = [
  { id: "scope", index: "01", label: "业务范围" },
  { id: "environment", index: "02", label: "运行环境" },
  { id: "authority", index: "03", label: "授权边界" },
] as const;

type ConfigStep = (typeof CONFIG_STEPS)[number]["id"];

const PREVIEW_CONTENT: Record<Exclude<ConsoleNavId, "automage">, {
  kicker: string;
  title: string;
  description: string;
  rows: Array<[string, string, string]>;
}> = {
  overview: {
    kicker: "ORGANIZATION OVERVIEW",
    title: "企业级状态，不替代日常业务界面",
    description: "正式产品中，这里只汇总能力、环境和待处理治理事项。当前页面仅用于解释未来结构。",
    rows: [["已启用能力", "—", "等待真实服务"], ["运行环境", "1 个演示环境", "SIMULATED"], ["待处理请求", "—", "不连接后端"]],
  },
  environments: {
    kicker: "ENVIRONMENTS",
    title: "同一个控制平面，多个运行位置",
    description: "企业可以在这里理解 AutoMage Cloud 与私有运行环境的关系；凭证和原始数据仍由真实运行环境管理。",
    rows: [["AutoMage Cloud", "概念入口", "未连接"], ["上海私有环境", "演示目标", "SIMULATED"], ["北京测试环境", "未来结构", "未创建"]],
  },
  integrations: {
    kicker: "INTEGRATIONS",
    title: "连接关系在这里被治理",
    description: "Console 表达希望连接什么；真实凭证、群聊范围和数据权限不在本原型中采集。",
    rows: [["企业 IM", "需要", "待企业环境确认"], ["项目系统", "按能力需要", "待映射"], ["ERP / WMS", "按能力需要", "待映射"]],
  },
  governance: {
    kicker: "GOVERNANCE",
    title: "配置能力，也配置它不能做什么",
    description: "这里承载角色、审批策略、数据边界和审计摘要。生产权限不会由这个演示页面产生。",
    rows: [["Business Owner", "定义业务范围", "概念角色"], ["Runtime Admin", "确认本地边界", "概念角色"], ["Human Gate", "约束高影响动作", "策略草案"]],
  },
  organization: {
    kicker: "ORGANIZATION",
    title: "企业关系与服务关系",
    description: "未来用于组织资料、管理员、许可证和服务支持；员工不需要因此成为 Console 用户。",
    rows: [["企业名称", "示例：星海制造", "DEMO"], ["企业 Owner", "示例管理员", "DEMO"], ["服务计划", "未选择", "概念字段"]],
  },
};

export default function ConsolePrototype() {
  const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_CAPABILITY_IDS);
  const [activeNav, setActiveNav] = useState<ConsoleNavId>("automage");
  const [activeStep, setActiveStep] = useState<ConfigStep>("scope");
  const [department, setDepartment] = useState("管理层办公室");
  const [recipient, setRecipient] = useState("CEO 与部门负责人");
  const [environment, setEnvironment] = useState("上海私有运行环境");
  const [autoFollowUp, setAutoFollowUp] = useState(true);
  const [taskGate, setTaskGate] = useState(true);
  const [draftGenerated, setDraftGenerated] = useState(false);

  useEffect(() => {
    let restoredIds: string[] | null = null;
    const raw = window.localStorage.getItem(PROTOTYPE_PLAN_STORAGE_KEY);
    if (raw) {
      try {
        const stored = JSON.parse(raw) as unknown;
        if (Array.isArray(stored)) {
          const valid = stored.filter(
            (id): id is string =>
              typeof id === "string" && CAPABILITY_CATALOG.some((item) => item.id === id),
          );
          if (valid.length > 0) restoredIds = valid;
        }
      } catch {
        window.localStorage.removeItem(PROTOTYPE_PLAN_STORAGE_KEY);
      }
    }
    const restoreFrame = window.requestAnimationFrame(() => {
      if (restoredIds) setSelectedIds(restoredIds);
    });
    return () => window.cancelAnimationFrame(restoreFrame);
  }, []);

  const selectedCapabilities = useMemo(
    () => CAPABILITY_CATALOG.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  );

  const requirements = useMemo(
    () => Array.from(new Set(selectedCapabilities.flatMap((item) => item.inputs))),
    [selectedCapabilities],
  );

  const nextStep = () => {
    if (activeStep === "scope") setActiveStep("environment");
    else if (activeStep === "environment") setActiveStep("authority");
    else setDraftGenerated(true);
  };

  return (
    <div className={`${styles.prototypePage} ${styles.consolePage}`}>
      <PrototypeHeader active="console" />

      <main className={styles.consoleFrame}>
        <aside className={styles.consoleSidebar}>
          <div className={styles.organizationCard}>
            <span className={styles.organizationMonogram}>星</span>
            <div><strong>星海制造</strong><small>示例企业 · DEMO</small></div>
            <span aria-hidden="true">⌄</span>
          </div>

          <nav className={styles.consoleNav} aria-label="Console 信息架构">
            <p>CONSOLE</p>
            {CONSOLE_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                data-active={activeNav === item.id}
                onClick={() => setActiveNav(item.id)}
              >
                <span>{item.label}</span>
                <small>{item.hint}</small>
              </button>
            ))}
          </nav>

          <div className={styles.sidebarFoot}>
            <span>AM</span>
            <div><strong>示例管理员</strong><small>Organization Owner</small></div>
          </div>
        </aside>

        <section className={styles.consoleWorkspace}>
          <header className={styles.consoleWorkspaceHeader}>
            <div>
              <p className={styles.sectionLabel}>AUTOMAGE CONSOLE / STRUCTURE PROTOTYPE</p>
              <span>所有账号、组织、环境与部署状态均为本地演示</span>
            </div>
            <div className={styles.consoleHeaderActions}>
              <Link href="/market">← 返回能力中心</Link>
              <button type="button" onClick={() => setDraftGenerated(false)}>重置本页状态</button>
            </div>
          </header>

          {activeNav === "automage" ? (
            <div className={styles.automageWorkspace}>
              <div className={styles.importBanner}>
                <span className={styles.importPulse} aria-hidden="true" />
                <div>
                  <strong>已带入你的方案草案</strong>
                  <p>来自公开能力中心 · 当前浏览器本地状态 · 不代表真实企业配置</p>
                </div>
                <span className={styles.demoStamp}>IMPORTED · DEMO</span>
              </div>

              <div className={styles.consoleTitleRow}>
                <div>
                  <p className={styles.eyebrow}>MY AUTOMAGE</p>
                  <h1>继续配置「企业管理协同方案」</h1>
                  <p>把公开页面上的选择，与组织范围、运行位置和授权边界对齐。</p>
                </div>
                <div className={styles.planIdentity}>
                  <span>PLAN</span><strong>AM-DEMO-01</strong><small>未保存 · 本地演示</small>
                </div>
              </div>

              <div className={styles.setupGrid}>
                <div className={styles.setupMain}>
                  <div className={styles.configSteps} role="tablist" aria-label="配置步骤">
                    {CONFIG_STEPS.map((step) => (
                      <button
                        key={step.id}
                        type="button"
                        role="tab"
                        aria-selected={activeStep === step.id}
                        data-active={activeStep === step.id}
                        onClick={() => setActiveStep(step.id)}
                      >
                        <span>{step.index}</span>{step.label}
                      </button>
                    ))}
                  </div>

                  <div className={styles.configPanel}>
                    {activeStep === "scope" ? (
                      <>
                        <div className={styles.configPanelHeading}>
                          <div><span>STEP 01</span><h2>这些能力服务于谁</h2></div>
                          <p>原型只演示业务范围，不创建真实部门或成员。</p>
                        </div>
                        <div className={styles.formGrid}>
                          <label>
                            <span>使用部门</span>
                            <select value={department} onChange={(event) => setDepartment(event.target.value)}>
                              <option>管理层办公室</option><option>研发与产品</option><option>供应链中心</option>
                            </select>
                          </label>
                          <label>
                            <span>主要接收人</span>
                            <select value={recipient} onChange={(event) => setRecipient(event.target.value)}>
                              <option>CEO 与部门负责人</option><option>仅部门负责人</option><option>业务管理员</option>
                            </select>
                          </label>
                        </div>
                        <div className={styles.installedCapabilities}>
                          <span>本次方案包含</span>
                          {selectedCapabilities.map((item) => (
                            <div key={item.id}><strong>{item.title}</strong><small>{item.output}</small></div>
                          ))}
                        </div>
                      </>
                    ) : null}

                    {activeStep === "environment" ? (
                      <>
                        <div className={styles.configPanelHeading}>
                          <div><span>STEP 02</span><h2>选择未来运行位置</h2></div>
                          <p>这里只表达部署意图，不连接或检查任何真实环境。</p>
                        </div>
                        <div className={styles.environmentChoices}>
                          {["AutoMage Cloud", "上海私有运行环境"].map((item) => (
                            <button
                              key={item}
                              type="button"
                              data-selected={environment === item}
                              onClick={() => setEnvironment(item)}
                            >
                              <span>{item === "AutoMage Cloud" ? "CLOUD" : "PRIVATE"}</span>
                              <strong>{item}</strong>
                              <small>{item === "AutoMage Cloud" ? "适合快速验证 · 概念" : "数据与凭证留在企业边界 · 概念"}</small>
                            </button>
                          ))}
                        </div>
                        <div className={styles.requirementRows}>
                          {requirements.map((item) => <div key={item}><span>{item}</span><strong>待真实环境映射</strong></div>)}
                        </div>
                      </>
                    ) : null}

                    {activeStep === "authority" ? (
                      <>
                        <div className={styles.configPanelHeading}>
                          <div><span>STEP 03</span><h2>明确允许推进到哪一步</h2></div>
                          <p>配置变化与生产权限分离；本页不会产生任何授权凭证。</p>
                        </div>
                        <div className={styles.policyRows}>
                          <button type="button" aria-pressed={autoFollowUp} onClick={() => setAutoFollowUp((value) => !value)}>
                            <div><strong>自动追问缺失信息</strong><small>仅准备判断材料，不修改业务系统</small></div>
                            <span data-on={autoFollowUp}>{autoFollowUp ? "允许" : "关闭"}</span>
                          </button>
                          <button type="button" aria-pressed={taskGate} onClick={() => setTaskGate((value) => !value)}>
                            <div><strong>创建正式任务</strong><small>影响现实工作流，建议保留 Human Gate</small></div>
                            <span data-on={taskGate}>{taskGate ? "需要确认" : "策略预授权"}</span>
                          </button>
                        </div>
                        <div className={styles.boundaryNotice}>
                          <span>LOCAL BOUNDARY</span>
                          <p>真实企业环境仍可收紧数据范围和执行权限；云端配置不能越过本地边界。</p>
                        </div>
                      </>
                    ) : null}

                    <div className={styles.configFooter}>
                      <span>{draftGenerated ? "部署草案已在本地生成 · 未发送" : "所有修改仅存在于当前页面"}</span>
                      <button type="button" onClick={nextStep}>
                        {activeStep === "authority" ? "生成部署草案（演示）" : "继续下一步 →"}
                      </button>
                    </div>
                  </div>
                </div>

                <aside className={styles.liveSummary}>
                  <div className={styles.summaryTopline}><span>LIVE SUMMARY</span><span>{draftGenerated ? "DRAFTED" : "EDITING"}</span></div>
                  <h2>企业管理协同方案</h2>
                  <dl>
                    <div><dt>企业能力</dt><dd>{selectedCapabilities.length} 项</dd></div>
                    <div><dt>使用部门</dt><dd>{department}</dd></div>
                    <div><dt>主要接收人</dt><dd>{recipient}</dd></div>
                    <div><dt>运行环境</dt><dd>{environment}</dd></div>
                    <div><dt>信息追问</dt><dd>{autoFollowUp ? "自动" : "关闭"}</dd></div>
                    <div><dt>任务创建</dt><dd>{taskGate ? "需要确认" : "策略预授权"}</dd></div>
                  </dl>
                  <div className={styles.summaryCapabilities}>
                    {selectedCapabilities.map((item) => <span key={item.id}>{item.title}</span>)}
                  </div>
                  <p>PROTOTYPE ONLY<br />不保存、不部署、不连接真实系统</p>
                </aside>
              </div>

              {draftGenerated ? (
                <div className={styles.draftResult} role="status">
                  <div><span>DEMO RESULT</span><strong>部署草案已生成</strong></div>
                  <p>下一步在真实产品中会进入组织复核与环境确认；本原型在这里结束。</p>
                  <button type="button" onClick={() => setDraftGenerated(false)}>继续调整</button>
                </div>
              ) : null}
            </div>
          ) : (
            <ConsolePreview section={activeNav} />
          )}
        </section>
      </main>
    </div>
  );
}

function ConsolePreview({ section }: { section: Exclude<ConsoleNavId, "automage"> }) {
  const content = PREVIEW_CONTENT[section];
  return (
    <div className={styles.consolePreview}>
      <p className={styles.eyebrow}>{content.kicker}</p>
      <h1>{content.title}</h1>
      <p className={styles.previewLead}>{content.description}</p>
      <div className={styles.previewTable}>
        {content.rows.map(([name, value, status]) => (
          <div key={name}><strong>{name}</strong><span>{value}</span><small>{status}</small></div>
        ))}
      </div>
      <div className={styles.previewBoundary}>
        <span>STRUCTURE PREVIEW</span>
        <p>该入口只用于上会解释 Console 的未来信息架构，本次 CR 不实现其产品逻辑。</p>
      </div>
    </div>
  );
}
