"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import {
  CHANGE_DAY,
  LAST_DAY,
  REPLAY_FROM,
  RULE_TEXT,
  V1_DAY,
  autoResolves,
  changesForDay,
  lensSummary,
  statusAt,
  summarizeRun,
  type Ctx,
  type Layer,
  type Rule,
  type Run,
  type V1Choice,
  type V2Choice,
} from "@/lib/supply-chain-world";
import WorkPaper from "./WorkPaper";
import DeskColumn from "./DeskColumn";
import styles from "./SupplyChain.module.css";

export type LensMode = "all" | Layer | null;

interface FirstRun {
  v1: V1Choice;
  v2: V2Choice | null;
  frontier: number;
}

export interface WorldState {
  run: Run;
  rule: Rule;
  day: number;
  frontier: number;
  v1: V1Choice | null;
  v1Ack: boolean;
  v1Signed: boolean;
  v2: V2Choice | null;
  v2Signed: boolean;
  first: FirstRun | null;
  lens: LensMode;
  sim: boolean;
  draftRule: Rule;
  reportSeen: boolean;
  compare: boolean;
  lensInvite: boolean;
  replayInvite: boolean;
}

export type Action =
  | { type: "go"; day: number }
  | { type: "next" }
  | { type: "prev" }
  | { type: "chooseV1"; id: V1Choice }
  | { type: "ackV1"; value: boolean }
  | { type: "signV1" }
  | { type: "chooseV2"; id: V2Choice }
  | { type: "signV2" }
  | { type: "lens"; value: LensMode }
  | { type: "sim"; open: boolean }
  | { type: "draftRule"; rule: Rule }
  | { type: "startReplay" }
  | { type: "exitReplay" }
  | { type: "seeReport" }
  | { type: "compare"; open: boolean }
  | { type: "dismissInvite"; which: "lens" | "replay" }
  | { type: "reset" };

const INITIAL: WorldState = {
  run: "first",
  rule: "confirm_all",
  day: 0,
  frontier: 0,
  v1: null,
  v1Ack: false,
  v1Signed: false,
  v2: null,
  v2Signed: false,
  first: null,
  lens: null,
  sim: false,
  draftRule: "confirm_all",
  reportSeen: false,
  compare: false,
  lensInvite: true,
  replayInvite: true,
};

export function contentCtx(state: WorldState): Ctx {
  return {
    run: state.run,
    rule: state.rule,
    v1: state.v1Signed ? state.v1 : null,
    v2: state.v2Signed ? state.v2 : null,
  };
}

export function blocker(state: WorldState): "v1" | "v2" | null {
  if (state.frontier === V1_DAY && !state.v1Signed) return "v1";
  if (state.frontier === CHANGE_DAY && !autoResolves(contentCtx(state)) && !state.v2Signed) return "v2";
  return null;
}

function reducer(state: WorldState, action: Action): WorldState {
  switch (action.type) {
    case "go":
      return action.day >= 0 && action.day <= state.frontier ? { ...state, day: action.day } : state;
    case "prev":
      return state.day > 0 ? { ...state, day: state.day - 1 } : state;
    case "next":
      if (state.day < state.frontier) return { ...state, day: state.day + 1 };
      if (state.frontier >= LAST_DAY || blocker(state)) return state;
      return { ...state, day: state.frontier + 1, frontier: state.frontier + 1 };
    case "chooseV1":
      return state.v1Signed ? state : { ...state, v1: action.id, v1Ack: false };
    case "ackV1":
      return state.v1Signed || !state.v1 ? state : { ...state, v1Ack: action.value };
    case "signV1":
      return state.v1 && state.v1Ack && !state.v1Signed ? { ...state, v1Signed: true } : state;
    case "chooseV2":
      return state.v2Signed || state.run !== "first" ? state : { ...state, v2: action.id };
    case "signV2":
      return state.v2 && !state.v2Signed ? { ...state, v2Signed: true } : state;
    case "lens":
      return { ...state, lens: action.value, sim: action.value ? false : state.sim, lensInvite: action.value ? false : state.lensInvite };
    case "sim":
      return {
        ...state,
        sim: action.open,
        lens: action.open ? null : state.lens,
        draftRule: action.open && state.run === "first" ? "confirm_all" : state.draftRule,
        replayInvite: action.open && state.v2Signed ? false : state.replayInvite,
      };
    case "draftRule":
      return { ...state, draftRule: action.rule };
    case "startReplay":
      if (!state.v1 || !state.v1Signed || state.frontier < CHANGE_DAY || state.draftRule === "confirm_all") return state;
      return {
        ...state,
        first: { v1: state.v1, v2: state.v2Signed ? state.v2 : null, frontier: state.frontier },
        run: "replay",
        rule: state.draftRule,
        day: REPLAY_FROM,
        frontier: REPLAY_FROM,
        v2: null,
        v2Signed: false,
        sim: false,
        lens: null,
        reportSeen: false,
        compare: false,
      };
    case "exitReplay":
      if (!state.first) return state;
      return {
        ...state,
        run: "first",
        rule: "confirm_all",
        v1: state.first.v1,
        v2: state.first.v2,
        v2Signed: state.first.v2 !== null,
        day: state.first.frontier,
        frontier: state.first.frontier,
        first: null,
        draftRule: "confirm_all",
      };
    case "seeReport":
      return { ...state, reportSeen: true };
    case "compare":
      return { ...state, compare: action.open };
    case "dismissInvite":
      return action.which === "lens" ? { ...state, lensInvite: false } : { ...state, replayInvite: false };
    case "reset":
      return INITIAL;
  }
}

function revealToday(focus: boolean) {
  const stacked = window.matchMedia("(max-width: 980px)").matches;
  const today = document.getElementById(stacked && !focus ? "desk" : "work-today");
  if (!today) return;
  const barBottom = document.querySelector("[data-toolbar-wrap]")?.getBoundingClientRect().bottom ?? 160;
  const top = today.getBoundingClientRect().top;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sticky = window.matchMedia("(min-width: 761px)").matches;
  const offset = sticky ? barBottom + 12 : 96;
  if (focus || top < offset || top > window.innerHeight * 0.7) {
    window.scrollTo({ top: Math.max(0, window.scrollY + top - offset), behavior: reduce ? "auto" : "smooth" });
  }
  if (focus) today.focus({ preventScroll: true });
}

const LENS_LAYERS: { key: Layer; name: string }[] = [
  { key: "enterprise", name: "企业原有" },
  { key: "automage", name: "AutoMage 做的" },
  { key: "boundary", name: "委托边界" },
];

function lensText(key: Layer, summary: ReturnType<typeof lensSummary>) {
  if (key === "enterprise") return `本来就有的：WMS、ERP、MES、SRM，${summary.people.length} 位同事，安全线、合同、预算这些规则`;
  if (key === "automage") {
    const total = summary.acts.reduce((sum, [, count]) => sum + count, 0);
    const acts = summary.acts.slice().sort((a, b) => b[1] - a[1]).map(([act, count]) => `${act} ${count}`).join(" · ");
    return `到今天它做了 ${total} 件事：${acts}`;
  }
  return "你们交给它的范围：能自己做到哪，什么时候回来找你，怎样算完成";
}

const MARKERS: Record<string, string> = {
  alert: "预警进入",
  sign: "你签批了 v1",
  return: "前提失效，退回给你",
  report: "授权内调整，只报备",
  risk: "原定风险日",
  closed: "完成，关闭",
};

function markerFor(day: number, state: WorldState) {
  if (day > state.frontier) return null;
  if (day === 0) return "alert";
  if (day === V1_DAY && state.v1Signed) return "sign";
  if (day === CHANGE_DAY) return autoResolves(contentCtx(state)) ? "report" : "return";
  if (day === 12) return "risk";
  if (day === LAST_DAY) return "closed";
  return null;
}

export default function SupplyChainWorld() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [barAway, setBarAway] = useState(false);
  const lastDayRef = useRef(state.day);
  const ctx = contentCtx(state);
  const signed = { v1Signed: state.v1Signed, v2Signed: state.v2Signed };
  const block = blocker(state);
  const atFrontier = state.day === state.frontier;
  const status = statusAt(state.day, ctx, signed);
  const changes = changesForDay(state.day, ctx, signed);
  // The replay compares against a first run that has already been interrupted on day 6.
  const canReplay = state.run === "first" && state.v1Signed && state.frontier >= CHANGE_DAY;
  const firstDone = state.run === "first" && state.frontier === LAST_DAY;
  // Invitations appear on the day they become relevant and the day after, then give way to the day 14 wrap-up.
  const quiet = !state.lens && !state.sim && atFrontier && !block && !firstDone;
  const showReplayInvite = quiet && canReplay && state.replayInvite && state.day <= CHANGE_DAY + 1;
  const showLensInvite = quiet && !showReplayInvite && state.run === "first" && state.v1Signed && state.lensInvite && state.day <= V1_DAY + 1;

  const signedKey = `${state.run}-${state.v1Signed}-${state.v2Signed}`;
  const lastSignedRef = useRef(signedKey);

  useEffect(() => {
    if (lastDayRef.current === state.day) return;
    lastDayRef.current = state.day;
    const active = document.activeElement as HTMLElement | null;
    if (active?.dataset.railDay !== undefined) {
      document.querySelector<HTMLElement>(`[data-rail-day="${state.day}"]`)?.focus({ preventScroll: true });
      return;
    }
    revealToday(false);
  }, [state.day]);

  useEffect(() => {
    if (lastSignedRef.current === signedKey) return;
    lastSignedRef.current = signedKey;
    revealToday(true);
  }, [signedKey]);

  // On phones the time bar is fixed to the bottom; once the world has scrolled past, it steps aside
  // so the rest of the page (bridge, evidence, footer) is not covered. A scroll listener (not an
  // IntersectionObserver) so that large jumps such as End or a fling still update it.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const end = endRef.current;
      if (!end) return;
      const past = end.getBoundingClientRect().top < window.innerHeight - 170;
      setBarAway(past && !barRef.current?.contains(document.activeElement));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [role='slider'], [data-own-arrows]")) return;
      if (!rootRef.current?.contains(target) && target !== document.body) return;
      if (event.key === "ArrowRight") { event.preventDefault(); dispatch({ type: "next" }); }
      if (event.key === "ArrowLeft") { event.preventDefault(); dispatch({ type: "prev" }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const guide = () => {
    const panel = document.getElementById(block === "v2" ? "decision-v2" : "decision-v1");
    if (!panel) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const barBottom = document.querySelector("[data-toolbar-wrap]")?.getBoundingClientRect().bottom ?? 160;
    const offset = window.matchMedia("(min-width: 761px)").matches ? barBottom + 12 : 96;
    window.scrollTo({ top: Math.max(0, window.scrollY + panel.getBoundingClientRect().top - offset), behavior: reduce ? "auto" : "smooth" });
    const target = panel.querySelector<HTMLElement>("[data-guide-target='true']") ?? panel.querySelector<HTMLElement>("input, button");
    window.setTimeout(() => target?.focus({ preventScroll: true }), reduce ? 0 : 420);
  };

  const onNext = () => {
    if (atFrontier && block) guide();
    else dispatch({ type: "next" });
  };

  const nextLabel = !atFrontier
    ? "下一天"
    : block === "v1"
      ? "等你签批 v1"
      : block === "v2"
        ? "等你重新决定"
        : state.frontier >= LAST_DAY
          ? "已到第 14 天"
          : "下一天";

  const summary = state.lens ? lensSummary(state.frontier, ctx) : null;
  const firstSummary = state.first ? summarizeRun("first", "confirm_all", state.first.v1, state.first.v2) : null;
  const replaySummary = state.first && state.frontier >= CHANGE_DAY ? summarizeRun("replay", state.rule, state.first.v1, null) : null;
  const announce = `第 ${state.day} 天。${changes.map((change) => change.text).join("；")}`;

  return (
    <div
      ref={rootRef}
      className={styles.world}
      data-lens={state.lens ?? undefined}
      data-run={state.run}
    >
      <div ref={barRef} className={styles.toolbarWrap} data-toolbar-wrap data-away={barAway || undefined}>
        <div className={styles.toolbar} role="group" aria-label="时间与视图">
          <div className={styles.stepper}>
            <button className={styles.stepButton} type="button" onClick={() => dispatch({ type: "prev" })} disabled={state.day === 0} aria-label="上一天">
              <span aria-hidden="true">‹</span>
            </button>
            <div className={styles.dayReadout} aria-hidden="true">
              <span>第</span>
              <strong>{state.day}</strong>
              <span>天</span>
              <small>/ {LAST_DAY}</small>
            </div>
            <button
              className={`${styles.nextButton} ${atFrontier && block ? styles.nextBlocked : ""}`}
              type="button"
              onClick={onNext}
              disabled={atFrontier && !block && state.frontier >= LAST_DAY}
              aria-label={atFrontier && block ? `${nextLabel}：跳到需要你操作的位置` : "下一天"}
            >
              {nextLabel}
              <span aria-hidden="true">{atFrontier && block ? "↓" : "›"}</span>
            </button>
          </div>

          <ol className={styles.rail} aria-label="14 天时间轴">
            {Array.from({ length: LAST_DAY + 1 }, (_, day) => {
              const marker = markerFor(day, state);
              const ghost = state.run === "replay" && day === CHANGE_DAY;
              return (
                <li key={day} className={styles.railItem}>
                  <button
                    type="button"
                    className={styles.railButton}
                    data-state={day === state.day ? "current" : day <= state.frontier ? "visited" : "future"}
                    data-marker={marker ?? undefined}
                    disabled={day > state.frontier}
                    tabIndex={day === state.day ? 0 : -1}
                    data-rail-day={day}
                    aria-current={day === state.day ? "step" : undefined}
                    aria-label={`第 ${day} 天${marker ? `：${MARKERS[marker]}` : ""}${day > state.frontier ? "（还没到）" : ""}`}
                    onClick={() => dispatch({ type: "go", day })}
                  >
                    <span className={styles.railTick} aria-hidden="true" />
                    <span className={styles.railNumber} aria-hidden="true">{day}</span>
                    {ghost && <span className={styles.railGhost} aria-hidden="true" title="第一次：退回给你" />}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className={styles.views}>
            <button
              type="button"
              className={styles.viewButton}
              aria-pressed={state.lens !== null}
              onClick={() => dispatch({ type: "lens", value: state.lens ? null : "all" })}
            >
              拆开看
            </button>
            <button
              type="button"
              className={styles.viewButton}
              aria-pressed={state.sim || state.run === "replay"}
              aria-expanded={state.sim}
              onClick={() => (state.run === "replay" ? dispatch({ type: "exitReplay" }) : dispatch({ type: "sim", open: !state.sim }))}
            >
              {state.run === "replay" ? "结束重放" : "改规矩重放"}
            </button>
            <button type="button" className={styles.resetButton} onClick={() => dispatch({ type: "reset" })} aria-label="从第 0 天重新开始">
              ↺
            </button>
          </div>
        </div>

        {!atFrontier && (
          <div className={styles.reviewBar}>
            <span>你在回看第 {state.day} 天，工作单和消息都停在那一天。</span>
            <button type="button" onClick={() => dispatch({ type: "go", day: state.frontier })}>回到第 {state.frontier} 天</button>
          </div>
        )}

        {state.lens && summary && (
          <div className={styles.lensBar} role="region" aria-label="拆开看：三层">
            <span className={styles.lensTitle}>拆开看<small>点一层单独看</small></span>
            <div className={styles.lensLayers}>
              {LENS_LAYERS.map((layer) => (
                <button
                  key={layer.key}
                  type="button"
                  className={styles.lensLayer}
                  data-layer-key={layer.key}
                  aria-pressed={state.lens === layer.key}
                  onClick={() => dispatch({ type: "lens", value: state.lens === layer.key ? "all" : layer.key })}
                >
                  <strong>{layer.name}</strong>
                  <span>{lensText(layer.key, summary)}</span>
                </button>
              ))}
            </div>
            <p className={styles.lensDetail} aria-live="polite">
              {state.lens === "all" ? "点一层，单独看它在页面上的部分。" : lensText(state.lens, summary)}
            </p>
            <button type="button" className={styles.barClose} onClick={() => dispatch({ type: "lens", value: null })}>收起</button>
          </div>
        )}

        {state.sim && state.run === "first" && (
          <div className={styles.simBar} role="region" aria-label="情景推演：改一条委托规矩">
            <div className={styles.simHead}>
              <span className={styles.simTag}>情景推演</span>
              <strong>改委托第 5 条，重放第 6 天</strong>
              <button type="button" className={styles.barClose} onClick={() => dispatch({ type: "sim", open: false })}>收起</button>
            </div>
            {!canReplay ? (
              <p className={styles.simLocked}>
                重放要和第一次对照：先往前走到第 6 天，经历那次变化，再回来改这一条规矩。
              </p>
            ) : (
            <>
            <fieldset className={styles.ruleChoice}>
              <legend>已批准的方案在执行中出现变化时……</legend>
              {(["confirm_all", "within_5"] as const).map((rule) => (
                <label key={rule} className={styles.ruleOption} data-checked={state.draftRule === rule}>
                  <input type="radio" name="draft-rule" value={rule} checked={state.draftRule === rule} onChange={() => dispatch({ type: "draftRule", rule })} />
                  <span className={styles.ruleMeta}>{rule === "confirm_all" ? "第一次用的规矩" : "改成"}</span>
                  <span className={styles.ruleText}>{RULE_TEXT[rule]}</span>
                </label>
              ))}
            </fieldset>
            <div className={styles.simActions}>
              <button type="button" className={styles.simStart} disabled={state.draftRule === "confirm_all"} onClick={() => dispatch({ type: "startReplay" })}>
                用改过的规矩重放第 6 天 <span aria-hidden="true">→</span>
              </button>
              <p>同一个 v1、同一天、同一条供应商消息，只换这一条规矩。推演不保存设置。哪些动作 AI 能自己做、做到哪，由你们在委托里定。</p>
            </div>
            </>
            )}
          </div>
        )}

        {state.run === "replay" && (
          <div className={styles.replayBar} role="region" aria-label="重放中">
            <span className={styles.simTag}>情景推演 · 重放</span>
            {state.frontier < CHANGE_DAY ? (
              <p>委托第 5 条改成了「5% 以内自行调整，事后报备」。第 0–5 天和 v1 都与第一次相同，往前走到第 6 天。</p>
            ) : (
              <p className={styles.contrast}>
                第 6 天，同一条消息：
                <span data-run="first">第一次：退回给你，你重新签批 v2</span>
                <span data-run="replay">这次：没有打扰你，只收到一张报备</span>
              </p>
            )}
            {state.frontier >= CHANGE_DAY && firstSummary && replaySummary && (
              <button type="button" aria-expanded={state.compare} onClick={() => dispatch({ type: "compare", open: !state.compare })}>
                {state.compare ? "收起对照" : "对照两次"}
              </button>
            )}
            <button type="button" onClick={() => dispatch({ type: "exitReplay" })}>回到第一次的结果</button>
            {state.compare && firstSummary && replaySummary && (
              <div className={styles.compareGrid} role="table" aria-label="第一次与重放对照">
                <div role="row" className={styles.compareHead}>
                  <span role="columnheader" />
                  <span role="columnheader">第一次 · 变化都回来找你</span>
                  <span role="columnheader">重放 · 5% 以内自行调整</span>
                </div>
                {([
                  ["第 6 天 10:20", "供应商 B：只能交 60%", "供应商 B：只能交 60%"],
                  ["这项工作", firstSummary.day6, replaySummary.day6],
                  ["你要做的", firstSummary.yourActions, replaySummary.yourActions],
                  ["怎么补上", firstSummary.resolution, replaySummary.resolution],
                  ["多花的钱", firstSummary.extra, replaySummary.extra],
                  ["记录里留下", firstSummary.record, replaySummary.record],
                ] as const).map(([label, a, b]) => (
                  <div role="row" className={styles.compareRow} key={label}>
                    <span role="rowheader">{label}</span>
                    <span role="cell" data-interrupt={label === "这项工作" ? firstSummary.interrupted : undefined}>{a}</span>
                    <span role="cell" data-quiet={label === "这项工作" ? !replaySummary.interrupted : undefined}>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showLensInvite && (
          <div className={styles.invite} role="region" aria-label="邀请：拆开看">
            <p>这几天出现过的系统、同事、规则、AutoMage 的动作和委托条款，各属于谁？</p>
            <button type="button" className={styles.inviteMain} onClick={() => dispatch({ type: "lens", value: "all" })}>拆开看</button>
            <button type="button" onClick={() => dispatch({ type: "dismissInvite", which: "lens" })}>先往下走</button>
          </div>
        )}

        {showReplayInvite && (
          <div className={styles.invite} data-kind="replay" role="region" aria-label="邀请：改规矩重放">
            <p>这件事退回给你，是因为委托第 5 条：执行中出现任何变化都要回来找你。换一条规矩，重放第 6 天，看这次会不会打扰你。</p>
            <button type="button" className={styles.inviteMain} onClick={() => dispatch({ type: "sim", open: true })}>改规矩重放</button>
            <button type="button" onClick={() => dispatch({ type: "dismissInvite", which: "replay" })}>先往下走</button>
          </div>
        )}

        {firstDone && !state.lens && !state.sim && (
          <div className={styles.nextSteps} role="region" aria-label="接下来">
            <span>第一次走完了。</span>
            <button type="button" onClick={() => dispatch({ type: "lens", value: "all" })}>拆开看这 14 天</button>
            <button type="button" onClick={() => dispatch({ type: "sim", open: true })}>改一条规矩，重放第 6 天</button>
          </div>
        )}
      </div>

      <div className={styles.workbench}>
        <WorkPaper state={state} ctx={ctx} dispatch={dispatch} status={status} changes={changes} />
        <DeskColumn state={state} ctx={ctx} dispatch={dispatch} status={status} onGuide={guide} />
      </div>
      <div ref={endRef} aria-hidden="true" />

      <p className={styles.srOnly} aria-live="polite">{announce}</p>
    </div>
  );
}
