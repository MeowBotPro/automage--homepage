"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/components/homepage-vnext/HomepageJourney.module.css";

const FLOW = ["Event", "Context", "Explore", "Human Gate"];

export default function HeroSection() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timers = FLOW.slice(1).map((_, index) =>
      window.setTimeout(() => setActiveStep(index + 1), 620 + index * 520),
    );

    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <section className={styles.hero} id="section-hero" aria-labelledby="hero-title">
      <div className={styles.heroCopy}>
        <div className={styles.eyebrow}>场景演示 · 供应链协作 · 模拟资料</div>
        <h1 className={styles.heroTitle} id="hero-title">
          让一条缺料预警
          <span>成为可执行的决定</span>
        </h1>
        <p className={styles.heroLead}>
          跟随一条缺料预警，查看散落的信息如何成为可比较的方案，再由采购负责人确认条件，推进执行与回执。
        </p>
        <div className={styles.heroActions}>
          <a className={styles.primaryButton} href="#section-compare">
            跟随这条事件 <span aria-hidden="true">↓</span>
          </a>
          <Link className={styles.secondaryButton} href="/">
            了解 AutoMage
          </Link>
        </div>
        <p className={styles.heroNote}>演示数据 · 不连接真实系统 · 不代表已执行任何采购动作</p>
      </div>

      <div className={styles.console} aria-label="缺料事件演示控制台">
        <div className={styles.consoleBar}>
          <span>AUTOMAGE / EVENT TRACE</span>
          <span className={styles.consoleDots} aria-hidden="true"><i /><i /><i /></span>
        </div>
        <div className={styles.consoleBody}>
          <div className={styles.consoleTags}>
            <span className={`${styles.tag} ${styles.tagStrong}`}>WMS · DEMO</span>
            <span className={styles.tag}>12 天后缺料</span>
            <span className={styles.tag}>等待采购负责人</span>
          </div>

          <div className={styles.signalPanel}>
            <div className={styles.signalHead}>
              <span className={styles.signalSource}>EVENT / MATERIAL-PA66</span>
              <span className={styles.signalTime}>09:42:17</span>
            </div>
            <h2 className={styles.signalTitle}>安全库存将被击穿</h2>
            <p className={styles.signalSub}>华东工厂 · PA66 树脂 · 供应周期发生偏差</p>

            <div className={styles.metricList}>
              <div>
                <div className={styles.metricRow}><span>可用库存</span><strong>126 t</strong></div>
                <div className={styles.metricTrack}><span className={styles.metricFill} style={{ width: "38%" }} /></div>
              </div>
              <div>
                <div className={styles.metricRow}><span>计划消耗</span><strong>17.4 t / day</strong></div>
                <div className={styles.metricTrack}><span className={styles.metricFill} style={{ width: "72%" }} /></div>
              </div>
              <div>
                <div className={styles.metricRow}><span>补货周期</span><strong>16 days</strong></div>
                <div className={styles.metricTrack}><span className={styles.metricFill} style={{ width: "86%" }} /></div>
              </div>
            </div>
          </div>

          <div className={styles.causalFlow}>
            <div className={styles.flowHead}><span>ONE CAUSAL PASS</span><span>{activeStep + 1} / 4</span></div>
            <div className={styles.flowTrack}>
              {FLOW.map((label, index) => (
                <div className={`${styles.flowStep} ${index <= activeStep ? styles.flowStepActive : ""}`} key={label}>
                  <i>{index + 1}</i>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
