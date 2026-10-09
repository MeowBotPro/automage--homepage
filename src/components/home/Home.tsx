import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MarketChrome, { MarketFooter } from "@/components/market/MarketChrome";
import shared from "@/components/market/MarketPage.module.css";
import HomeStage from "./HomeStage";
import styles from "./Home.module.css";

/* What the week on the stage stands for, in any trade. The four marks echo the stage: state kept in
   heads and chats, people passing it on and chasing it, a step that needs a person, a change midway. */
const FIT = [
  ["散在几处", "进展分在几个系统、几个群、几个人的脑子里，没有一处看得到全貌。"],
  ["要有人一直记着", "得有人记着、去问、去传、去催，事情才往前走；那个人一忙，就停了。"],
  ["有几步必须人定", "花钱、改交期、对客户或供应商松口，要回到该定的人手上。"],
  ["中途会变", "客户、供应商、库存随时会变，原来的打算可能不再成立。"],
] as const;

export default function Home() {
  return <div className={shared.page}><MarketChrome active="home" /><main className={styles.main}>
    <HomeStage />

    <div className={styles.after}>
      <section className={styles.fit} aria-labelledby="fit-title">
        <div>
          <p className={styles.bridge}>不分行业。你们那里如果也有这样的事：</p>
          <h2 id="fit-title">什么样的工作，适合用 AutoMage</h2>
        </div>
        <ul className={styles.fitList}>{FIT.map(([name, text]) => <li key={name}><b>{name}</b>{text}</li>)}</ul>
      </section>

      <nav className={styles.exits} aria-label="接下来">
        <Link className={styles.door} href="/scenarios/supply-chain">
          <span>AI+供应链 · 可以亲手操作</span>
          <strong>一项缺料风险的 14 天 <ArrowRight size={26} aria-hidden="true" /></strong>
          <p>供应链里的一件事从头到尾：签批方案，条件变了重新决定，自己改一条规矩再重放，比较两次的结果。</p>
        </Link>
        <Link className={styles.door} href="/contact">
          <span>预约演示</span>
          <strong>说一件你们自己的事 <ArrowRight size={26} aria-hidden="true" /></strong>
          <p>带一件最近卡住的事来：进展在谁那里、谁在追、哪一步必须由人拍板。我们按你们的系统和规矩，把它交给 AutoMage。</p>
        </Link>
      </nav>
    </div>
  </main><MarketFooter /></div>;
}
