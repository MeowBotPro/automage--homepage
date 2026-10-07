import type { CSSProperties, ReactNode } from "react";
import SourceTag from "@/components/supply-chain/SourceTag";
import { BROKEN, CHANGE, GOT, INTACT, KNOWN, LANDING, NEXT_SOURCE, PLAN_A, PLAN_SIGNED, UNKNOWN, WORK, type Line } from "@/lib/home-stage";
import styles from "./Home.module.css";

const KIND = { fact: "事实", inference: "测算", unknown: "还不知道" } as const;

/** `data-land` marks where a message lands; `--i` orders the landings top to bottom. */
const land = (id: string) => ({ "data-land": id, style: { "--i": LANDING.indexOf(id) } as CSSProperties });

function Row({ line }: { line: Line }) {
  return <li className={styles.objRow} data-kind={line.kind} {...land(line.id)}>
    <span className={styles.objKind}>{KIND[line.kind]}</span>
    <span className={styles.objText}><b>{line.label}</b>{line.value}<SourceTag source={line.source} /></span>
  </li>;
}

function Meta({ children }: { children: ReactNode }) {
  return <p className={styles.objMeta}><span className={styles.mono}>{WORK.id}</span><span>{WORK.site}</span><span className={styles.objDemo}>演示</span>{children}</p>;
}

/* The same work as /scenarios/supply-chain. First as the messages make it: what is known, estimated and
   not yet known, each with its source, and the next step. On the stage the status arrives last: from
   then on the work is AutoMage's to follow. */
export function WorkCard({ still = false }: { still?: boolean }) {
  return <article className={styles.obj} data-card="work" data-still={still || undefined} aria-label={`工作单 ${WORK.id}（演示）`}>
    <header className={styles.objHead}>
      <Meta><span className={styles.objStatus} data-tone="ai" data-taken>AutoMage 跟进中</span></Meta>
      <div {...land("head")}>
        <h3>{WORK.title}</h3>
        <p className={styles.objGoal}>WMS 预警进来，AutoMage 按委托接手，跟进到风险解除。目标：守住安全库存，订单 C 不延期。</p>
      </div>
    </header>
    <ul className={styles.objRows}>{KNOWN.map((line) => <Row key={line.id} line={line} />)}<Row line={UNKNOWN} /></ul>
    <p className={styles.objNext} {...land("next")}><span>下一步</span>整理两个补料办法，按委托交<b>供应链负责人</b>定。<SourceTag source={NEXT_SOURCE} /></p>
  </article>;
}

/* Later, while plan A is being carried out: the record folds to the plan and the premise the change
   breaks. On the stage the change lands on that premise; a still frame shows it already broken. */
export function ChangedCard({ still = false }: { still?: boolean }) {
  return <article className={styles.obj} data-card="changed" data-still={still || undefined} aria-label={`工作单 ${WORK.id}（演示）：执行中出现变化`}>
    <header className={styles.objHead}>
      <Meta>
        <span className={styles.swap}>
          {!still && <span className={styles.objStatus} data-tone="ai" data-before>执行中 · 方案 A</span>}
          <span className={styles.objStatus} data-tone="risk" data-after>前提变了</span>
        </span>
      </Meta>
      <h3>{WORK.title}</h3>
    </header>
    <p className={styles.objPlan}><span>执行中</span><b>{PLAN_A.name}</b>{PLAN_A.plan}<SourceTag source={PLAN_SIGNED} /></p>
    <div className={styles.objRow} data-kind="premise">
      <span className={`${styles.objKind} ${styles.swap}`}>
        {!still && <span data-before>前提</span>}
        <span data-after>不再成立</span>
      </span>
      <span className={styles.objText}>
        <span className={styles.strike}>{BROKEN.text}</span><SourceTag source={BROKEN.source} />
        <em data-land="change">只能交 {GOT}t<SourceTag source={CHANGE.source} /></em>
      </span>
    </div>
    <p className={styles.objFolded}>另外 {INTACT} 条前提仍然成立。</p>
  </article>;
}
