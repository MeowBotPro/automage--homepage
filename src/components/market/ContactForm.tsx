"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { SkillRecord } from "@/lib/skill-catalog";
import styles from "./MarketPage.module.css";

export default function ContactForm({ skills, initialNeed }: { skills: Pick<SkillRecord, "id" | "title" | "summary">[]; initialNeed: string }) {
  const [excluded, setExcluded] = useState<string[]>([]);
  const selected = skills.map((skill) => skill.id).filter((id) => !excluded.includes(id));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true); setError("");
    try {
      const response = await fetch("/api/v1/beta-applications", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occupation: String(form.get("role")), work_background: String(form.get("need")), use_case: selected.length ? "Skill 选配咨询" : "AutoMage 产品咨询", contact: String(form.get("contact")), source: "skill_market", skill_ids: selected }),
      });
      const result: { msg?: string; data?: { record?: { application_public_id?: string } } } = await response.json();
      const id = result.data?.record?.application_public_id;
      if (!response.ok || !id) throw new Error(result.msg || "暂时未能提交，你填写的内容已保留，请重试。");
      setReceipt(id);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "网络异常，请重试。");
    } finally { setPending(false); }
  }

  if (receipt) return <section className={styles.success} role="status"><p className={styles.kicker}>Inquiry received</p><h2>需求已收到。</h2><p>本次咨询附上了 {selected.length} 项能力。我们会根据你留下的联系方式进一步沟通。</p><p>受理编号 · {receipt}</p><Link className={styles.ghost} href="/market">继续探索 Skills ↗</Link></section>;

  return <form className={styles.contactForm} action="/api/v1/beta-applications" method="post" onSubmit={submit}>
    {skills.length > 0 && <fieldset style={{ border: 0, padding: 0, marginBottom: 25 }}><legend style={{ fontSize: 14, marginBottom: 14 }}>本次想讨论的能力 · {selected.length} 项</legend>{skills.map((skill) => <label key={skill.id} style={{ display: "flex", alignItems: "start", gap: 12, marginBottom: 13 }}><input type="checkbox" checked={selected.includes(skill.id)} onChange={(event) => setExcluded(event.target.checked ? excluded.filter((id) => id !== skill.id) : [...excluded, skill.id])} style={{ width: 16, marginTop: 3, accentColor: "#3b82f6" }} /><span><Link href={`/market/${encodeURIComponent(skill.id)}`} style={{ color: "#c4ddf6" }}>{skill.title} ↗</Link></span></label>)}</fieldset>}
    <label>你的公司与职责<input name="role" required maxLength={128} autoComplete="organization" placeholder="例如：制造企业 · 采购负责人" /></label>
    <label>希望解决什么问题<textarea name="need" maxLength={1000} defaultValue={initialNeed} placeholder="目前怎么做，哪一步最费力？也可以说明已有系统和期望产出。" /></label>
    <label>方便联系你的方式<input name="contact" required maxLength={128} autoComplete="email" placeholder="邮箱、手机或微信" /></label>
    {error && <p className={styles.error} role="alert" style={{ marginBottom: 15 }}>{error}</p>}
    <button className={styles.primary} type="submit" disabled={pending}>{pending ? "正在提交…" : "发送咨询需求 ↗"}</button>
    <small>提交后，我们会收到你的需求和本次勾选的 Skill，用于后续沟通。</small>
  </form>;
}
