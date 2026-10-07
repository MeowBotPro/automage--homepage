import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import MarketChrome, { MarketFooter } from "@/components/market/MarketChrome";
import WorkScene from "./WorkScene";
import SystemOverview from "./SystemOverview";
import shared from "@/components/market/MarketPage.module.css";
import styles from "./SystemHome.module.css";

const CAPABILITY_EXAMPLES = [
  ["分析与判断", "客户流失复盘", "把一次客户离开的经过，整理成原因、证据与改进动作。", "churn-autopsy"],
  ["查询与比较", "1688 找货比价", "从商品描述、图片或链接，形成可以继续核对的候选对照。", "1688-product-find"],
  ["创作与交付", "短视频口播脚本", "把长文和产品资料，整理成口播、分镜和发布文案。", "short-video-script-skill"],
] as const;

export default function SystemHome() {
  return <div className={shared.page}><MarketChrome active="home" /><main className={styles.main}>
    <section className={styles.productHero}>
      <div className={styles.heroCopy}><p className={shared.kicker}>AutoMage / Organizational AI</p><h1>组织的 AI<br /><span>协作与执行层。</span></h1><p className={styles.lead}>AutoMage 连接团队已有的沟通与业务系统，把分散的信息组织成可判断、可推进、可回溯的工作。</p><div className={styles.actions}><Link className={shared.primary} href="/scenarios/supply-chain">看它如何工作 <ArrowUpRight size={16} /></Link><Link className={shared.textLink} href="/market">浏览能力 <ArrowRight size={15} /></Link></div><p className={styles.heroNote}>当前公开展示：系统机制、场景案例与 Skill 能力。</p></div>
      <SystemOverview />
    </section>
    <section className={styles.modelSection} aria-labelledby="model-title"><div className={styles.sectionIntro}><p className={shared.kicker}>How AutoMage works</p><h2 id="model-title">让一件工作，<br />拥有完整的上下文。</h2><p>信息从熟悉的入口进入，系统负责整理和推进；涉及判断与责任时，人仍然在场。</p></div><div className={styles.modelList}>{[["01", "接住信号", "消息、资料和业务异常进入同一件工作。"], ["02", "形成判断", "上下文、未知项和选项被组织成可讨论的结果。"], ["03", "留下反馈", "下一步、责任和执行结果回到工作记录。"]].map(([n, title, copy]) => <div key={n} className={styles.modelRow}><span>{n}</span><div><strong>{title}</strong><p>{copy}</p></div><ArrowRight size={15} /></div>)}</div></section>
    <section className={styles.workSection} aria-labelledby="work-title"><div className={styles.sectionHeader}><div><p className={shared.kicker}>A work object</p><h2 id="work-title">系统如何参与一件工作</h2></div><p>下面是一条询盘的示意。<br />它展示工作如何被接手、整理和继续推进。</p></div><WorkScene /></section>
    <section className={styles.scenario} aria-labelledby="scenario-title"><div><p className={shared.kicker}>Reference scenario · 供应链演示</p><h2 id="scenario-title">一条缺料预警，<br />如何成为可执行的决定。</h2><p>从库存与交期信息，到方案比较、人的授权，再到执行与回执。跟随同一件事，体验 AutoMage 的协作方式。</p><Link className={shared.primary} href="/scenarios/supply-chain">进入交互演示 <ArrowUpRight size={16} /></Link></div><div className={styles.scenarioTrace}><div><span>事件进入</span><strong>材料补给出现缺口</strong></div><ArrowRight size={16} /><div><span>方案比较</span><strong>跨仓调拨 / 供应商加急</strong></div><ArrowRight size={16} /><div><span>人参与判断</span><strong>采购负责人确认条件</strong></div><p>模拟资料与执行过程 · 用于说明系统机制</p></div></section>
    <section className={styles.capabilities} aria-labelledby="capabilities-title"><div className={styles.sectionHeader}><div><p className={shared.kicker}>Current capabilities</p><h2 id="capabilities-title">同一套系统，<br />可以接住不同的工作。</h2></div><p>Skill 是当前已经能公开展示的扩展形态。<br />从工作出发选择，而不是从技术名词开始。</p></div><div className={styles.capabilityList}>{CAPABILITY_EXAMPLES.map(([tag, title, copy, id], index) => <Link className={styles.capabilityRow} href={`/market/${id}?returnTo=/#capabilities`} key={id}><span className={styles.capabilityIndex}>0{index + 1}</span><span className={styles.capabilityTag}>{tag}</span><span className={styles.capabilityTitle}>{title}</span><span className={styles.capabilityCopy}>{copy}</span><ArrowUpRight size={16} /></Link>)}</div><Link className={shared.textLink} href="/market" style={{ marginTop: 27 }}>进入能力库，查看全部公开 Skill <ArrowRight size={15} /></Link></section>
    <section className={styles.roles} aria-labelledby="roles-title"><div className={styles.sectionHeader}><div><p className={shared.kicker}>One system, familiar places</p><h2 id="roles-title">在熟悉的入口，<br />共同推进一件工作。</h2></div><p>日常协作、组织配置与接入维护各有职责。<br />一个人也可以承担多种角色。</p></div><div className={styles.roleGrid}>{[["业务负责人", "看需要判断的事项，决定目标与授权范围。", "业务判断"], ["团队成员", "在沟通与业务入口补充事实、处理工作、反馈结果。", "日常协作"], ["系统维护者", "按组织需要准备连接、权限和运行环境。", "接入与运行"]].map(([title, copy, tag]) => <div key={title}><span>{tag}</span><h3>{title}</h3><p>{copy}</p></div>)}</div></section>
    <section id="section-beta" className={styles.contact}><p className={shared.kicker}>Bring your next question</p><h2>从你正在处理的一件事开始。</h2><p>带来业务问题，或带上几项感兴趣的 Skill。<br />一起确认适合从哪里开始。</p><Link className={shared.primary} href="/contact">与我们聊聊 <ArrowUpRight size={16} /></Link></section>
  </main><MarketFooter /></div>;
}
