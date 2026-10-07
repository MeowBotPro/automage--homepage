import styles from "@/components/homepage-vnext/HomepageJourney.module.css";

const VALUES = [
  {
    title: "事件持续存在",
    body: "事件拥有身份、时间、上下文与状态。切换模型、工具或参与者，不会丢掉正在解决的问题。",
    visual: (
      <svg viewBox="0 0 260 100" aria-hidden="true">
        <path d="M18 50H242" stroke="#204d74" />
        <circle cx="48" cy="50" r="12" fill="#0d3354" stroke="#38bdf8" />
        <circle cx="130" cy="50" r="17" fill="#12476f" stroke="#52cdf0" />
        <circle cx="214" cy="50" r="12" fill="#0d3354" stroke="#3b82f6" />
        <path d="M61 50H112M148 50H201" stroke="#67d7f4" strokeDasharray="4 5" />
      </svg>
    ),
  },
  {
    title: "能力按需调用",
    body: "不是让 Agent 彼此对话，而是让调拨、采购、财务与审阅能力围绕同一事件按需参与。",
    visual: (
      <svg viewBox="0 0 260 100" aria-hidden="true">
        <circle cx="130" cy="50" r="20" fill="#123f63" stroke="#55d3f2" />
        {[32, 84, 176, 228].map((x) => <circle cx={x} cy="50" r="9" fill="#0a2037" stroke="#3b82f6" key={x} />)}
        <path d="M41 50H110M150 50H219" stroke="#428bd7" strokeDasharray="3 4" />
      </svg>
    ),
  },
  {
    title: "结果带回证据",
    body: "授权、执行和结果分别记录。成功、失败、超时与人工接管都有可追溯的回执。",
    visual: (
      <svg viewBox="0 0 260 100" aria-hidden="true">
        <rect x="56" y="18" width="148" height="64" rx="8" fill="#0a243d" stroke="#377bb7" />
        <path d="M76 39H181M76 52H165M76 65H142" stroke="#4ccbf0" strokeLinecap="round" />
        <circle cx="190" cy="66" r="14" fill="#135276" stroke="#6de0f8" />
        <path d="m184 66 4 4 8-9" fill="none" stroke="#dffbff" strokeWidth="2" />
      </svg>
    ),
  },
];

export default function ValueCardsSection() {
  return (
    <section className={styles.section} id="section-value" aria-labelledby="value-title">
      <header className={styles.sectionHeader}>
        <div className={styles.kicker}>05 / Core Transfer</div>
        <h2 className={styles.sectionTitle} id="value-title">供应链只是一个实例，背后是 AutoMage Core</h2>
        <p className={styles.sectionLead}>
          同一套事件、能力、授权与证据模型，可以迁移到运营、客户成功、财务异常和其他跨系统工作。
        </p>
      </header>

      <div className={styles.coreGrid}>
        {VALUES.map((value, index) => (
          <article className={styles.coreCard} key={value.title}>
            <span className={styles.cardIndex}>CORE / 0{index + 1}</span>
            <div className={styles.coreVisual}>{value.visual}</div>
            <h3>{value.title}</h3>
            <p>{value.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
