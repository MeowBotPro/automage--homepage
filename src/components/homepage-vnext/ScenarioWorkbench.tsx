"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HomepageJourney.module.css";

type OptionId = "transfer" | "expedite";
type ReviewState = "ready" | "revision" | "approved" | "expired";
type ExecutionState = "idle" | "sent" | "awaiting" | "acknowledged" | "failed" | "handoff";
type GuideTarget = "option" | "confirm" | "approve";

const OPTIONS = {
  transfer: {
    meta: "OPTION A / LOWER COST",
    title: "跨仓调拨 42t",
    body: "从华南仓调拨，预计 3 天到达；需确认华南仓最低安全库存。",
    stats: ["+3 days", "¥18k logistics"],
    unknown: "华南仓最低安全库存",
  },
  expedite: {
    meta: "OPTION B / FASTER",
    title: "主供应商加急 50t",
    body: "预计 2 天提前到达；加急溢价 7.4%，需确认供应商书面交期。",
    stats: ["−4 days", "+7.4% premium"],
    unknown: "供应商书面交期",
  },
} as const;

export default function ScenarioWorkbench() {
  const [selected, setSelected] = useState<OptionId | null>(null);
  const [unknownConfirmed, setUnknownConfirmed] = useState(false);
  const [version, setVersion] = useState(1);
  const [review, setReview] = useState<ReviewState>("ready");
  const [execution, setExecution] = useState<ExecutionState>("idle");
  const timerRef = useRef<number | null>(null);
  const gateSectionRef = useRef<HTMLElement | null>(null);
  const firstOptionRef = useRef<HTMLButtonElement | null>(null);
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  const approvalActionRef = useRef<HTMLButtonElement | null>(null);
  const guideTimerRef = useRef<number | null>(null);
  const [guideTarget, setGuideTarget] = useState<GuideTarget | null>(null);

  useEffect(() => {
    return () => {
      if (guideTimerRef.current !== null) window.clearTimeout(guideTimerRef.current);
    };
  }, []);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const chooseOption = (id: OptionId) => {
    if (review === "approved") return;
    clearTimer();
    setSelected(id);
    setUnknownConfirmed(false);
    setReview("ready");
    setExecution("idle");
  };

  const reject = () => {
    clearTimer();
    setUnknownConfirmed(false);
    setReview("revision");
    setExecution("idle");
  };

  const resubmit = () => {
    setVersion((value) => value + 1);
    setReview("ready");
  };

  const approve = () => {
    if (!selected || !unknownConfirmed) return;
    clearTimer();
    setReview("approved");
    setExecution("idle");
  };

  const expire = () => {
    clearTimer();
    setReview("expired");
    setExecution("idle");
  };

  const dispatch = () => {
    if (review !== "approved" || !selected) return;
    clearTimer();
    setExecution("sent");
    timerRef.current = window.setTimeout(() => {
      setExecution("awaiting");
      timerRef.current = null;
    }, 650);
  };

  const retry = () => {
    clearTimer();
    setExecution("sent");
    timerRef.current = window.setTimeout(() => {
      setExecution("awaiting");
      timerRef.current = null;
    }, 650);
  };

  const reset = () => {
    clearTimer();
    setSelected(null);
    setUnknownConfirmed(false);
    setVersion(1);
    setReview("ready");
    setExecution("idle");
  };

  const activeOption = selected ? OPTIONS[selected] : null;
  const canApprove = Boolean(selected && unknownConfirmed);
  const requiredGateStep: GuideTarget = !selected
    ? "option"
    : review === "revision" || review === "expired"
      ? "approve"
      : !unknownConfirmed
        ? "confirm"
        : "approve";
  const requiredActionLabel = requiredGateStep === "option"
    ? "先选择 Option A 或 Option B"
    : requiredGateStep === "confirm"
      ? "确认关键事实"
      : review === "revision"
        ? "补充说明并重提"
        : review === "expired"
          ? "重新进入审阅"
          : "批准当前版本";

  const gateStepState = (step: GuideTarget) => {
    if (step === "option") return selected ? "complete" : "active";
    if (step === "confirm") {
      if (unknownConfirmed) return "complete";
      return selected && review !== "revision" && review !== "expired" ? "active" : "pending";
    }
    if (review === "approved") return "complete";
    return requiredGateStep === "approve" ? "active" : "pending";
  };

  const returnToGate = () => {
    setGuideTarget(requiredGateStep);
    const target = requiredGateStep === "option"
      ? firstOptionRef.current
      : requiredGateStep === "confirm"
        ? confirmRef.current
        : approvalActionRef.current;
    const anchor = target ?? gateSectionRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (anchor) {
      const top = window.scrollY + anchor.getBoundingClientRect().top - 144;
      window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
    }
    if (guideTimerRef.current !== null) window.clearTimeout(guideTimerRef.current);
    guideTimerRef.current = window.setTimeout(() => {
      target?.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 560);
  };
  const approvalText = !selected
    ? "等待选择"
    : review === "ready"
      ? unknownConfirmed ? "等待审阅" : "事实待确认"
      : review === "revision"
        ? "要求修订"
        : review === "approved"
          ? "已授权"
          : "授权已失效";

  const executionStep = execution === "idle" ? 0
    : execution === "sent" ? 1
      : execution === "awaiting" ? 2
        : execution === "acknowledged" ? 3
          : execution === "failed" ? 2
            : 3;

  return (
    <>
      <section ref={gateSectionRef} className={styles.section} id="section-security" aria-labelledby="gate-title">
        <header className={styles.sectionHeader}>
          <div className={styles.kicker}>03 / Human Gate</div>
          <h2 className={styles.sectionTitle} id="gate-title">提案可以由系统组织，承诺必须由人作出</h2>
          <p className={styles.sectionLead}>
            页面不再默认替你选择方案。关键未知项确认之前，批准入口保持阻断。
          </p>
        </header>

        <div className={styles.gateGuide} aria-label="授权演示路径">
          {([
            { id: "option", index: "01", label: "选择方案" },
            { id: "confirm", index: "02", label: "确认事实" },
            { id: "approve", index: "03", label: "批准版本" },
          ] as const).map((step) => (
            <div className={styles.gateGuideStep} data-state={gateStepState(step.id)} key={step.id}>
              <span className={styles.gateGuideIndex}>
                {gateStepState(step.id) === "complete" ? "✓" : step.index}
              </span>
              <span>{step.label}</span>
            </div>
          ))}
        </div>
        <p className={styles.gateGuideCurrent} aria-live="polite">
          {review === "approved" ? "授权完成：可以进入执行模拟" : `当前操作：${requiredActionLabel}`}
        </p>

        <div className={styles.optionGrid} aria-label="演示方案选择" data-guided={guideTarget === "option"}>
          {(Object.keys(OPTIONS) as OptionId[]).map((id) => {
            const option = OPTIONS[id];
            return (
              <button
                ref={id === "transfer" ? firstOptionRef : undefined}
                className={`${styles.optionButton} ${selected === id ? styles.optionSelected : ""}`}
                key={id}
                onClick={() => { setGuideTarget(null); chooseOption(id); }}
                type="button"
                aria-pressed={selected === id}
              >
                <div className={styles.optionHead}>
                  <span className={styles.optionMeta}>{option.meta}</span>
                  <span className={styles.optionCheck}>{selected === id ? "✓" : ""}</span>
                </div>
                <h3>{option.title}</h3>
                <p>{option.body}</p>
                <div className={styles.optionStats}>{option.stats.map((stat) => <span key={stat}>{stat}</span>)}</div>
              </button>
            );
          })}
        </div>

        <div className={styles.gateLayout}>
          <article className={`${styles.gateCard} ${styles.gateCardLocked}`}>
            <div className={styles.gateHead}>
              <div>
                <span className={styles.optionMeta}>PROPOSAL / DEMO-{String(version).padStart(2, "0")}</span>
                <h3 className={styles.gateTitle}>{activeOption?.title ?? "尚未选择方案"}</h3>
              </div>
              <span className={review === "approved" ? styles.successLabel : review === "revision" || review === "expired" ? styles.warningLabel : styles.stateLabel}>
                {approvalText}
              </span>
            </div>
            <p className={styles.gateCopy}>
              授权仅覆盖本次事件和当前版本。方案变化、关键事实变化或超时都不会沿用旧授权。
            </p>
            <div className={styles.boundaryList}>
              <div className={styles.boundaryRow}><span>观察事实</span><strong>库存 / 在途 / 排产</strong></div>
              <div className={styles.boundaryRow}><span>关键未知项</span><strong>{activeOption?.unknown ?? "选择方案后显示"}</strong></div>
              <div className={styles.boundaryRow}><span>确认状态</span><strong>{unknownConfirmed ? "已确认（Demo）" : "未确认 · 阻断授权"}</strong></div>
              <div className={styles.boundaryRow}><span>执行连接</span><strong>Demo adapter · 未连接</strong></div>
            </div>

            {selected && !unknownConfirmed && review !== "revision" && (
              <button
                    ref={confirmRef}
                    className={styles.confirmUnknown}
                    data-guided={guideTarget === "confirm"}
                    type="button"
                    onClick={() => { setGuideTarget(null); setUnknownConfirmed(true); }}
                  >
                确认关键事实（Demo）
              </button>
            )}

            {review === "revision" && (
              <div className={styles.revisionNote}>
                审阅意见：补充受影响客户订单说明并重新确认关键事实。旧版本不可执行。
              </div>
            )}

            <div className={styles.gateActions}>
              {review === "ready" && (
                <>
                  <button
                    ref={approvalActionRef}
                    className={`${styles.actionButton} ${styles.actionPrimary}`}
                    data-guided={guideTarget === "approve"}
                    type="button"
                    onClick={() => { setGuideTarget(null); approve(); }}
                    disabled={!canApprove}
                  >
                    批准当前版本
                  </button>
                  <button className={`${styles.actionButton} ${styles.actionDanger}`} type="button" onClick={reject} disabled={!selected}>退回修订</button>
                </>
              )}
              {review === "revision" && (
                <button
                  ref={approvalActionRef}
                  className={`${styles.actionButton} ${styles.actionPrimary}`}
                  data-guided={guideTarget === "approve"}
                  type="button"
                  onClick={() => { setGuideTarget(null); resubmit(); }}
                >
                  补充说明并重提
                </button>
              )}
              {review === "approved" && (
                <button className={`${styles.actionButton} ${styles.actionDanger}`} type="button" onClick={expire}>模拟授权过期</button>
              )}
              {review === "expired" && (
                <button
                  ref={approvalActionRef}
                  className={styles.actionButton}
                  data-guided={guideTarget === "approve"}
                  type="button"
                  onClick={() => { setGuideTarget(null); setReview("ready"); }}
                >
                  重新进入审阅
                </button>
              )}
            </div>
          </article>

          <aside className={styles.gateCard}>
            <span className={styles.optionMeta}>STATE MODEL</span>
            <h3 className={styles.gateTitle}>四个状态，不合并</h3>
            <p className={styles.gateCopy}>理解建议 ≠ 批准建议 ≠ 系统执行 ≠ 验证结果。</p>
            <div className={styles.boundaryList}>
              <div className={styles.boundaryRow}><span>01</span><strong>Proposal</strong></div>
              <div className={styles.boundaryRow}><span>02</span><strong>Authorization</strong></div>
              <div className={styles.boundaryRow}><span>03</span><strong>Execution</strong></div>
              <div className={styles.boundaryRow}><span>04</span><strong>Receipt</strong></div>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.section} id="section-story" aria-labelledby="commit-title">
        <header className={styles.sectionHeader}>
          <div className={styles.kicker}>04 / Commit & Evidence</div>
          <h2 className={styles.sectionTitle} id="commit-title">批准不是结果，回执才关闭这次循环</h2>
          <p className={styles.sectionLead}>
            发送、等待确认、失败、转人工和收到回执是不同状态；这里只模拟变化，不调用真实业务系统。
          </p>
        </header>

        <div className={styles.executionLayout}>
          <article className={styles.executionCard}>
            <div className={styles.gateHead}>
              <div>
                <span className={styles.optionMeta}>EXECUTION TRACE / DEMO</span>
                <h3 className={styles.gateTitle}>{activeOption?.title ?? "等待授权方案"}</h3>
              </div>
              <span className={
                execution === "acknowledged" ? styles.successLabel
                  : execution === "failed" ? styles.failureLabel
                    : execution === "handoff" ? styles.warningLabel
                      : styles.stateLabel
              }>
                {execution === "idle" ? "未执行"
                  : execution === "sent" ? "已发送"
                    : execution === "awaiting" ? "等待回执"
                      : execution === "acknowledged" ? "回执已确认"
                        : execution === "failed" ? "执行失败"
                          : "已转人工"}
              </span>
            </div>

            <div className={styles.executionTimeline}>
              {["授权有效", "发送到执行适配器", "等待外部确认", "写入结果回执"].map((label, index) => (
                <div className={`${styles.timelineItem} ${index <= executionStep && (review === "approved" || execution !== "idle") ? styles.timelineDone : ""}`} key={label}>
                  {label}
                </div>
              ))}
            </div>

            <p className={styles.authorizationHint} aria-live="polite">
              {review === "approved"
                ? "授权已建立。执行仍需由你单独触发。"
                : `当前缺少：${requiredActionLabel}。下方按钮会带你回到准确操作位置。`}
            </p>

            <div className={styles.executionActions}>
              {execution === "idle" && (
                <button
                  className={`${styles.actionButton} ${review === "approved" ? styles.actionPrimary : styles.authorizationReturn}`}
                  data-needs-authorization={review !== "approved"}
                  type="button"
                  onClick={review === "approved" ? dispatch : returnToGate}
                >
                  {review === "approved" ? "模拟发送执行" : `返回 Human Gate · ${requiredActionLabel}`}
                </button>
              )}
              {execution === "awaiting" && (
                <>
                  <button className={`${styles.actionButton} ${styles.actionPrimary}`} type="button" onClick={() => setExecution("acknowledged")}>模拟收到回执</button>
                  <button className={`${styles.actionButton} ${styles.actionDanger}`} type="button" onClick={() => setExecution("failed")}>模拟执行失败</button>
                </>
              )}
              {execution === "failed" && (
                <>
                  <button className={styles.actionButton} type="button" onClick={retry}>重试一次</button>
                  <button className={styles.actionButton} type="button" onClick={() => setExecution("handoff")}>转人工处理</button>
                </>
              )}
              {(execution === "acknowledged" || execution === "handoff") && (
                <button className={styles.actionButton} type="button" onClick={reset}>重置演示</button>
              )}
            </div>
          </article>

          <aside className={styles.executionCard} id="section-receipt">
            <span className={styles.optionMeta}>EVIDENCE RECEIPT</span>
            <h3 className={styles.gateTitle}>结果记录</h3>
            <p className={styles.gateCopy}>只有外部确认或人工接管被记录后，本次事件才进入已闭环状态。</p>
            <div className={styles.receipt}>
              <div className={styles.receiptRow}><span>proposal</span><strong>DEMO-{String(version).padStart(2, "0")}</strong></div>
              <div className={styles.receiptRow}><span>approval</span><strong>{review}</strong></div>
              <div className={styles.receiptRow}><span>execution</span><strong>{execution}</strong></div>
              <div className={styles.receiptRow}><span>verified</span><strong>{execution === "acknowledged" ? "yes / simulated" : "no"}</strong></div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
