"use client";

import type { Dispatch } from "react";
import {
  CHANGE_DAY,
  N,
  WORK,
  autoResolves,
  delivered,
  feedForDay,
  shortfall,
  spotExtra,
  type Ctx,
  type FeedItem,
  type Status,
} from "@/lib/supply-chain-world";
import type { Action, WorldState } from "./SupplyChainWorld";
import styles from "./SupplyChain.module.css";

interface Props {
  state: WorldState;
  ctx: Ctx;
  dispatch: Dispatch<Action>;
  status: Status;
  onGuide: () => void;
}

export default function DeskColumn({ state, ctx, dispatch, status, onGuide }: Props) {
  const feed = feedForDay(state.day, ctx);
  const report = autoResolves(ctx) && state.day >= CHANGE_DAY && state.v1 !== null;
  const reportOpen = report && (state.day === CHANGE_DAY || !state.reportSeen);

  return (
    <aside className={styles.desk} id="desk" aria-label="你的待办与当天消息">
      <section className={styles.inbox} aria-labelledby="inbox-title">
        <h3 id="inbox-title" className={styles.deskTitle}>
          你的待办
          <span className={styles.inboxCount} data-active={status === "awaiting" || status === "reopened" || undefined}>
            {status === "awaiting" || status === "reopened" ? 1 : 0}
          </span>
        </h3>

        {status === "awaiting" && (
          <div className={styles.inboxCard} data-tone="ask">
            <span className={styles.inboxTag}>等你签批</span>
            <strong>{WORK.id} · {WORK.title}</strong>
            <p>补 {N.gap}t 的两个方案已经整理好，事实、推断和未知分开列着。</p>
            <button type="button" onClick={onGuide}>去处理 <span aria-hidden="true">↓</span></button>
          </div>
        )}

        {status === "reopened" && state.v1 && (
          <div className={styles.inboxCard} data-tone="return">
            <span className={styles.inboxTag}>退回给你</span>
            <strong>{WORK.id} · {WORK.title}</strong>
            <p>v1 的前提变了：供应商 B 第 {N.supplyDay} 天只能交 {delivered(state.v1)}t。附 v1 的依据、这次的变化和两个处理办法。</p>
            <button type="button" onClick={onGuide}>去处理 <span aria-hidden="true">↓</span></button>
          </div>
        )}

        {status !== "awaiting" && status !== "reopened" && (
          <p className={styles.inboxEmpty}>
            没有等你处理的事。
            {status === "closed" ? "" : <> {WORK.id} 在 AutoMage 手上。</>}
          </p>
        )}

        {report && state.v1 && (
          reportOpen ? (
            <div className={styles.reportCard}>
              <div className={styles.reportHead}>
                <span className={styles.reportTag}>报备 · 不需要你处理</span>
                <span>第 6 天 10:47</span>
              </div>
              <p>供应商 B 只能交 60%。缺的 {shortfall(state.v1)}t 已改由供应商 C 现货补，第 {N.supplyDay} 天到。</p>
              <p>额外 ¥{spotExtra(state.v1).wan.toFixed(1)} 万，占已批金额 {spotExtra(state.v1).pct}%（你给的上限 {N.limit}%）。已通知赵磊下单、刘敏收货。</p>
              <p className={styles.reportMuted}>没有采用：订单 E 暂停——会改客户交期，需要你来定。</p>
              <p className={styles.reportMuted}>依据：委托第 5 条（模拟改写）。完整过程在工作记录里。</p>
              {!state.reportSeen && (
                <button type="button" onClick={() => dispatch({ type: "seeReport" })}>知道了</button>
              )}
            </div>
          ) : (
            <p className={styles.reportLine}>第 6 天报备：缺口已由供应商 C 补足（{spotExtra(state.v1).pct}%）· 已读</p>
          )
        )}
      </section>

      <section className={styles.feed} aria-labelledby="feed-title">
        <h3 id="feed-title" className={styles.deskTitle}>第 {state.day} 天 · 发生了什么</h3>
        <ol key={`${state.run}-${state.day}-${feed.length}`} className={styles.feedList}>
          {feed.map((item, index) => <FeedRow key={item.id} item={item} index={index} />)}
        </ol>
      </section>
    </aside>
  );
}

function FeedRow({ item, index }: { item: FeedItem; index: number }) {
  return (
    <li
      className={styles.feedItem}
      data-kind={item.kind}
      data-tone={item.tone}
      data-layer={item.layer}
      data-lens-label={item.lens}
      style={{ "--i": index } as React.CSSProperties}
    >
      <span className={styles.feedTime}>{item.time}</span>
      <div className={styles.feedMain}>
        <div className={styles.feedWho}>
          {item.kind === "you" && (
            <>
              <span className={styles.youBadge} aria-hidden="true">你</span>
              <strong>你</strong>
              <span>{item.role} · 签批</span>
            </>
          )}
          {item.kind === "person" && (
            <>
              <span className={styles.avatar} aria-hidden="true">{item.from.slice(0, 1)}</span>
              <strong>{item.from}</strong>
              <span>{item.role}</span>
            </>
          )}
          {item.kind === "system" && (
            <>
              <span className={styles.sysBadge}>{item.from}</span>
              <span>{item.via}</span>
            </>
          )}
          {item.kind === "automage" && (
            <>
              <span className={styles.amBadge} aria-hidden="true">A</span>
              <strong>AutoMage</strong>
              <span className={styles.actTag}>{item.act}</span>
            </>
          )}
          {(item.kind === "person" || item.kind === "automage") && item.via && <span className={styles.feedVia}>{item.via}</span>}
        </div>
        <p className={styles.feedText}>{item.text}</p>
      </div>
    </li>
  );
}
