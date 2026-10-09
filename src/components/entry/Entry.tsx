import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowDown, ArrowRight, FileSearch, History, Lock, LockOpen, Route, Scale, ShieldCheck, Stamp } from "lucide-react";
import MarketChrome, { MarketFooter } from "@/components/market/MarketChrome";
import { getSkillCatalog } from "@/lib/server/skill-source";
import shared from "@/components/market/MarketPage.module.css";
import {
  ACTS, CLOSING, COUNTS, DOORS, FACTS, FAQ, GATE, HERO, libraryOf, LINE_STEP, LOOP_END, LOOP_START, LOOP_STEP, NODES, NOISE, NOTE_FLIGHT, STOCK, WEEK, WEEK_TOTAL, WORKS,
  noteStart, reachOf, workFill,
} from "@/lib/entry";
import HeroWork from "./HeroWork";
import LoopRing, { NODE_ICONS } from "./LoopRing";
import ScrollStage from "./ScrollStage";
import SmoothWheel from "./SmoothWheel";
import styles from "./Entry.module.css";

/* The default entry. The hero states the thesis and, beside it, shows it happening to one work: the
   two clauses sit on the rows of what they name, AutoMage's information work and the one point where a
   person judges, with the line between them. Three acts follow, one per thing an owner feels (看不清 /
   推不动 / 事后说不清); each tab gets its reason to be entered where the page has just made the visitor
   want it. AutoMage is drawn as blue writing on the work, never as an object of its own — it is a layer
   of the organization, not a place (philosophy §4.3). The first two acts stay in view while the page
   scrolls, as on AI for Work; everything else is ordinary page. */

const vars = (values: Record<string, string | number>) => values as CSSProperties;

export default async function Entry() {
  const library = libraryOf(await getSkillCatalog());
  return <div className={shared.page}>
    <MarketChrome active="entry" />
    <SmoothWheel />
    <main className={styles.main}>
      <Hero />
      <NoiseAct />
      <LoopAct />
      <Door id="work" door={DOORS.work}><WeekMarks /></Door>
      <GateAct />
      <Door id="supply" door={DOORS.supply}><StockChart /></Door>
      <Door id="library" door={DOORS.library}><Library library={library} /></Door>
      <Faq />
      <Closing />
    </main>
    <MarketFooter />
  </div>;
}

function Hero() {
  return <section className={styles.hero} aria-labelledby="entry-title">
    <div className={styles.heroGrid}>
      <h1 id="entry-title" className={styles.heroTitle}>{HERO.title[0]}<br /><span>{HERO.title[1]}</span></h1>
      <p className={styles.heroClause} data-zone="ai">{HERO.lead[0]}</p>
      <p className={styles.heroClause} data-zone="person">{HERO.lead[1]}</p>
      <div className={styles.heroRest}>
        <p className={styles.heroText}>{HERO.text}</p>
        <div className={styles.heroActions}>
          <Link className={styles.primary} href="/contact">{HERO.cta}<ArrowRight size={18} aria-hidden="true" /></Link>
          <a className={styles.heroHint} href="#how">{HERO.hint}<ArrowDown size={16} aria-hidden="true" /></a>
        </div>
      </div>
      <p className="sr-only">{HERO.example}</p>
      <HeroWork />
    </div>
  </section>;
}

/* ── 01 · 看得清: the noise passes through AutoMage into the things it belongs to ── */

/** Roughly where each work's card sits on the stage, in percent of its height: a note crosses the
    AutoMage layer at the height of the work it belongs to. */
const WORK_Y = [22, 50, 78];

function NoiseAct() {
  return <ScrollStage id="how" className={`${styles.act} ${styles.noiseAct}`} runway={1.55} rest={[0, 1.3]} labelledBy="noise-title">
    <div className={styles.frame} data-frame>
      <ActHead act={ACTS.noise} id="noise-title" />
      <div className={styles.canvas}>
        <ul className={styles.noise} aria-label="进展原本散在的地方">
          {NOISE.map((chip, i) => <li key={chip.text} style={vars({ "--x": `${chip.x}%`, "--y": `${chip.y}%`, "--rot": `${chip.rot}deg`, "--s": noteStart(i), "--wy": `${WORK_Y[chip.work]}%` })}>
            <span>{chip.source}</span>{chip.text}
          </li>)}
        </ul>
        <div className={styles.layer} aria-hidden="true"><span>AutoMage</span></div>
        <ol className={styles.workCards} aria-label="汇到对应的事上之后">
          {WORKS.map((work, w) => <li key={work.title} className={styles.workCard} style={vars({ "--s": workFill(w) - 0.02 })}>
            <p className={styles.workHead}><b>{work.title}</b><small>负责 · {work.owner}</small><span data-risk={work.risk}>风险 {work.risk}</span></p>
            <p className={styles.workRow}><span>到哪了</span>{work.state}</p>
            <p className={styles.workRow}><span>下一步</span>{work.next}</p>
            <p className={styles.workSources}>
              <span style={vars({ "--s": Math.min(...NOISE.flatMap((note, i) => (note.work === w ? [noteStart(i) + NOTE_FLIGHT - 0.04] : []))) })}>出处</span>
              {NOISE.map((note, i) => (note.work === w ? <i key={note.text} style={vars({ "--s": noteStart(i) + NOTE_FLIGHT - 0.04 })}>{note.source}</i> : null))}
            </p>
          </li>)}
        </ol>
        <p className={styles.noiseSum}>{NOISE.length} 条散在各处的话，落到了 {WORKS.length} 件事上。<small>每一条都还在，作为出处。</small></p>
      </div>
    </div>
  </ScrollStage>;
}

/* ── 02 · 推得动: one turn of the loop, the marker following the scroll ── */

function LoopAct() {
  const rest = [0, ...NODES.slice(1).map((_, k) => reachOf(k + 1)), LOOP_END];
  return <ScrollStage className={`${styles.act} ${styles.loopAct}`} runway={LOOP_END + 0.25} rest={rest} labelledBy="loop-title">
    <div className={styles.frame} data-frame style={vars({ "--l0": LOOP_START, "--ll": LOOP_END - LOOP_START, "--rl": LOOP_START + LINE_STEP * LOOP_STEP })}>
      <ActHead act={ACTS.loop} id="loop-title" />
      <div className={styles.loopBody}>
        <LoopRing />
        <div className={styles.loopSide}>
          <ol className={styles.panels}>{NODES.map((node, k) => {
            const Icon = NODE_ICONS[node.id];
            return <li key={node.id} className={styles.panel} data-actor={node.actor} style={vars({ "--r": reachOf(k), "--rn": reachOf(k + 1) })}>
              <p className={styles.panelHead}>
                <span className={styles.panelIcon}><Icon size={18} strokeWidth={1.7} aria-hidden="true" /></span>
                <b>{node.title}</b>
                <span className={styles.actor}>{node.actor === "ai" ? "AutoMage" : `人 · ${node.role}`}</span>
                <small>{k + 1} / {NODES.length}</small>
              </p>
              <p className={styles.panelLine}>{node.line}</p>
              <div className={styles.panelIo}>
                <div><h3>输入</h3><ul>{node.input.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><h3>产出</h3><ul>{node.output.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </div>
              <p className={styles.panelNote}>{node.note}</p>
            </li>;
          })}</ol>
          <ol className={styles.counts} aria-label="这一圈">
            {COUNTS.map((count) => <li key={count.unit} style={vars({ "--r": reachOf(count.node) })}><b>{count.n}</b>{count.unit}</li>)}
          </ol>
          <p className={styles.loopNote}>{ACTS.loop.note}</p>
        </div>
      </div>
    </div>
  </ScrollStage>;
}

/* ── 03 · 说得清: one pass through a line, and what keeps it accountable ── */

const STATION_ICONS = { ai: Route, person: Stamp } as const;
const FACT_ICONS = { shield: ShieldCheck, scale: Scale, history: FileSearch } as const;

function GateAct() {
  return <section className={`${styles.act} ${styles.gateAct}`} aria-labelledby="gate-title">
    <div className={styles.wrap}>
      <ActHead act={ACTS.gate} id="gate-title" />
      <ol className={styles.track}>
        {GATE.map((station, i) => {
          const Icon = station.actor === "line" ? null : i === GATE.length - 1 ? History : STATION_ICONS[station.actor];
          return <li key={station.title} data-actor={station.actor}>
            <span className={styles.stationIcon} aria-hidden="true">
              {Icon ? <Icon size={20} strokeWidth={1.7} /> : <><Lock className={styles.locked} size={18} strokeWidth={1.8} /><LockOpen className={styles.unlocked} size={18} strokeWidth={1.8} /></>}
            </span>
            <strong>{station.title}</strong>
            <p>{station.text}</p>
          </li>;
        })}
        <li className={styles.token} aria-hidden="true" />
      </ol>
      <ul className={styles.facts}>
        {FACTS.map((fact) => {
          const Icon = FACT_ICONS[fact.icon];
          return <li key={fact.title}><Icon size={20} strokeWidth={1.7} aria-hidden="true" /><strong>{fact.title}</strong><p>{fact.text}</p></li>;
        })}
      </ul>
    </div>
  </section>;
}

/* ── The doors: each tab, entered for the reason the page has just given ── */

function Door({ id, door, children }: { id: string; door: { tab: string; href: string; title: string; text: string; cta: string; note?: string }; children: ReactNode }) {
  return <section className={styles.door} aria-labelledby={`door-${id}`}>
    <div className={styles.doorInner}>
      <div className={styles.doorCopy}>
        <p className={styles.doorTab}>{door.tab}</p>
        <h2 id={`door-${id}`}>{door.title}</h2>
        <p className={styles.doorText}>{door.text}</p>
        <Link className={styles.doorLink} href={door.href}>{door.cta}<ArrowRight size={18} aria-hidden="true" /></Link>
        {door.note && <p className={styles.doorNote}>{door.note}</p>}
      </div>
      <div className={styles.doorVisual}>{children}</div>
    </div>
  </section>;
}

/** The AI for Work week as marks: one per line, day by day, without AutoMage and with it. */
function WeekMarks() {
  return <figure className={styles.week} aria-label={`同一周：没有 AutoMage 时说了 ${WEEK_TOTAL.before} 句，有了 AutoMage 剩 ${WEEK_TOTAL.after} 句`}>
    {(["before", "after"] as const).map((pass) => <div key={pass} className={styles.weekRow} data-pass={pass}>
      <p className={styles.weekLabel}>{pass === "before" ? "没有 AutoMage" : "有了 AutoMage"}<b>{WEEK_TOTAL[pass]} 句</b></p>
      <ol>{WEEK.map((day) => <li key={day.day}>
        {day[pass].length ? day[pass].map((mark, i) => <i key={i} data-mark={mark} />) : <em>不用谁问谁</em>}
      </li>)}</ol>
    </div>)}
    <div className={styles.weekRow} data-pass="days" aria-hidden="true"><span /><ol>{WEEK.map((day) => <li key={day.day}>{day.day}</li>)}</ol></div>
    <figcaption className={styles.legend}>
      <span data-mark="said">人和人之间的话</span><span data-mark="unsaid">心里记着、没说出口</span><span data-mark="ai">AutoMage 带着依据来</span>
    </figcaption>
  </figure>;
}

/** The AI+供应链 stock over the 14 days, from the tab's own model. */
function StockChart() {
  const { days, safety, top, alone, carried, breachDay, marks } = STOCK;
  const x = (day: number) => 26 + (day * 280) / days;
  const y = (value: number) => 124 - (value / top) * 100;
  const path = (series: number[]) => series.map((value, day) => `${day ? "L" : "M"}${x(day).toFixed(1)} ${y(value).toFixed(1)}`).join(" ");
  return <figure className={styles.stock}>
    <svg viewBox="0 0 320 150" role="img" aria-label={`库存测算：不处理，第 ${breachDay} 天跌破 ${safety}t 安全线；交给 AutoMage 之后，14 天都守在安全线以上`}>
      <line className={styles.stockSafety} x1={x(0)} x2={x(days)} y1={y(safety)} y2={y(safety)} />
      <text className={styles.stockSafetyLabel} x={x(days)} y={y(safety) - 5} textAnchor="end">安全库存 {safety}t</text>
      <path className={styles.stockAlone} d={path(alone)} />
      <path className={styles.stockCarried} d={path(carried)} />
      {breachDay !== null && <g className={styles.stockBreach}>
        <circle cx={x(breachDay)} cy={y(alone[breachDay])} r="2.8" />
        <text x={x(breachDay) - 5} y={y(alone[breachDay]) + 14} textAnchor="end">第 {breachDay} 天跌破</text>
      </g>}
      {marks.map((mark) => <g key={mark.day} className={styles.stockMark}>
        <circle cx={x(mark.day)} cy={y(carried[mark.day])} r="2.4" />
        <text x={x(mark.day)} y={y(carried[mark.day]) - 8} textAnchor="middle">{mark.text}</text>
      </g>)}
      {[0, 7, 14].map((day) => <text key={day} className={styles.stockTick} x={x(day)} y={144} textAnchor="middle">第 {day} 天</text>)}
    </svg>
    <figcaption className={styles.legend}><span data-line="carried">交给 AutoMage</span><span data-line="alone">不处理</span></figcaption>
  </figure>;
}

function Library({ library }: { library: ReturnType<typeof libraryOf> }) {
  return <div className={styles.library}>
    <p className={styles.libraryTotal}><b>{library.groups}</b> 类工作<span>·</span><b>{library.skills}</b> 个 Skill</p>
    <ul className={styles.areas}>{library.areas.map((area) => <li key={area.title}>{area.title}<b>{area.count}</b></li>)}</ul>
    <ul className={styles.examples}>{library.examples.map((title) => <li key={title}>{title}</li>)}</ul>
  </div>;
}

function Faq() {
  return <section className={styles.faq} aria-labelledby="faq-title">
    <div className={styles.wrap}>
      <div className={styles.faqHead}><p className={styles.kicker}>常见问题</p><h2 id="faq-title">关于 AutoMage，你可能想知道的</h2></div>
      <div className={styles.faqList}>{FAQ.map((item, i) => <details key={item.q} open={i === 0}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>
    </div>
  </section>;
}

function Closing() {
  return <section className={styles.closing} aria-labelledby="closing-title">
    <div className={styles.wrap}>
      <h2 id="closing-title">{CLOSING.title}</h2>
      <p>{CLOSING.text}</p>
      <div className={styles.closingActions}>
        <Link className={styles.primary} href="/contact">{CLOSING.primary}<ArrowRight size={18} aria-hidden="true" /></Link>
        <Link className={styles.secondary} href="/market">{CLOSING.secondary}</Link>
      </div>
    </div>
  </section>;
}

function ActHead({ act, id }: { act: { kicker: string; title: string; text: string }; id: string }) {
  return <header className={styles.actHead}>
    <div><p className={styles.kicker}>{act.kicker}</p><h2 id={id}>{act.title}</h2></div>
    <p className={styles.actText}>{act.text}</p>
  </header>;
}
