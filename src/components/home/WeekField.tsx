import type { CSSProperties, ReactNode } from "react";
import {
  BEATS, BEFORE, DAYS, FEED, FLIP, LINES, OWNER_MESSAGE, PHRASES, SALES_MESSAGE, STILL_BEFORE, WORKS,
  avatarOf, type Chat, type Line, type Rec, type Work,
} from "@/lib/home-stage";
import styles from "./Home.module.css";

/** `**…**` marks the part of a line that matters. */
function rich(text: string): ReactNode {
  return text.split("**").map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part));
}

const Tag = ({ s }: { s?: string }) => (s ? <span className={styles.tag}>{s}</span> : null);

const at = (beat: number) => BEATS[beat].p;
const vars = (values: Record<string, number | undefined>) => values as CSSProperties;

/** Where each day starts when the week is lived again with AutoMage. */
const DAY_STARTS = DAYS.map((_, day) => Math.min(...BEATS.filter((beat) => beat.day === day).map((beat) => beat.p)) - 0.04);

/** When each line of the week shows, folds and changes, in stage progress. Lines that fold together
    fold one after another, so a chain of hand-offs reads as a chain; lines said together come one
    after another too. */
export const LINE_TIMES = (() => {
  let shown = 0;
  const folding: Record<number, number> = {};
  const adding: Record<number, number> = {};
  return LINES.map((line) => {
    const rv = line.added === undefined ? BEFORE.start + shown++ * BEFORE.step : undefined;
    const fd = line.fold === undefined ? undefined : at(line.fold) + (folding[line.fold] = (folding[line.fold] ?? -1) + 1) * 0.022;
    const ad = line.added === undefined ? undefined : at(line.added) + 0.05 + (adding[line.added] = (adding[line.added] ?? -1) + 1) * 0.06;
    return { rv, fd, ad, tf: line.becomes ? at(line.becomes.beat) : undefined, rp: DAY_STARTS[line.day] };
  });
})();

/** The talk as it is laid out: each day opens with a divider, as chats mark a new day. A divider comes
    in with its day's first line and never folds; if every line of its day folds, it says so (`ed`). */
export type Row = { kind: "day"; day: number; rv?: number; rp: number; ed?: number } | { kind: "line"; index: number; day: number };

export const ROWS: Row[] = (() => {
  const rows: Row[] = [];
  DAYS.forEach((_, day) => {
    const lines = LINES.map((line, index) => ({ line, index })).filter(({ line }) => line.day === day);
    if (!lines.length) return;
    const shows = lines.map(({ index }) => LINE_TIMES[index].rv).filter((rv): rv is number => rv !== undefined);
    const empty = lines.every(({ line }) => line.fold !== undefined);
    rows.push({ kind: "day", day, rv: Math.min(...shows), rp: DAY_STARTS[day], ed: empty ? Math.max(...lines.map(({ index }) => LINE_TIMES[index].fd ?? 0)) + 0.1 : undefined });
    lines.forEach(({ index }) => rows.push({ kind: "line", index, day }));
  });
  return rows;
})();

/** A role, drawn as work chats draw anyone without a photo. */
export function Avatar({ role, via, thinking }: { role: string; via?: string; thinking?: boolean }) {
  const { label, hue } = avatarOf(role, via);
  return <span className={styles.avatar} data-ai={hue < 0 || undefined} data-thinking={thinking || undefined} style={vars({ "--hue": hue < 0 ? undefined : hue })} aria-hidden="true">{label}</span>;
}

/* ── Messages AutoMage brings to a person ── */

function SalesMessage() {
  const m = SALES_MESSAGE;
  return <div className={styles.message} aria-label={`${m.title}，${m.status}`}>
    <p className={styles.messageHead}><b>{m.title}</b><span className={styles.status}>{m.status}</span></p>
    <p className={styles.rule}><span>碰到了你们定的线：</span>{m.rule}</p>
    <p className={styles.row}>{m.text}<Tag s={m.source} /></p>
  </div>;
}

export function OwnerMessage() {
  const m = OWNER_MESSAGE;
  return <div className={styles.message} aria-label={`${m.title}，${m.status}`}>
    <p className={styles.messageHead}><b>{m.title}</b><span className={styles.status}>{m.status}</span></p>
    <p className={styles.rule}><span>碰到了你们定的线：</span>{m.rule}<i>（{m.ruleNote}）</i></p>
    <p className={styles.row}><span className={styles.lbl}>发生了什么：</span>{m.happened}{m.happenedSources.map((s) => <Tag key={s} s={s} />)}</p>
    <p className={`${styles.row} ${styles.extra}`}><span className={styles.lbl}>它查到的：</span>{m.history}<Tag s={m.historySource} /></p>
    <div className={styles.row}><span className={styles.lbl}>{m.optionsLead}：</span><ol className={styles.options}>{m.options.map((option, i) => <li key={option}>{i + 1}. {option}</li>)}</ol></div>
    <p className={`${styles.reply} ${styles.extra}`}>{m.reply}</p>
  </div>;
}

/* ── The talk ── */

/** When (the day is given by the divider above, or by `withDay`), who to whom, and where. */
function Meta({ line, withDay }: { line: Line; withDay?: boolean }) {
  return <p className={styles.meta}>
    <span>{line.from}{line.to && ` → ${line.to}`}</span>
    <span>{line.via}</span>
    {(line.time || withDay) && <time>{withDay && `${DAYS[line.day]} `}{line.time}</time>}
  </p>;
}

/** A line as a chat draws it: the speaker's square, then who, where, when, and what was said. */
function LineBody({ line, settled, withDay }: { line: Line; settled?: boolean; withDay?: boolean }) {
  return <>
    <Avatar role={line.from} via={line.via} thinking={line.kind === "unsaid"} />
    <div className={styles.lineMain}><Meta line={line} withDay={withDay} /><Said line={line} settled={settled} /></div>
  </>;
}

function Said({ line, settled }: { line: Line; settled?: boolean }) {
  if (line.kind === "ai") return <SalesMessage />;
  if (line.kind === "owner") return <OwnerMessage />;
  const text = (s: string) => <p className={styles.said} data-unsaid={line.kind === "unsaid" || undefined}>{line.kind === "unsaid" ? `（${s}）` : rich(s)}</p>;
  if (!line.becomes) return text(line.text);
  if (settled) return text(line.becomes.text);
  return <div className={styles.becomes}><div>{text(line.text)}</div><div>{text(line.becomes.text)}</div></div>;
}

/** The week's talk on the live stage: every row, each with the moments it shows, folds or changes. */
export function Talk() {
  return <ol className={styles.talkList} data-talk>{ROWS.map((row) => {
    if (row.kind === "day") return <li key={`day-${row.day}`} className={styles.dayRow} data-grow data-row style={vars({ "--rv": row.rv, "--rp": row.rp, "--ed": row.ed })}>
      <div><span>{DAYS[row.day]}</span>{row.ed !== undefined && <i>这一天，不用谁问谁</i>}</div>
    </li>;
    const line = LINES[row.index];
    const t = LINE_TIMES[row.index];
    return <li key={line.id} className={styles.line} data-grow data-row data-kind={line.kind} data-fold={line.fold !== undefined || undefined}
      style={vars({ "--rv": t.rv, "--fd": t.fd, "--ad": t.ad, "--tf": t.tf, "--rp": t.rp })}>
      <div><LineBody line={line} /></div>
    </li>;
  })}</ol>;
}

/** The opening: an organization's talk, rising in three lanes on its own, before anyone scrolls. */
export function Feed() {
  const chat = (c: Chat, key: string) => <li key={key} data-key={c.key || undefined}>
    <Avatar role={c.from} />
    <div><p className={styles.meta}><span>{c.from} → {c.to}</span></p><p className={styles.said}>{c.text}</p></div>
  </li>;
  return <div className={styles.feed} aria-hidden="true">{FEED.map((lane, k) => (
    <ul key={k} style={vars({ "--lane": k })}>{[...lane, ...lane, ...lane].map((c, i) => chat(c, `${k}-${i}`))}</ul>
  ))}</div>;
}

/* ── The works ── */

/** `spare`: left out where the screen is short. */
function Grow({ at: p, spare, children }: { at: number; spare?: boolean; children: ReactNode }) {
  return <div className={`${styles.grow} ${spare ? styles.spare : ""}`} data-grow style={vars({ "--ad": p })}><div>{children}</div></div>;
}

const Record = ({ rec }: { rec: Omit<Rec, "beat"> }) => (
  <p className={styles.record} data-actor={rec.actor}><span>{rich(rec.text)}<Tag s={rec.source} /></span></p>
);

function WorkBlock({ work, index }: { work: Work; index: number }) {
  const flip = FLIP.start + index * FLIP.step;
  return <article className={styles.work} style={vars({ "--fl": flip })}>
    <h4>{work.title}<small>{work.area}</small></h4>
    <div className={styles.where} data-grow><p>{work.where}</p></div>
    {work.every && <Grow at={flip + 0.06} spare={!work.cycles}><p className={styles.every}>{work.every}
      {work.cycles && <span className={styles.cycles}>{work.cycles.map((c) => <i key={c.day} style={vars({ "--ad": at(c.beat) })}>{DAYS[c.day]} ✓</i>)}</span>}
    </p></Grow>}
    {work.history && <Grow at={flip + 0.06}><Record rec={work.history} /></Grow>}
    {work.records.map((rec) => <Grow key={rec.text} at={at(rec.beat)} spare={!!work.cycles}><Record rec={rec} /></Grow>)}
    {work.unknown && <Grow at={at(work.unknown.beat) + 0.03}><p className={styles.unknown}><b>还不知道</b>{work.unknown.text}</p></Grow>}
    {work.open && <Grow at={at(work.open.beat) + 0.03}><p className={styles.open}>{work.open.text}</p></Grow>}
    {work.route && <Grow at={at(work.route.beat) + 0.02}><p className={styles.route}><span>碰到了线 →</span><b>{work.route.to}</b>{work.route.text}</p></Grow>}
  </article>;
}

export function Works() {
  return <div className={styles.workList}>{WORKS.map((work, index) => <WorkBlock key={work.id} work={work} index={index} />)}</div>;
}

export function Phrases() {
  return <ul className={styles.phrases} aria-label="组织里每周都在说的话">{PHRASES.map((phrase, index) => (
    <li key={phrase} style={vars({ "--k": index })}>“{phrase}”</li>
  ))}</ul>;
}

/* ── Stills: phones, short screens ── */

function StillLine({ line, settled }: { line: Line; settled?: boolean }) {
  return <li className={styles.stillLine} data-kind={line.kind}><LineBody line={line} settled={settled} withDay /></li>;
}

/** Without AutoMage: the stretch of talk it takes to learn one thing. With AutoMage, at the end of the
    week: what is still said. */
export function StillTalk({ mode }: { mode: "before" | "friday" }) {
  const lines = mode === "before"
    ? STILL_BEFORE.map((id) => LINES.find((line) => line.id === id)!)
    : LINES.filter((line) => line.fold === undefined);
  return <ol className={styles.stillTalk}>{lines.map((line) => <StillLine key={line.id} line={line} settled={mode === "friday"} />)}</ol>;
}

/** Without AutoMage: where each work's state is. With AutoMage, by Thursday: what is on each work. */
export function StillWorks({ mode }: { mode: "before" | "after" }) {
  if (mode === "before") return <ul className={styles.stillWhere}>{WORKS.map((work) => <li key={work.id}><b>{work.title}</b>{work.where}</li>)}</ul>;
  return <div className={styles.stillWorks}>{WORKS.map((work) => <article key={work.id} className={styles.stillWork}>
    <h4>{work.title}<small>{work.area}</small></h4>
    {work.every && <p className={styles.every}>{work.every}{work.cycles && <span className={styles.cycles}>{work.cycles.map((c) => <i key={c.day}>{DAYS[c.day]} ✓</i>)}</span>}</p>}
    {work.history && <Record rec={work.history} />}
    {work.records.filter((rec) => rec.beat <= 5).map((rec) => <Record key={rec.text} rec={rec} />)}
    {work.unknown && <p className={styles.unknown}><b>还不知道</b>{work.unknown.text}</p>}
    {work.open && <p className={styles.open}>{work.open.text}</p>}
  </article>)}</div>;
}
