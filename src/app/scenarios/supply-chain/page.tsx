import Link from "next/link";
import type { Metadata } from "next";
import MarketChrome, { MarketFooter } from "@/components/market/MarketChrome";
import SupplyChainWorld from "@/components/supply-chain/SupplyChainWorld";
import shared from "@/components/market/MarketPage.module.css";
import styles from "@/components/supply-chain/SupplyChain.module.css";

export const metadata: Metadata = {
  title: "供应链场景：一项缺料风险的 14 天 · AutoMage",
  description: "跟着一项交给 AutoMage 的缺料风险走完 14 天：签批方案、前提失效后的重新打开、拆开看三层，以及改一条委托规矩后的重放。基于真实企业业务场景重构的演示。",
};

export default function SupplyChainScenarioPage() {
  return (
    <div className={shared.page}>
      <MarketChrome active="scenario" />
      <main>
        <header className={styles.intro}>
          <p className={styles.introMeta}>
            <span className={styles.evidenceTag}>演示</span>
            场景 · 供应链 · 基于真实企业业务场景重构，页面数据与过程为演示
          </p>
          <h1 className={styles.introTitle}>一项缺料风险，交给 AutoMage 之后的 14 天</h1>
          <div className={styles.introBody}>
            <p className={styles.introLead}>
              {"AutoMage 能接手企业里的具体工作；它能自己做到哪、什么时候必须回来找人，由企业规定。"}
              {"这家华东工厂把一项缺料风险交给了它：PA66 树脂预计第 12 天跌破安全库存。"}
              <strong>你是供应链负责人</strong>，需要拍板时，它会回到你面前。
            </p>
            <p className={styles.introEvidence}>
              <span><b>现在已经能用：</b>{"在飞书里收集团队日报，整理成带出处的汇总，给出两个可选方案，你拍板后把任务派给具体的人。"}</span>
              <span>
                <b>产品方向（本页是模拟，还不能用）：</b>{"直接连接库存、采购等业务系统；按你们定的规矩，判断自己处理还是回来找你。"}
                <a className={styles.introLink} href="#about-demo">详细说明</a>
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
          <h2 id="evidence-title">关于这个演示</h2>
          <div className={styles.evidenceGrid}>
            <div>
              <strong>演示</strong>
              <p>页面里的数据、人物、消息和过程都是演示，不连接任何真实系统，也不会触发采购。</p>
            </div>
            <div>
              <strong>真实背景</strong>
              <p>场景基于一家制造企业的真实业务情况重构；企业身份和真实数据没有公开。</p>
            </div>
            <div>
              <strong>已实现</strong>
              <p>AutoMage 当前产品已能在飞书中收集团队日报，生成带来源的汇总，给出 A/B 决策选项，记录决定后生成任务并分派到人。</p>
            </div>
            <div>
              <strong>方向 · 模拟</strong>
              <p>直接连接 WMS、ERP 等业务系统，按企业设定的委托规则判断「自己处理还是回来找人」，以及本页的「改规矩重放」，属于产品方向，这里是模拟。</p>
            </div>
          </div>
        </section>
      </main>
      <MarketFooter />
    </div>
  );
}
