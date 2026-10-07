"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { CHART_DAYS, N, type Projection } from "@/lib/supply-chain-world";
import styles from "./SupplyChain.module.css";

const LEFT = 40;
const RIGHT = 18;
const TOP = 22;
const BOTTOM = 30;
const MAX = 340;

export default function InventoryChart({ projection, day }: { projection: Projection; day: number }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);
  const values = projection.series;
  const breach = projection.breachDay;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(280, Math.round(el.clientWidth)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The viewBox follows the rendered width so labels keep their real pixel size on phones.
  const W = width;
  const compact = W < 480;
  const H = compact ? 220 : 214;
  const x = (d: number) => LEFT + (d / CHART_DAYS) * (W - LEFT - RIGHT);
  const y = (value: number) => TOP + (1 - Math.max(0, value) / MAX) * (H - TOP - BOTTOM);
  const line = (series: number[], from: number, to: number) => series
    .slice(from, to + 1)
    .map((value, index) => `${index === 0 ? "M" : "L"}${x(from + index).toFixed(1)},${y(value).toFixed(1)}`)
    .join(" ");
  const step = compact ? 3 : 2;
  const dayTicks = Array.from({ length: CHART_DAYS / step + 1 }, (_, index) => index * step);

  const onMove = (event: PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!box) return;
    const ratio = ((event.clientX - box.left) / box.width) * W;
    const nearest = Math.round(((ratio - LEFT) / (W - LEFT - RIGHT)) * CHART_DAYS);
    setHover(Math.min(CHART_DAYS, Math.max(0, nearest)));
  };

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const base = hover ?? day;
    setHover(Math.min(CHART_DAYS, Math.max(0, base + (event.key === "ArrowRight" ? 1 : -1))));
  };

  const tipLeft = hover === null ? 0 : Math.min(88, Math.max(12, (x(hover) / W) * 100));

  return (
    <div
      ref={wrapRef}
      className={styles.chart}
      tabIndex={0}
      data-own-arrows
      role="group"
      aria-label={`库存测算图：今天第 ${day} 天，库存 ${values[day]}t；安全线 ${N.safety}t；${breach === null ? `守住到第 ${N.regularDay} 天` : `第 ${breach} 天跌破安全线`}。左右方向键逐天查看。`}
      onKeyDown={onKey}
      onBlur={() => setHover(null)}
    >
      <div className={styles.chartLegend} aria-hidden="true">
        <span><i className={styles.keySolid} />已发生（WMS）</span>
        <span><i className={styles.keyDashed} />AutoMage 测算</span>
        {projection.previous && <span><i className={styles.keyGhost} />{projection.previous.label}</span>}
        <span><i className={styles.keySafety} />安全线 {N.safety}t</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chartSvg} aria-hidden="true">
        {[0, 100, 200, 300].map((tick) => (
          <g key={tick}>
            <line x1={LEFT} x2={W - RIGHT} y1={y(tick)} y2={y(tick)} className={styles.gridLine} />
            <text x={LEFT - 8} y={y(tick) + 4} className={styles.axisText} textAnchor="end">{tick}</text>
          </g>
        ))}
        {dayTicks.map((tick) => (
          <text key={tick} x={x(tick)} y={H - 8} className={styles.axisText} textAnchor={tick === CHART_DAYS ? "end" : "middle"}>
            {tick === CHART_DAYS ? `${tick} 天` : tick}
          </text>
        ))}

        <line x1={LEFT} x2={W - RIGHT} y1={y(N.safety)} y2={y(N.safety)} className={styles.safetyLine} />

        {projection.previous && (
          <path d={line(projection.previous.series, day, CHART_DAYS)} className={styles.ghostLine} />
        )}
        <path d={line(values, day, CHART_DAYS)} className={styles.projectedLine} key={`p-${projection.label}-${day}`} />
        <path d={line(values, 0, day)} className={styles.actualLine} />

        <line x1={x(day)} x2={x(day)} y1={TOP - 6} y2={H - BOTTOM} className={styles.todayLine} />
        <text x={x(day)} y={TOP - 10} className={styles.todayText} textAnchor="middle">今天</text>

        {projection.arrivals.filter((arrival) => arrival.day > day || arrival.day === N.regularDay).map((arrival) => (
          <g key={`${arrival.label}-${arrival.day}`}>
            <circle cx={x(arrival.day)} cy={y(values[arrival.day])} r={3.5} className={styles.arrivalDot} />
            {arrival.day === N.regularDay && (
              <text x={compact ? x(arrival.day) + 6 : x(arrival.day)} y={y(values[arrival.day]) - 9} className={styles.markText} textAnchor={compact ? "end" : "middle"}>常规批次 +{arrival.qty}t</text>
            )}
          </g>
        ))}

        {breach !== null && (
          <g>
            <circle cx={x(breach)} cy={y(values[breach])} r={5} className={styles.breachDot} />
            <text x={x(breach)} y={y(values[breach]) + 18} className={styles.breachText} textAnchor="middle">第 {breach} 天跌破</text>
          </g>
        )}

        {projection.stopDay !== null && !compact && (
          <text x={x(projection.stopDay) + 4} y={y(0) - 8} className={styles.breachText} textAnchor="start">第 {projection.stopDay} 天停线</text>
        )}

        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={TOP} y2={H - BOTTOM} className={styles.crosshair} />
            <circle cx={x(hover)} cy={y(values[hover])} r={4} className={styles.hoverDot} />
          </g>
        )}

        <rect
          x={LEFT}
          y={TOP}
          width={W - LEFT - RIGHT}
          height={H - TOP - BOTTOM}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
      {hover !== null && (
        <div className={styles.chartTip} style={{ left: `${tipLeft}%` }}>
          <strong>{values[hover]}t</strong>
          <span>第 {hover} 天 · {hover <= day ? "已发生" : "测算"}</span>
          {values[hover] < N.safety && <span className={styles.tipRisk}>低于安全线</span>}
        </div>
      )}
      <table className={styles.srOnly}>
        <caption>逐日库存（吨）</caption>
        <thead><tr><th scope="col">天</th><th scope="col">库存</th><th scope="col">性质</th></tr></thead>
        <tbody>
          {values.map((value, index) => (
            <tr key={index}><td>第 {index} 天</td><td>{value}</td><td>{index <= day ? "已发生" : "测算"}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
