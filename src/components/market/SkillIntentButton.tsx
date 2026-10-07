"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./MarketPage.module.css";

export default function SkillIntentButton({ id, selected, returnTo, compact = false }: { id: string; selected: boolean; returnTo: string; compact?: boolean }) {
  const router = useRouter();
  const [localSelection, setLocalSelection] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const active = localSelection ?? selected;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const response = await fetch("/market/intent", { method: "POST", headers: { Accept: "application/json" }, body: form });
      const result: { ids?: string[]; error?: string } = await response.json();
      if (!response.ok || !Array.isArray(result.ids)) throw new Error(result.error || "清单未能保存，请重试。");
      setLocalSelection(result.ids.includes(id));
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "保存失败，请重试。");
    } finally {
      setPending(false);
    }
  }

  return <form className={styles.buttonForm} action="/market/intent" method="post" onSubmit={submit}>
    <input type="hidden" name="id" value={id} /><input type="hidden" name="action" value={active ? "remove" : "add"} /><input type="hidden" name="returnTo" value={returnTo} />
    <button type="submit" disabled={pending} className={`${compact ? styles.ghost : styles.primary} ${active ? styles.selected : ""}`}>{pending ? "正在保存…" : active ? compact ? "移除" : "✓ 已加入 · 移除" : "+ 加入咨询清单"}</button>
    <span className="sr-only" role="status">{active ? "已加入咨询清单" : "尚未加入咨询清单"}</span>{error && <span className={styles.error} role="alert">{error}</span>}
  </form>;
}
