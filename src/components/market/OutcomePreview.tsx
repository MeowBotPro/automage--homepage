"use client";

import { useId, useState } from "react";
import type { PreviewKind } from "@/lib/skill-stories";
import styles from "./MarketPage.module.css";

// Illustrative rows for the sourcing preview; labelled as demo data on the page, not a real query result.
const SOURCING_ROWS = [
  ["候选 1", "304 不锈钢 · 500ml · 双层真空", "¥18.50 / 个 · 100 个起", "义乌某日用品厂"],
  ["候选 2", "304 不锈钢 · 480ml · 单层", "¥12.80 / 个 · 300 个起", "永康某工贸"],
  ["候选 3", "316 不锈钢 · 500ml · 双层真空", "¥24.00 / 个 · 50 个起", "深圳某实业"],
];

const REPORT_PANELS = [
  { name: "原因与证据", rows: [["主要原因", "发生了什么，依据是什么"], ["相关因素", "哪些问题共同造成了流失"], ["资料缺口", "哪些结论还需要核实"]] },
  { name: "关键时间线", rows: [["合作起点", "最初需求与承诺"], ["变化出现", "使用、工单与沟通的转折"], ["客户退出", "退出反馈与最后记录"]] },
  { name: "改进动作", rows: [["错过的预警", "哪些信号值得更早关注"], ["干预机会", "当时可以采取什么行动"], ["后续建议", "负责人、优先级与观察项"]] },
];

export default function OutcomePreview({ kind = "document", compact = false, title, items = [] }: { kind?: PreviewKind; compact?: boolean; title?: string; items?: string[] }) {
  const [tab, setTab] = useState(0);
  const instanceId = useId();
  const names = { report: "客户流失复盘", sourcing: "商品候选对照", script: "从长文到可拍脚本", lead: "一条询盘的下一步", document: title ?? "可继续编辑的交付物" };
  return <div className={`${styles.preview} ${compact ? styles.previewCompact : ""}`} aria-label={`${names[kind]}，输出结构示例`}>
    <div className={styles.previewEyebrow}>你会拿到{kind === "sourcing" ? <span className={styles.demoTag}>演示</span> : <span>示例结构</span>}</div><h3>{names[kind]}</h3>
    {kind === "report" && <>
      {!compact && <div className={styles.previewTabs} role="tablist" aria-label="报告内容">{REPORT_PANELS.map((panel, index) => <button type="button" role="tab" id={`${instanceId}-tab-${index}`} aria-selected={tab === index} aria-controls={`${instanceId}-panel`} tabIndex={tab === index ? 0 : -1} key={panel.name} onClick={() => setTab(index)} onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); const next = (tab + (event.key === "ArrowRight" ? 1 : 2)) % 3; setTab(next); document.getElementById(`${instanceId}-tab-${next}`)?.focus(); } }}>{panel.name}</button>)}</div>}
      <div className={styles.previewRows} id={`${instanceId}-panel`} role={!compact ? "tabpanel" : undefined} aria-labelledby={!compact ? `${instanceId}-tab-${tab}` : undefined}>{REPORT_PANELS[tab].rows.map(([label, value]) => <div key={label} className={styles.previewRow}><span>{label}</span><span>{value}</span></div>)}</div>
    </>}
    {kind === "sourcing" && <><p className={styles.previewAsk}>示例：找「304 不锈钢保温杯 500ml」的同款并比价</p><div className={styles.previewScroll}><table className={styles.previewTable}><caption className="sr-only">候选对照表示例（演示数据）：每个候选一行，比较商品与规格、价格与起订量、供应商与原始链接</caption><thead><tr><th scope="col">候选</th><th scope="col">商品与规格</th><th scope="col">价格 · 起订量</th><th scope="col">供应商 · 来源</th></tr></thead><tbody>{SOURCING_ROWS.map(([name, spec, price, supplier]) => <tr key={name}><td>{name}</td><td>{spec}</td><td>{price}</td><td>{supplier}<span className={styles.sourceLink}>原始链接 ↗</span></td></tr>)}</tbody></table></div></>}
    {kind === "script" && <div className={styles.scriptFrames}>{[["01", "抓住注意", "标题与开场钩子"], ["02", "讲清内容", "口播与画面分镜"], ["03", "准备发布", "封面与发布文案"]].map(([n, heading, copy]) => <div className={styles.scriptFrame} key={n}><small>{n}</small><strong>{heading}</strong><p>{copy}</p></div>)}</div>}
    {kind === "lead" && <><div className={styles.previewQuote}>“客户想了解产品，哪些信息已经明确，哪些还需要问？”</div><span className={styles.leadTag}>需求与痛点</span><span className={styles.leadTag}>待补充信息</span><div className={styles.previewRows}><div className={styles.previewRow}><span>跟进记录</span><span>当前阶段 · 下一步</span></div><div className={styles.previewRow}><span>产品回答</span><span>依据已批准的知识</span></div></div></>}
    {kind === "document" && <ol className={styles.previewToc}>{items.map((text, index) => <li key={text}><span>{String(index + 1).padStart(2, "0")}</span>{text}</li>)}</ol>}
    {!compact && kind !== "document" && kind !== "sourcing" && items.length > 0 && <><p className={styles.previewLabel}>这份结果包含</p><ul className={styles.previewIncludes}>{items.map((text) => <li key={text}>{text}</li>)}</ul></>}
    {!compact && <p className={styles.previewNote}>{kind === "sourcing" ? "示例数据，不是真实查询结果。每个候选都附原始商品链接，方便继续核对规格、服务信息和卖点；实际内容取决于提供的资料与使用条件。" : "这里展示产出的组织方式。实际内容取决于提供的资料与使用条件。"}</p>}
  </div>;
}
