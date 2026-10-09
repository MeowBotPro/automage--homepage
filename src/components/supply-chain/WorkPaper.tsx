"use client";

import { useState, type Dispatch } from "react";
import {
  CHANGE_DAY,
  LAST_DAY,
  N,
  RULE_TEXT,
  V1_DAY,
  V1_OPTIONS,
  WORK,
  autoResolves,
  claimsAt,
  delegationTerms,
  delivered,
  projectionAt,
  spotExtra,
  tasksAt,
  v1Option,
  v2Option,
  v2Options,
  type Change,
  type Claim,
  type Ctx,
  type Status,
} from "@/lib/supply-chain-world";
import type { Action, WorldState } from "./SupplyChainWorld";
import InventoryChart from "./InventoryChart";
import SourceTag from "./SourceTag";
import styles from "./SupplyChain.module.css";

const STATUS_LABEL: Record<Status, string> = {
  following: "跟进中",
  awaiting: "等你决定",
  reopened: "重新打开 · 等你决定",
  closed: "已关闭",
};

const V1_SIGNED_AT = "第 3 天 16:40";
const V2_SIGNED_AT = "第 6 天 13:50";

interface Props {
  state: WorldState;
  ctx: Ctx;
  dispatch: Dispatch<Action>;
  status: Status;
  changes: Change[];
}

export default function WorkPaper({ state, ctx, dispatch, status, changes }: Props) {
  const { day } = state;
  const [termsOpen, setTermsOpen] = useState(false);
  const [basisOpen, setBasisOpen] = useState(false);
  const compactTerms = day > 0 && !termsOpen;
  const signed = { v1Signed: state.v1Signed, v2Signed: state.v2Signed };
  const holder = status === "awaiting" || status === "reopened" ? "you" : "automage";
  const projection = projectionAt(day, ctx, signed);
  const claims = claimsAt(day, ctx, signed);
  const facts = claims.filter((claim) => claim.kind === "fact");
  const inferences = claims.filter((claim) => claim.kind === "inference");
  const unknowns = claims.filter((claim) => claim.kind === "unknown");
  const openUnknowns = unknowns.filter((claim) => !claim.resolved);
  const resolvedUnknowns = unknowns.filter((claim) => claim.resolved);
  const tasks = tasksAt(day, ctx);
  const terms = delegationTerms(state.rule);
  const showV1Panel = day === V1_DAY && !state.v1Signed;
  const showReopen = day === CHANGE_DAY && status === "reopened" && state.v1 !== null;
  const auto = autoResolves(ctx);

  return (
    <article className={styles.paper} aria-labelledby="work-title" data-status={status}>
      <header className={styles.paperHead}>
        <div className={styles.paperMeta}>
          <span>{WORK.id}</span>
          <span>{WORK.site}</span>
          <span>{WORK.material}</span>
        </div>
        <div className={styles.paperTitleRow}>
          <h2 id="work-title" className={styles.paperTitle}>{WORK.title}</h2>
          <div className={styles.paperState}>
            <span key={status} className={styles.stamp} data-status={status}>{STATUS_LABEL[status]}</span>
            <span className={styles.holder} data-holder={status === "closed" ? "closed" : holder}>
              <span className={styles.holderDot} aria-hidden="true" />
              {status === "closed" ? "已归档，记录保留" : holder === "you" ? "在你手上" : "在 AutoMage 手上"}
            </span>
          </div>
        </div>
        <p className={styles.paperOwner}>这项工作属于{WORK.site}。AutoMage 按下面的委托跟进它，过程都记在这张工作单上。</p>
      </header>

      <section id="work-today" tabIndex={-1} className={styles.today} aria-labelledby="today-title" data-layer="automage" data-lens-label="AutoMage · 更新状态并写明原因">
        <h3 id="today-title">第 {day} 天的变化</h3>
        <ul key={`${state.run}-${day}`}>
          {changes.map((change, index) => (
            <li key={change.id} data-tone={change.tone} style={{ "--i": index } as React.CSSProperties}>
              <strong>{change.text}</strong>
              <span>因为：{change.why}</span>
            </li>
          ))}
        </ul>
      </section>

      {showV1Panel && <DecisionV1 state={state} dispatch={dispatch} />}
      {showReopen && state.v1 && <Reopen state={state} ctx={ctx} dispatch={dispatch} breachDay={projection.breachDay} />}
      {day >= LAST_DAY && (
        <section className={styles.closure} aria-labelledby="closure-title" data-layer="boundary" data-lens-label="委托边界 · 完成标准">
          <div className={styles.closureHead}>
            <h3 id="closure-title">已关闭</h3>
            <span>第 14 天 11:05 · 按委托第 7 条</span>
          </div>
          <ul>
            <li>补货全部入库</li>
            <li>测算守住安全线到常规批次到货（第 {N.regularDay} 天，书面确认）</li>
            <li>相关任务全部回执</li>
          </ul>
          <p>
            工作已经完成，过程都留在记录里：
            {state.run === "first" ? "你的 2 次决定、1 次前提失效与退回" : "你的 1 次决定、1 次授权内调整与报备"}
            ，{tasks.length} 项任务回执，以及每条事实的来源。
          </p>
        </section>
      )}

      <section className={styles.delegation} aria-labelledby="delegation-title" data-layer="boundary" data-lens-label="委托边界 · 7 条">
        <div className={styles.blockHead}>
          <h3 id="delegation-title">委托</h3>
          <span>企业设定 · 委托人：供应链负责人（你）</span>
        </div>
        <ol className={styles.terms} id="delegation-terms" data-compact={compactTerms || undefined}>
          {terms.map((term, index) => {
            const simulated = term.id === "d5" && state.run === "replay";
            return (
              <li key={term.id} className={styles.term} data-returns={term.returnsToYou || undefined} data-simulated={simulated || undefined}>
                <span className={styles.termNo} aria-hidden="true">{index + 1}</span>
                <span className={styles.termLabel}>{term.label}</span>
                <span className={styles.termText}>
                  {term.text}
                  {term.returnsToYou && <span className={styles.returnsChip}>↩ 回到你这里</span>}
                  {simulated && <span className={styles.simChip}>推演改写</span>}
                </span>
              </li>
            );
          })}
        </ol>
        {day > 0 && (
          <button type="button" className={styles.termsMore} aria-expanded={termsOpen} aria-controls="delegation-terms" onClick={() => setTermsOpen((open) => !open)}>
            {termsOpen ? "收起，只看回到你这里的两条" : "这里只显示回到你这里的两条 · 看全部 7 条"}
          </button>
        )}
      </section>

      <section className={styles.risk} aria-labelledby="risk-title" data-layer="automage" data-lens-label="AutoMage · 库存测算">
        <div className={styles.blockHead}>
          <h3 id="risk-title">库存测算</h3>
          <span>{projection.label}</span>
        </div>
        <div className={styles.figures}>
          <div className={styles.figure}>
            <span>{day === 0 ? "账面库存" : "今天的库存"}</span>
            <strong>{projection.series[day]}t</strong>
          </div>
          <div className={styles.figure}>
            <span>安全线 · 企业规则</span>
            <strong>{N.safety}t</strong>
          </div>
          <div className={styles.figure} data-tone={projection.breachDay === null ? "ok" : "risk"}>
            <span>测算结论</span>
            <strong>{projection.breachDay === null ? `守住到第 ${N.regularDay} 天` : `第 ${projection.breachDay} 天跌破`}</strong>
          </div>
        </div>
        <InventoryChart projection={projection} day={day} />
      </section>

      <section className={styles.basis} aria-labelledby="basis-title">
        <div className={styles.blockHead}>
          <h3 id="basis-title">依据</h3>
          <span>事实、推断、未知分开记；每一条都能查到是谁、何时、从哪来的</span>
        </div>
        <div className={styles.basisGrid} id="basis-grid" data-compact={day > 0 && !basisOpen ? true : undefined}>
          <div>
            <h4 className={styles.kindHead} data-kind="fact">事实 <span>{facts.length}</span></h4>
            <ul className={styles.claims}>
              {facts.map((claim) => <ClaimRow key={claim.id} claim={claim} day={day} />)}
            </ul>
          </div>
          <div>
            <h4 className={styles.kindHead} data-kind="inference">推断 <span>{inferences.length}</span></h4>
            <ul className={styles.claims}>
              {inferences.map((claim) => <ClaimRow key={claim.id} claim={claim} day={day} />)}
            </ul>
            <h4 className={styles.kindHead} data-kind="unknown">还不知道 <span>{openUnknowns.length}</span></h4>
            {openUnknowns.length === 0 ? (
              <p className={styles.emptyNote}>没有悬而未决的未知项。</p>
            ) : (
              <ul className={styles.claims}>
                {openUnknowns.map((claim) => <ClaimRow key={claim.id} claim={claim} day={day} />)}
              </ul>
            )}
            {resolvedUnknowns.length > 0 && (
              <details className={styles.resolved}>
                <summary>已补齐的未知 {resolvedUnknowns.length}</summary>
                <ul className={styles.claims}>
                  {resolvedUnknowns.map((claim) => <ClaimRow key={claim.id} claim={claim} day={day} />)}
                </ul>
              </details>
            )}
          </div>
        </div>
        {day > 0 && (
          <button type="button" className={styles.basisMore} aria-expanded={basisOpen} aria-controls="basis-grid" onClick={() => setBasisOpen((open) => !open)}>
            {basisOpen ? "收起，只看今天新增的依据" : `这里只显示今天新增的 ${claims.filter((claim) => claim.since === day).length} 条和还不知道的 · 看全部 ${claims.length} 条`}
          </button>
        )}
      </section>

      {state.v1Signed && state.v1 && day >= V1_DAY && (
        <section className={styles.records} aria-labelledby="records-title" data-layer="boundary" data-lens-label="委托边界 · 须你签批的决定">
          <div className={styles.blockHead}>
            <h3 id="records-title">决定</h3>
            <span>每次决定都带着当时的依据留下来</span>
          </div>
          <V1Record state={state} ctx={ctx} />
          {day >= CHANGE_DAY && state.run === "first" && state.v2Signed && state.v2 && (
            <article className={styles.record} data-state={day >= LAST_DAY ? "done" : "active"}>
              <div className={styles.recordHead}>
                <strong>v2 · {v2Option(state.v1, state.v2).name}</strong>
                <span className={styles.recordState}>{day >= LAST_DAY ? "已完成" : "执行中"}</span>
              </div>
              <p className={styles.recordPlan}>{v2Option(state.v1, state.v2).plan} · {v2Option(state.v1, state.v2).extra}</p>
              <p className={styles.signature}><span>签批</span>你（供应链负责人）· {V2_SIGNED_AT}</p>
              <p className={styles.recordWhy}>为什么有 v2：v1 的前提「供应商 B 第 {N.supplyDay} 天交付 {v1Option(state.v1).bQty}t」在第 6 天失效；按委托第 5 条退回给你。v1 的其他前提继续有效。</p>
              <p className={styles.recordBasis}>
                依据：{v2Option(state.v1, state.v2).basedOn.text}
                <SourceTag source={v2Option(state.v1, state.v2).basedOn} />
              </p>
            </article>
          )}
          {day >= CHANGE_DAY && auto && (
            <article className={styles.record} data-state="auto">
              <div className={styles.recordHead}>
                <strong>执行中调整 · AutoMage 自行处理</strong>
                <span className={styles.recordState}>已报备给你</span>
              </div>
              <p className={styles.recordPlan}>{v2Option(state.v1, "spot").plan} · 额外 ¥{spotExtra(state.v1).wan.toFixed(1)} 万（已批金额 {spotExtra(state.v1).pct}%，授权上限 {N.limit}%）</p>
              <p className={styles.recordWhy}>授权依据：委托第 5 条（推演中改写）——{RULE_TEXT.within_5}</p>
              <p className={styles.recordWhy}>没有采用：订单 E 暂停——会改客户 E 的交期，不在授权内。</p>
              <p className={styles.autoStamp}>AutoMage · 第 6 天 10:45</p>
            </article>
          )}
        </section>
      )}

      {tasks.length > 0 && (
        <section className={styles.tasks} aria-labelledby="tasks-title" data-layer="automage" data-lens-label="AutoMage · 分派任务、跟进回执">
          <div className={styles.blockHead}>
            <h3 id="tasks-title">落实</h3>
            <span>AutoMage 把任务派给具体的人，回执回到这件工作里</span>
          </div>
          <ul className={styles.taskList}>
            {tasks.map((task) => (
              <li key={task.id} data-status={task.status} data-fresh={task.since === day || undefined}>
                <span className={styles.taskWho}>{task.who}</span>
                <span className={styles.taskWhat}>{task.what}</span>
                <span className={styles.taskReceipt}>
                  {task.status === "done" ? "✓ " : task.status === "changed" ? "! " : "… "}
                  {task.receipt ?? "等回执"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function ClaimRow({ claim, day }: { claim: Claim; day: number }) {
  return (
    <li
      className={styles.claim}
      data-kind={claim.kind}
      data-fresh={claim.since === day || undefined}
      data-layer={claim.layer}
      data-lens-label={claim.lens}
      data-lens-style="inline"
    >
      <span className={styles.claimLabel}>{claim.label}</span>
      <span className={styles.claimValue}>
        {claim.kind === "unknown" && claim.accepted ? (
          <>
            {claim.value}
            <span className={styles.acceptedMark}>{claim.accepted}</span>
          </>
        ) : claim.kind === "unknown" && claim.resolved ? (
          <>
            <span className={styles.resolvedMark}>已补齐：</span>
            {claim.resolved}
          </>
        ) : (
          claim.value
        )}
        {claim.previous && <s className={styles.previous}>{claim.previous}</s>}
      </span>
      <SourceTag source={claim.source} />
    </li>
  );
}

function DecisionV1({ state, dispatch }: { state: WorldState; dispatch: Dispatch<Action> }) {
  const option = state.v1 ? v1Option(state.v1) : null;
  const canSign = Boolean(state.v1 && state.v1Ack);
  return (
    <section id="decision-v1" className={styles.decision} aria-labelledby="v1-title" data-layer="boundary" data-lens-label="委托边界 · 采购决定须你签批">
      <div className={styles.decisionHead}>
        <h3 id="v1-title">等你决定：补 {N.gap}t 用哪个方案</h3>
        <span className={styles.demoNote}>示例 · 不会触发真实采购</span>
      </div>
      <p className={styles.decisionNote}>你签批的方案会记为决定 v1。之后如果有变化，会另记 v2，v1 和它当时的依据都保留。</p>
      <fieldset className={styles.options}>
        <legend className={styles.optionsLegend}>AutoMage 整理了两个方案。建议只是建议，由你选。</legend>
        {V1_OPTIONS.map((item) => (
          <label key={item.id} className={styles.option} data-checked={state.v1 === item.id || undefined}>
            <input
              type="radio"
              name="v1-option"
              value={item.id}
              checked={state.v1 === item.id}
              onChange={() => dispatch({ type: "chooseV1", id: item.id })}
              data-guide-target={!state.v1 && item.id === "split" ? "true" : undefined}
            />
            <span className={styles.optionTop}>
              <strong>{item.name}</strong>
              {item.suggested && <span className={styles.aiTag}>AutoMage 建议</span>}
            </span>
            <span className={styles.optionPlan}>{item.plan}</span>
            <span className={styles.optionCash}>现金占用 ¥{item.cash} 万</span>
            <span className={styles.optionLine}><b>好处</b>{item.good}</span>
            <span className={styles.optionLine}><b>代价</b>{item.cost}</span>
            {item.why && <span className={styles.optionWhy}>建议理由：{item.why}</span>}
            <span className={styles.optionPremises}>
              <b>这个方案建立在：</b>
              {item.premises.map((premise) => <span key={premise.id}>· {premise.text}</span>)}
            </span>
          </label>
        ))}
      </fieldset>

      {option && (
        <div className={styles.ack}>
          <p className={styles.ackTitle}>签批前：这个方案还有一项没有书面确认</p>
          <p className={styles.ackBody}>
            {option.unknown}
            <SourceTag source={option.unknownSource} />
          </p>
          <label className={styles.ackCheck}>
            <input
              type="checkbox"
              checked={state.v1Ack}
              onChange={(event) => dispatch({ type: "ackV1", value: event.target.checked })}
              data-guide-target={!state.v1Ack ? "true" : undefined}
            />
            我知道这一点，接受它，写进这次决定（v1）的条件
          </label>
        </div>
      )}

      <div className={styles.signRow}>
        <button
          type="button"
          className={styles.signButton}
          disabled={!canSign}
          aria-describedby="v1-sign-hint"
          onClick={() => dispatch({ type: "signV1" })}
          data-guide-target={canSign ? "true" : undefined}
        >
          签批 v1
        </button>
        <span id="v1-sign-hint">
          {!state.v1 ? "先选一个方案" : !state.v1Ack ? "还差一步：确认那项没有书面的条件" : "签批后，AutoMage 把任务派给具体的人，并跟进对方的确认。"}
        </span>
      </div>
    </section>
  );
}

function Reopen({ state, ctx, dispatch, breachDay }: { state: WorldState; ctx: Ctx; dispatch: Dispatch<Action>; breachDay: number | null }) {
  const v1 = state.v1!;
  const option = v1Option(v1);
  const got = delivered(v1);
  return (
    <section id="decision-v2" className={styles.reopen} aria-labelledby="v2-title">
      <div className={styles.reopenHead} data-layer="boundary" data-lens-label="委托边界 · 变化须回来找你">
        <span className={styles.reopenStamp}>重新打开</span>
        <h3 id="v2-title">v1 的一个前提不再成立，这项工作回到你手上</h3>
        <p>为什么回到你这里：委托第 5 条——{RULE_TEXT[ctx.rule]}</p>
      </div>

      <div className={styles.reopenCompare}>
        <div className={styles.reopenThen} data-layer="automage" data-lens-label="AutoMage · 保留原判断的依据">
          <h4>v1 为什么成立 <small>{V1_SIGNED_AT} 你签批时</small></h4>
          <ul className={styles.premises}>
            {option.premises.map((premise) => (
              <li key={premise.id} data-failed={premise.id === "p-b" || undefined}>
                <span className={styles.premiseMark} aria-hidden="true">{premise.id === "p-b" ? "✕" : "✓"}</span>
                <span className={styles.premiseText}>{premise.text}</span>
                {premise.id === "p-b" && <span className={styles.srOnly}>（已不成立）</span>}
                <SourceTag source={premise.source} />
              </li>
            ))}
          </ul>
          {v1 === "split" && <p className={styles.thenNote}>你接受的未知：华南仓下周是否够用（仍有效）</p>}
        </div>
        <div className={styles.reopenNow} data-layer="enterprise" data-lens-label="企业的人 · 采购转述供应商">
          <h4>现在变了什么 <small>第 6 天 10:20</small></h4>
          <p className={styles.nowChange}>
            供应商 B：第 {N.supplyDay} 天只能交 {got}t（{option.bQty}t 的 60%），余量最早第 20 天，不保证。
            <SourceTag source={{ who: "赵磊 · 采购", via: "转述供应商 B 邮件；SRM 交期变更", at: "第 6 天 10:20" }} />
          </p>
          <p className={styles.nowEffect}>按现在的到货测算：第 {breachDay ?? "—"} 天跌破安全线，常规批次第 {N.regularDay} 天才到。</p>
          <p className={styles.nowContext}>第 2 天的履约分析已经记下：供应商 B 有 2 次部分交付。</p>
        </div>
      </div>

      <fieldset className={styles.options}>
        <legend className={styles.optionsLegend}>AutoMage 准备了两个办法：用的是第 2 天记下的信息，供应商 C 的现货今天已复核</legend>
        {v2Options(v1).map((item) => (
          <label key={item.id} className={styles.option} data-checked={state.v2 === item.id || undefined}>
            <input
              type="radio"
              name="v2-option"
              value={item.id}
              checked={state.v2 === item.id}
              onChange={() => dispatch({ type: "chooseV2", id: item.id })}
              data-guide-target={!state.v2 && item.id === "spot" ? "true" : undefined}
            />
            <span className={styles.optionTop}>
              <strong>{item.name}</strong>
              {item.suggested && <span className={styles.aiTag}>AutoMage 建议</span>}
            </span>
            <span className={styles.optionPlan}>{item.plan}</span>
            <span className={styles.optionCash}>{item.extra}</span>
            <span className={styles.optionLine}><b>好处</b>{item.good}</span>
            <span className={styles.optionLine}><b>代价</b>{item.cost}</span>
            <span className={styles.optionLine}><b>依据</b>{item.basedOn.who} · {item.basedOn.at}</span>
          </label>
        ))}
      </fieldset>

      <div className={styles.signRow}>
        <button
          type="button"
          className={styles.signButton}
          disabled={!state.v2}
          aria-describedby="v2-sign-hint"
          onClick={() => dispatch({ type: "signV2" })}
          data-guide-target={state.v2 ? "true" : undefined}
        >
          签批 v2
        </button>
        <span id="v2-sign-hint">{state.v2 ? "v1 会保留在记录里，标明哪个前提失效、由 v2 接续" : "先选一个办法"}</span>
      </div>
    </section>
  );
}

function V1Record({ state, ctx }: { state: WorldState; ctx: Ctx }) {
  const { day } = state;
  const v1 = state.v1!;
  const option = v1Option(v1);
  const auto = autoResolves(ctx);
  const changed = day >= CHANGE_DAY;
  const recordState = day >= LAST_DAY
    ? changed && !auto ? "前提失效 · 由 v2 接续 · 已完成" : "已完成"
    : !changed
      ? "执行中"
      : auto
        ? "执行中调整 1 次"
        : state.v2Signed
          ? "前提失效 · 由 v2 接续"
          : "前提失效";
  return (
    <article className={styles.record} data-state={changed && !auto ? "invalidated" : day >= LAST_DAY ? "done" : "active"}>
      <div className={styles.recordHead}>
        <strong>v1 · {option.name}</strong>
        <span className={styles.recordState}>{recordState}</span>
      </div>
      <p className={styles.recordPlan}>{option.plan} · 现金占用 ¥{option.cash} 万</p>
      <p className={styles.signature}><span>签批</span>你（供应链负责人）· {V1_SIGNED_AT}</p>
      <p className={styles.recordWhy}>
        AutoMage 建议：{V1_OPTIONS.find((item) => item.suggested)!.name}。你的选择：{option.name}
        {option.suggested ? "（采纳建议）" : "（与建议不同）"}。
      </p>
      <ul className={styles.premises}>
        {option.premises.map((premise) => {
          const failed = changed && premise.id === "p-b";
          return (
            <li key={premise.id} data-failed={failed || undefined}>
              <span className={styles.premiseMark} aria-hidden="true">{failed ? "✕" : "✓"}</span>
              <span className={styles.premiseText}>
                {premise.text}
                {failed && <em className={styles.premiseNow}>第 6 天起：只能交 {delivered(v1)}t</em>}
              </span>
              <SourceTag source={premise.source} />
            </li>
          );
        })}
      </ul>
      {v1 === "split" && <p className={styles.recordBasis}>接受的未知：华南仓调出后下周是否够用（黄海口头）</p>}
    </article>
  );
}
