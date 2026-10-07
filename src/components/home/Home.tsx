import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MarketChrome, { MarketFooter } from "@/components/market/MarketChrome";
import shared from "@/components/market/MarketPage.module.css";
import HomeStage from "./HomeStage";
import styles from "./Home.module.css";

/* What the case on the stage stands for. The four marks echo the stage: scattered messages, chasing
   people, a step that comes back to a person, a change midway. */
const FIT = [
  ["散在几处", "信息分在几个系统、几个群、几个人手里，没有一处看得到全貌。"],
  ["要有人追着问", "得有人去问、去等、去核对，才拼得起来，拼完还要一路跟着。"],
  ["有几步必须人定", "花钱、改交期、对客户或供应商的承诺，要回到人手上。"],
  ["中途会变", "供应商、客户、库存随时会变，原来的打算可能不再成立。"],
] as const;

const NOW = [
  ["real", "已经能用", "在飞书里收集团队日报，整理成带出处的汇总，给出两个可选方案；人拍板后，把任务派给具体的人。"],
  ["direction", "产品方向", "直接读取库存、采购等业务系统，按企业定的委托边界判断自己办还是回来找人，就是上面第二部分演示的。"],
  ["demo", "演示", "缺料这件事基于一家制造企业的真实情况重构；数据、人物、消息和过程都是演示，不连接任何真实系统。"],
] as const;

export default function Home() {
  return <div className={shared.page}><MarketChrome active="home" /><main className={styles.main}>
    <HomeStage />

    <div className={styles.after}>
      <section className={styles.fit} aria-labelledby="fit-title">
        <div>
          <p className={styles.bridge}>缺料只是其中一件。你们手上的事，如果也是这样：</p>
          <h2 id="fit-title">什么样的工作，适合交给 AutoMage</h2>
        </div>
        <ul className={styles.fitList}>{FIT.map(([name, text]) => <li key={name}><b>{name}</b>{text}</li>)}</ul>
      </section>

      <section className={styles.now} aria-labelledby="now-title">
        <h2 id="now-title">现在做到哪里</h2>
        <dl>{NOW.map(([kind, name, text]) => <div key={kind}><dt data-kind={kind}>{name}</dt><dd>{text}</dd></div>)}</dl>
      </section>

      <nav className={styles.exits} aria-label="接下来">
        <Link className={styles.door} href="/scenarios/supply-chain">
          <span>场景 · 可以亲手操作</span>
          <strong>看这件事完整的 14 天 <ArrowRight size={26} aria-hidden="true" /></strong>
          <p>签批方案、条件变了重新决定、自己改一条规矩再重放，比较两次的结果。</p>
        </Link>
        <Link className={styles.door} href="/contact">
          <span>联系</span>
          <strong>说一件你们自己的事 <ArrowRight size={26} aria-hidden="true" /></strong>
          <p>带一件最近卡住的事来：它散在哪、谁在追、哪一步必须由人拍板。一起看它能不能这样交出去。</p>
        </Link>
      </nav>
    </div>
  </main><MarketFooter /></div>;
}
