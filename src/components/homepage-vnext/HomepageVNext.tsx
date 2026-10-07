import Image from 'next/image';
import { CORE_PRIMITIVES, MANUAL_CHAIN, MATURITY, SCENARIO } from '../../lib/homepage-vnext';
import ScenarioWorkbench from './ScenarioWorkbench';
import styles from './HomepageVNext.module.css';

const validationQuestions = [
  '什么业务事件最容易失控？', '它现在散落在哪些系统？', '哪些角色正在反复协调？',
  '哪个动作必须由人批准？', '什么结果才算真正改善？', '现阶段只读接入能否产生价值？',
];

function ActMark({ number, label }: { number: string; label: string }) {
  return <div className={styles.actMark} aria-hidden="true"><span>{number}</span><span>{label}</span></div>;
}

export default function HomepageVNext() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">跳到主要内容</a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.brand} href="#top" aria-label="AutoMage 首页顶部">
            <Image className={styles.wordmark} src="/automage-logo-wordmark-white-2.svg" width={174} height={32} alt="AutoMage" priority />
            <span className={styles.brandDefinition}>AI 协作与执行层</span>
          </a>
          <nav className={styles.nav} aria-label="页面章节">
            <a href="#incident">事件</a><a href="#explore">协作机制</a><a href="#gate">授权边界</a><a href="#core">系统边界</a>
          </nav>
          <a className={styles.headerCta} href="#bring-event">带一条事件来验证</a>
        </div>
      </header>

      <main id="main-content">
        <section className={styles.hero} id="top" aria-labelledby="hero-title">
          <div className={styles.heroAtmosphere} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}><span>供应链参考实现</span><span className={styles.demoTag}>DEMO · 不连接真实系统</span></p>
              <h1 className={styles.heroTitle} id="hero-title">一条缺料预警，<br />如何成为一项<br /><em>可执行的决定。</em></h1>
              <p className={styles.heroLead}>AutoMage 接住业务事件，补齐可检查的上下文，组织有界专业能力形成方案，并在授权包络内推进执行与结果追踪。</p>
              <div className={styles.heroActions}>
                <a className={styles.primaryLink} href="#incident">跟随这条事件 <span aria-hidden="true">↓</span></a>
                <a className={styles.textLink} href="#core">先看系统边界</a>
              </div>
            </div>

            <article className={styles.eventLedger} aria-label="供应链演示事件">
              <div className={styles.ledgerTopline}>
                <div><span className={styles.dataLabel}>EVENT DOSSIER</span><strong>{SCENARIO.id}</strong></div>
                <span className={styles.modeStamp}>DEMO</span>
              </div>
              <div className={styles.sourceLine}><span className={styles.sourceDot} aria-hidden="true" /><span>{SCENARIO.source}</span><span>{SCENARIO.capturedAt}</span></div>
              <div className={styles.eventStatement}>
                <span className={styles.warningIndex}>01</span>
                <div><p>库存风险</p><h2>{SCENARIO.statement}</h2></div>
              </div>
              <div className={styles.eventMetrics}>
                <div><span>风险窗口</span><strong>12 天</strong></div><div><span>关联订单</span><strong>3 个</strong></div><div><span>候选需求</span><strong>85 吨</strong></div>
              </div>
              <div className={styles.contextProgress}>
                <div className={styles.progressHeader}><span>AutoMage 正在接住事件</span><span>4 / 4 演示上下文</span></div>
                <div className={styles.progressTrack} aria-hidden="true"><span /></div>
                <ul><li>订单影响已关联</li><li>库存快照已读取</li><li>供应商交期已聚合</li><li>价格趋势为推断示例</li></ul>
              </div>
              <div className={styles.gatePreview}><span>当前状态</span><strong>等待采购负责人审查方案</strong><small>尚未授权 · 尚未执行 · 结果未验证</small></div>
            </article>
          </div>
          <div className={styles.heroFootnote}><span>SCROLL TO FOLLOW THE EVENT</span><span>事实 ≠ 推断 ≠ 授权 ≠ 执行 ≠ 结果</span></div>
        </section>

        <section className={styles.burdenSection} id="incident" aria-labelledby="burden-title">
          <div className={styles.sectionShell}>
            <ActMark number="01—02" label="INCIDENT / HIDDEN LABOUR" />
            <div className={styles.sectionHeadingRow}>
              <div><p className={styles.eyebrow}>同一条事件，在 AutoMage 接住之前</p><h2 id="burden-title">真正耗时的不是做决定。<br />是把决定需要的事实找齐。</h2></div>
              <p className={styles.headingNote}>AutoMage 不替代采购负责人。它接管散落在系统、角色和时间里的信息搬运、缺口追问、方案准备与闭环追踪。</p>
            </div>
            <div className={styles.manualChain}>
              <div className={styles.chainHeader}><span>责任角色</span><span>这条事件仍缺什么</span><span>事实散落位置</span></div>
              {MANUAL_CHAIN.map((item, index) => <div className={styles.chainRow} key={item.role}><span className={styles.chainIndex}>{String(index + 1).padStart(2, '0')}</span><strong>{item.role}</strong><p>{item.question}</p><span>{item.source}</span></div>)}
            </div>
            <div className={styles.chainResolution}><span>过去</span><p>截图 → 群内追问 → 跨部门确认 → 开会 → 手工建单 → 继续催办</p><span className={styles.resolutionArrow} aria-hidden="true">→</span><span>现在</span><p>一个事件 → 一个持续上下文 → 一个明确责任点</p></div>
          </div>
        </section>

        <ScenarioWorkbench />

        <section className={styles.coreSection} id="core" aria-labelledby="core-title">
          <div className={styles.sectionShell}>
            <ActMark number="06" label="PULLBACK / TRANSFER" />
            <div className={styles.coreIntro}>
              <div><p className={styles.eyebrow}>刚才看到的不是一套写死的采购流程</p><h2 id="core-title">它是 AutoMage Core 正在负责的一条业务事件。</h2></div>
              <p>供应链让机制变得可见，但不是能力边界。同一个 Core 可以接住交付异常、质量事件、项目阻塞、客户升级或任何需要跨系统协同并对结果负责的业务事件。</p>
            </div>
            <div className={styles.coreRail} aria-label="AutoMage Core 处理原语">
              {CORE_PRIMITIVES.map(([name, description], index) => <div className={styles.corePrimitive} key={name}><span>{String(index + 1).padStart(2, '0')}</span><strong>{name}</strong><p>{description}</p></div>)}
            </div>
            <div className={styles.boundaryGrid}>
              <div className={styles.integrationMap}>
                <p className={styles.panelKicker}>LOW-INTRUSION INTEGRATION</p><h3>先读取现实，再请求改变现实。</h3>
                <div className={styles.integrationFlow}>
                  <div><span>现有系统</span><strong>ERP / WMS / MES / IM / Excel</strong><small>只读快照、API、Webhook 或文件</small></div><span aria-hidden="true">↓</span>
                  <div className={styles.integrationCore}><span>AutoMage Core</span><strong>事件 · 上下文 · 编排 · 权限 · 证据</strong><small>Explore 可自治，Commit 受授权包络约束</small></div><span aria-hidden="true">↓</span>
                  <div><span>现实动作</span><strong>人类确认 / 任务 / API / RPA</strong><small>没有匹配授权时保持锁定</small></div>
                </div>
              </div>
              <div className={styles.maturityPanel}>
                <p className={styles.panelKicker}>CAPABILITY STATUS ON THIS PAGE</p><h3>路线图不是完成时。</h3>
                <div className={styles.maturityRows}>{MATURITY.map((item) => <div className={styles.maturityRow} key={item.layer}><strong>{item.layer}</strong><span>{item.state}</span><p>{item.description}</p></div>)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection} id="bring-event" aria-labelledby="cta-title">
          <div className={styles.ctaGlow} aria-hidden="true" />
          <div className={styles.sectionShell}>
            <p className={styles.eyebrow}>BRING ONE REAL EVENT</p><h2 id="cta-title">不从“你需要什么 AI 功能”开始。<br />从一条正在失控的业务事件开始。</h2>
            <p className={styles.ctaLead}>一条事件足以定义触发点、协作负担、授权边界和可验证结果，也足以判断 AutoMage 是否值得进入下一步。</p>
            <details className={styles.worksheet}><summary>打开事件验证清单 <span aria-hidden="true">＋</span></summary><ol>{validationQuestions.map((question) => <li key={question}>{question}</li>)}</ol><p>本页面不采集、不保存、不发送任何数据。这是一份本地设计候选中的验证清单。</p></details>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <Image className={styles.footerLogo} src="/automage-logo-wordmark-white-2.svg" width={150} height={28} alt="AutoMage" />
        <p>一个事件，一个控制者；多种能力按需调用；事实、判断、授权与执行彼此分离。</p><span>SUPPLY CHAIN REFERENCE IMPLEMENTATION · DEMO</span>
      </footer>
    </div>
  );
}
