import Link from "next/link";
import type { Metadata } from "next";
import MarketChrome, { MarketFooter } from "@/components/market/MarketChrome";
import SupplyChainWorld from "@/components/supply-chain/SupplyChainWorld";
import shared from "@/components/market/MarketPage.module.css";
import styles from "@/components/supply-chain/SupplyChain.module.css";

export const metadata: Metadata = {
  title: "AI+供应链：一项缺料风险的 14 天 · AutoMage",
  description: "跟着一项交给 AutoMage 的缺料风险走完 14 天：签批方案、前提失效后的重新打开、拆开看三层，以及改一条委托规矩后的重放。场景基于真实企业业务重构，数据为示例。",
};

export default function SupplyChainScenarioPage() {
  return (
    <div className={shared.page}>
      <MarketChrome active="scenario" />
      <main>
        <header className={styles.intro}>
          <p className={styles.introMeta}>
            <span className={styles.evidenceTag}>示例</span>
            AI+供应链 · 场景基于真实企业业务重构，数据为示例
          </p>
          <h1 className={styles.introTitle}>一项缺料风险，交给 AutoMage 之后的 14 天</h1>
          <div className={styles.introBody}>
            <p className={styles.introLead}>
              {"AutoMage 能接手企业里的具体工作；它能自己做到哪、什么时候必须回来找人，由企业规定。"}
              {"这家华东工厂把一项缺料风险交给了它：PA66 树脂预计第 12 天跌破安全库存。"}
              <strong>你是供应链负责人</strong>，需要拍板时，它会回到你面前。
            </p>
            <p className={styles.introEvidence}>
              <span><b>在这一页，你可以亲手操作：</b>{"签批方案；第 6 天条件变了，重新决定；拆开看三层；改一条委托规矩，重放后比较两次的结果。"}</span>
              <span>
                <b>放到你们公司：</b>{"接入哪些系统、委托怎么写、哪一步回来找谁，部署时按你们的情况配置。"}
                <a className={styles.introLink} href="#about-demo">关于这个场景</a>
              </span>
            </p>
          </div>
        </header>

        <SupplyChainWorld />

        <section className={styles.bridge} aria-labelledby="bridge-title">
          <div>
            <h2 id="bridge-title">换一件事，还成立吗？</h2>
            <p>缺料只是其中一件。换成你们公司的另一项工作，要回答的还是这三个问题：交给它什么，它能自己做到哪，什么时候必须回来找人。</p>
          </div>
          <div className={styles.bridgeLinks}>
            <Link href="/market">看还有哪些工作能交给它 <span aria-hidden="true">→</span></Link>
            <Link href="/contact">带一件你们的事来聊</Link>
          </div>
        </section>

        <section className={styles.evidence} id="about-demo" aria-labelledby="evidence-title">
          <h2 id="evidence-title">关于这个场景</h2>
          <div className={styles.evidenceGrid}>
            <div>
              <strong>示例数据</strong>
              <p>页面里的公司、人物、消息和数字都是示例：场景基于一家制造企业的真实业务情况重构，企业身份和数据已替换。</p>
            </div>
            <div>
              <strong>只在这一页里发生</strong>
              <p>你在这里签批、推演、重放，都不连接任何系统，也不会触发真实采购。</p>
            </div>
            <div>
              <strong>放到你们公司</strong>
              <p>接入哪些系统、委托怎么写、哪一步回来找谁，按你们的情况配置，之后也可以调整。</p>
            </div>
            <div>
              <strong>从一件事开始</strong>
              <p>带一件你们最近卡住的事来，我们一起看它交给 AutoMage 之后怎么走。<Link className={styles.introLink} href="/contact">预约演示</Link></p>
            </div>
          </div>
        </section>
      </main>
      <MarketFooter />
    </div>
  );
}
