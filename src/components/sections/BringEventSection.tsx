"use client";

import { useState } from "react";
import styles from "@/components/homepage-vnext/HomepageJourney.module.css";

const CHECKLIST = [
  {
    title: "事件是否跨系统",
    detail: "关键事实散落在 WMS、ERP、MES、SRM、表格或群聊中。",
  },
  {
    title: "决定是否需要证据链",
    detail: "需要说明事实来自哪里、何时更新，以及哪些仍是推断。",
  },
  {
    title: "未知是否会阻断执行",
    detail: "缺少一个确认、授权或边界条件，就不能安全地继续。",
  },
  {
    title: "结果是否需要人工负责",
    detail: "系统可以准备方案，但最终批准、拒绝与责任归属必须由人完成。",
  },
] as const;

export default function BringEventSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      id="section-event-fit"
      aria-labelledby="event-fit-title"
      className="relative overflow-hidden px-5 py-24 sm:px-8 lg:py-32"
      style={{
        background:
          "linear-gradient(180deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)",
      }}
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="grid items-start gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <div className="lg:sticky lg:top-32">
            <p
              className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--color-brand-accent)" }}
            >
              BRING A REAL EVENT
            </p>
            <h2
              id="event-fit-title"
              className="max-w-[12ch] text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl"
              style={{ color: "var(--color-text-primary)" }}
            >
              哪类事件值得带来内测？
            </h2>
            <p
              className="mt-6 max-w-[34rem] text-base leading-7 sm:text-lg"
              style={{ color: "var(--color-text-secondary)" }}
            >
              不需要先整理成一份完美需求。只要它真实发生过，而且做决定时经常缺事实、缺确认或缺责任边界，就值得一起拆解。
            </p>
          </div>

          <div
            className={`${styles.eventFitDisclosure} group rounded-[28px] border p-5 sm:p-7`}
            data-open={isOpen}
            style={{
              borderColor: "var(--color-border-subtle)",
              background: "color-mix(in srgb, var(--color-bg-elevated) 88%, transparent)",
              boxShadow: "0 24px 80px rgba(0, 20, 50, 0.12)",
            }}
          >
            <button
              className={`${styles.eventFitTrigger} flex cursor-pointer items-center justify-between gap-5 rounded-2xl px-2 py-3 text-left`}
              type="button"
              aria-controls="event-fit-checklist"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((current) => !current)}
              style={{ color: "var(--color-text-primary)" }}
            >
              <span>
                <span className="block text-sm font-semibold">先用 30 秒判断是否适合</span>
                <span
                  className="mt-1 block text-sm leading-6"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  符合两项以上，就可以直接进入下一节提交事件。
                </span>
              </span>
              <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xl transition-transform duration-300 group-open:rotate-45"
                style={{ borderColor: "var(--color-border-subtle)" }}
              >
                +
              </span>
            </button>

            <div className={styles.eventFitReveal} id="event-fit-checklist" aria-hidden={!isOpen}>
              <div className={styles.eventFitRevealInner}>
                <div className={`${styles.eventFitCards} mt-5 grid gap-3 sm:grid-cols-2`}>
              {CHECKLIST.map((item, index) => (
                <article
                  key={item.title}
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: "var(--color-border-subtle)",
                    background: "var(--color-bg-primary)",
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className="grid h-7 w-7 place-items-center rounded-full text-xs font-semibold"
                      style={{
                        color: "var(--color-brand-accent)",
                        background: "var(--color-brand-muted)",
                      }}
                    >
                      {index + 1}
                    </span>
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {item.title}
                    </h3>
                  </div>
                  <p
                    className="text-sm leading-6"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {item.detail}
                  </p>
                </article>
              ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
