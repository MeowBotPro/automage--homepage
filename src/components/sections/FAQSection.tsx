"use client";

import { useState } from "react";
import styles from "@/components/homepage-vnext/HomepageJourney.module.css";

const FAQS = [
  {
    question: "AutoMage 到底是什么？",
    answer: "它是 AI 协作与执行层：接住业务事件，组织上下文与能力，生成可审阅提案，并在授权后记录执行与结果证据。",
  },
  {
    question: "它是一套供应链软件吗？",
    answer: "不是。供应链缺料是本页用来讲清机制的参考场景。相同的事件、授权与回执模型可用于其他跨系统运营问题。",
  },
  {
    question: "它会替代 ERP、WMS 或现有工作流吗？",
    answer: "定位上不会。系统记录仍留在原有业务系统中；AutoMage 负责跨系统协调和决策过程，并通过受控适配器衔接执行。",
  },
  {
    question: "页面里的执行和结果是真实的吗？",
    answer: "不是。本页全部为交互式 Demo，没有连接真实 ERP、WMS、供应商或采购系统。所有执行与回执状态均为前端模拟。",
  },
];

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(() => new Set([0]));

  const toggleItem = (index: number) => {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <section className={styles.section} id="section-faq" aria-labelledby="faq-title">
      <header className={styles.sectionHeader}>
        <div className={styles.kicker}>System Boundary</div>
        <h2 className={styles.sectionTitle} id="faq-title">系统边界说明</h2>
        <p className={styles.sectionLead}>把最容易产生误解的四件事直接说清楚。</p>
      </header>

      <div className={styles.faqList}>
        {FAQS.map((item, index) => {
          const isOpen = openItems.has(index);
          const panelId = `faq-answer-${index}`;
          return (
            <article className={styles.faqItem} data-open={isOpen} key={item.question}>
              <button
                className={styles.faqQuestion}
                type="button"
                aria-controls={panelId}
                aria-expanded={isOpen}
                onClick={() => toggleItem(index)}
              >
                <span>{item.question}</span>
                <span className={styles.faqToggle} aria-hidden="true">+</span>
              </button>
              <div className={styles.faqReveal} id={panelId} aria-hidden={!isOpen}>
                <div className={styles.faqRevealInner}>
                  <div className={styles.faqAnswer}>{item.answer}</div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
