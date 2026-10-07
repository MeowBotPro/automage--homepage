"use client";

import { useId, useState } from "react";
import { ArrowRight, FileText, MessageSquare, UserRound } from "lucide-react";
import styles from "./SystemHome.module.css";

export default function WorkScene() {
  const [step, setStep] = useState(1);
  const id = useId();
  const labels = ["收到的信息", "整理后的工作", "接下来的行动"];
  return <div className={styles.scene}>
    <div className={styles.sceneTop}><span>一次客户询盘</span><span className={styles.demoLabel}>工作方式示意</span></div>
    <div className={styles.sceneTabs} role="tablist" aria-label="查看协作过程">{labels.map((label, i) => <button key={label} id={`${id}-${i}`} type="button" role="tab" aria-selected={step === i} aria-controls={`${id}-content`} tabIndex={step === i ? 0 : -1} onClick={() => setStep(i)} onKeyDown={(event) => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); const next = (step + (event.key === "ArrowRight" ? 1 : 2)) % 3; setStep(next); document.getElementById(`${id}-${next}`)?.focus(); } }}><span>0{i + 1}</span>{label}</button>)}</div>
    <div className={styles.sceneContent} id={`${id}-content`} role="tabpanel" aria-labelledby={`${id}-${step}`}>
      {step === 0 && <><div className={styles.sceneHeading}><MessageSquare size={20} /><h2>信息来了，还需要补齐上下文。</h2></div><div className={styles.message}><small>客户 · 沟通入口</small><p>“我们现在靠表格跟进客户，交接经常漏信息。想了解你们能怎么帮忙。”</p></div><div className={styles.sourcePair}><div><FileText size={16} /><span>已有客户资料</span></div><div><FileText size={16} /><span>产品知识与说明</span></div></div><p className={styles.sceneFootnote}>把消息和已有资料放回同一件工作里。</p></>}
      {step === 1 && <><div className={styles.sceneHeading}><FileText size={20} /><h2>让下一位接手的人，知道从哪开始。</h2></div><div className={styles.workCard}><div className={styles.workCardTop}><span>客户询盘 · 跟进摘要</span><span>待补充</span></div><dl><div><dt>已经知道</dt><dd>用表格跟进，客户交接存在遗漏</dd></div><div><dt>还需要了解</dt><dd>团队规模、现有流程、上线时间</dd></div><div><dt>建议下一步</dt><dd>先问清交接场景，再确认产品是否适合</dd></div></dl></div><div className={styles.usedSkill}><span>按需参与的 Skill</span><span>客户询盘与资格判断 <ArrowRight size={13} /></span></div></>}
      {step === 2 && <><div className={styles.sceneHeading}><UserRound size={20} /><h2>需要判断时，找到有职责的人。</h2></div><div className={styles.workCard}><div className={styles.workCardTop}><span>销售同事接手</span><span>继续跟进</span></div><dl><div><dt>系统准备</dt><dd>客户问题、已知资料与待确认事项</dd></div><div><dt>人来判断</dt><dd>需求是否匹配，哪些承诺可以作出</dd></div><div><dt>工作延续</dt><dd>确认下一步后，把跟进结果记回同一事项</dd></div></dl></div><p className={styles.sceneFootnote}>具体接入与可执行动作，在组织的使用范围内确认。</p></>}
    </div>
    <div className={styles.sceneBottom}><span>消息与资料</span><ArrowRight size={14} /><span>共同上下文</span><ArrowRight size={14} /><span>下一步与反馈</span></div>
  </div>;
}
