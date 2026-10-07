"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PrototypeHeader from "./PrototypeHeader";
import {
  CAPABILITY_CATALOG,
  CAPABILITY_CATEGORIES,
  DEFAULT_CAPABILITY_IDS,
  PROTOTYPE_PLAN_STORAGE_KEY,
  type PrototypeCapability,
} from "@/lib/market-console-prototype";
import styles from "./MarketConsolePrototype.module.css";

type CategoryFilter = (typeof CAPABILITY_CATEGORIES)[number];

function persistPlan(ids: string[]) {
  window.localStorage.setItem(PROTOTYPE_PLAN_STORAGE_KEY, JSON.stringify(ids));
}

export default function MarketPrototype() {
  const [category, setCategory] = useState<CategoryFilter>("全部");
  const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_CAPABILITY_IDS);
  const [detail, setDetail] = useState<PrototypeCapability | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let restoredIds: string[] | null = null;
    const raw = window.localStorage.getItem(PROTOTYPE_PLAN_STORAGE_KEY);
    if (raw) {
      try {
        const stored = JSON.parse(raw) as unknown;
        if (Array.isArray(stored)) {
          const valid = stored.filter(
            (id): id is string =>
              typeof id === "string" && CAPABILITY_CATALOG.some((item) => item.id === id),
          );
          if (valid.length > 0) restoredIds = valid;
        }
      } catch {
        window.localStorage.removeItem(PROTOTYPE_PLAN_STORAGE_KEY);
      }
    }
    const restoreFrame = window.requestAnimationFrame(() => {
      if (restoredIds) setSelectedIds(restoredIds);
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(restoreFrame);
  }, []);

  useEffect(() => {
    if (hydrated) persistPlan(selectedIds);
  }, [hydrated, selectedIds]);

  useEffect(() => {
    if (!detail) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetail(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [detail]);

  const visibleCapabilities = useMemo(
    () => CAPABILITY_CATALOG.filter((item) => category === "全部" || item.category === category),
    [category],
  );

  const selectedCapabilities = useMemo(
    () => CAPABILITY_CATALOG.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  );

  const selectedInputs = useMemo(
    () => Array.from(new Set(selectedCapabilities.flatMap((item) => item.inputs))),
    [selectedCapabilities],
  );

  const toggleCapability = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const resetPlan = () => {
    setSelectedIds(DEFAULT_CAPABILITY_IDS);
    setCategory("全部");
  };

  return (
    <div className={`${styles.prototypePage} ${styles.marketPage}`}>
      <PrototypeHeader active="market" />

      <main>
        <section className={styles.marketHero} aria-labelledby="market-title">
          <div className={styles.marketHeroCopy}>
            <p className={styles.eyebrow}>AUTOMAGE CAPABILITY CENTER · CONCEPT</p>
            <h1 id="market-title">为你的组织，<br />装配一套持续工作的 AutoMage。</h1>
            <p className={styles.heroLead}>
              先选择企业希望拥有的能力。Agent、Skill、连接器与部署方式，进入 Console 后再与真实组织边界对齐。
            </p>
          </div>

          <div className={styles.marketHeroRail} aria-label="能力装配步骤">
            <div data-active="true"><span>01</span><strong>选择企业能力</strong><small>从业务结果开始</small></div>
            <div><span>02</span><strong>形成方案草案</strong><small>看清输入与边界</small></div>
            <div><span>03</span><strong>进入 Console</strong><small>绑定真实组织条件</small></div>
          </div>
        </section>

        <section className={styles.marketWorkspace} aria-label="企业能力装配工作区">
          <div className={styles.catalogColumn}>
            <div className={styles.catalogToolbar}>
              <div>
                <p className={styles.sectionLabel}>OFFICIAL CAPABILITIES</p>
                <h2>从业务结果开始选择</h2>
              </div>
              <span className={styles.catalogCount}>{visibleCapabilities.length} 项概念能力</span>
            </div>

            <div className={styles.categoryTabs} role="tablist" aria-label="能力分类">
              {CAPABILITY_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={category === item}
                  data-active={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className={styles.capabilityGrid}>
              {visibleCapabilities.map((capability) => {
                const selected = selectedIds.includes(capability.id);
                return (
                  <article
                    className={styles.capabilityCard}
                    data-selected={selected}
                    key={capability.id}
                  >
                    <div className={styles.capabilityMeta}>
                      <span>{capability.index}</span>
                      <span>{capability.category}</span>
                      <span>OFFICIAL · CONCEPT</span>
                    </div>
                    <h3>{capability.title}</h3>
                    <p>{capability.summary}</p>

                    <div className={styles.capabilityOutcome}>
                      <span>将产生</span>
                      <strong>{capability.output}</strong>
                    </div>

                    <div className={styles.capabilityInputs} aria-label="所需输入">
                      {capability.inputs.map((input) => <span key={input}>{input}</span>)}
                    </div>

                    <div className={styles.capabilityActions}>
                      <button type="button" className={styles.textButton} onClick={() => setDetail(capability)}>
                        查看工作方式
                      </button>
                      <button
                        type="button"
                        className={selected ? styles.removeButton : styles.addButton}
                        onClick={() => toggleCapability(capability.id)}
                        aria-pressed={selected}
                      >
                        {selected ? "已加入 · 移除" : "加入方案 ＋"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className={styles.blueprintPanel} aria-label="我的 AutoMage 方案">
            <div className={styles.blueprintHeader}>
              <div>
                <p className={styles.sectionLabel}>MY AUTOMAGE / DRAFT</p>
                <h2>企业管理协同方案</h2>
              </div>
              <span className={styles.draftTag}>可逆草案</span>
            </div>

            <div className={styles.blueprintStat}>
              <strong>{selectedCapabilities.length}</strong>
              <span>项企业能力已加入</span>
            </div>

            <div className={styles.selectedList}>
              {selectedCapabilities.length === 0 ? (
                <div className={styles.emptyPlan}>从左侧加入一项能力，方案会在这里形成。</div>
              ) : selectedCapabilities.map((item) => (
                <div className={styles.selectedItem} key={item.id}>
                  <span>{item.index}</span>
                  <div><strong>{item.title}</strong><small>{item.category}</small></div>
                  <button type="button" onClick={() => toggleCapability(item.id)} aria-label={`移除${item.title}`}>×</button>
                </div>
              ))}
            </div>

            <div className={styles.planSummary}>
              <div>
                <span>需要对齐</span>
                <p>{selectedInputs.length > 0 ? selectedInputs.join(" · ") : "尚未选择数据来源"}</p>
              </div>
              <div>
                <span>责任边界</span>
                <p>{selectedCapabilities.length > 0 ? `${selectedCapabilities.length} 项动作包含人工门禁` : "尚未形成"}</p>
              </div>
            </div>

            {selectedCapabilities.length > 0 ? (
              <Link
                className={styles.continueButton}
                href="/console"
                onClick={() => persistPlan(selectedIds)}
              >
                继续进入 Console <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <button className={styles.continueButton} type="button" disabled>至少选择一项能力</button>
            )}
            <button className={styles.resetButton} type="button" onClick={resetPlan}>重置演示方案</button>
            <p className={styles.prototypeNote}>仅保存在当前浏览器 · 不创建账号 · 不连接企业系统</p>
          </aside>
        </section>
      </main>

      {detail ? (
        <div className={styles.dialogBackdrop} role="presentation" onMouseDown={() => setDetail(null)}>
          <section
            className={styles.detailDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="capability-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.dialogTopline}>
              <span>CAPABILITY / {detail.index}</span>
              <button type="button" onClick={() => setDetail(null)} aria-label="关闭详情">×</button>
            </div>
            <p className={styles.eyebrow}>{detail.category} · OFFICIAL CONCEPT</p>
            <h2 id="capability-dialog-title">{detail.title}</h2>
            <p className={styles.dialogLead}>{detail.outcome}</p>

            <div className={styles.dialogGrid}>
              <div><span>需要什么</span><strong>{detail.inputs.join(" · ")}</strong></div>
              <div><span>将产生什么</span><strong>{detail.output}</strong></div>
              <div className={styles.dialogWide}><span>Human Gate</span><strong>{detail.gate}</strong></div>
            </div>

            <div className={styles.compositionBlock}>
              <div><span>内部 Agent</span>{detail.agents.map((item) => <strong key={item}>{item}</strong>)}</div>
              <div><span>内部 Skill</span>{detail.skills.map((item) => <strong key={item}>{item}</strong>)}</div>
            </div>

            <div className={styles.dialogActions}>
              <button type="button" className={styles.textButton} onClick={() => setDetail(null)}>返回浏览</button>
              <button
                type="button"
                className={styles.addButton}
                onClick={() => {
                  if (!selectedIds.includes(detail.id)) toggleCapability(detail.id);
                  setDetail(null);
                }}
              >
                {selectedIds.includes(detail.id) ? "已在方案中" : "加入我的方案 ＋"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
