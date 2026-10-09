import type { CSSProperties } from "react";
import { CornerDownLeft, Eye, FileText, PenLine, Sparkles, Stamp, type LucideIcon } from "lucide-react";
import { LINE_STEP, NODES, reachOf } from "@/lib/entry";
import styles from "./Entry.module.css";

export const NODE_ICONS: Record<string, LucideIcon> = { record: FileText, sum: Sparkles, review: Eye, draft: PenLine, decide: Stamp, back: CornerDownLeft };

/** Ring radius in percent of the square; nodes sit on it, so they are on the drawn circle exactly. */
const R = 38;
const point = (step: number, radius = R) => {
  const angle = ((-90 + (step * 360) / NODES.length) * Math.PI) / 180;
  return { x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
};
const at = (k: number) => {
  const { x, y } = point(k);
  /* Labels sit outside the ring, on the side the node faces, so the ring never runs through them. */
  const side = Math.abs(x - 50) < 1 ? (y < 50 ? "top" : "bottom") : x > 50 ? "right" : "left";
  return { x, y, side };
};

/** The loop of the 02 act: six steps around the work the turn is about, people's steps in warm white
    and AutoMage's in blue. The scroll moves a marker round it, lights each node as it is reached and
    draws the arc behind it; the centre says where the work stands; the amber mark before the decision
    is the line, where the work goes to the person the line names. Each label hangs off its icon,
    outside the ring, so the icon's centre is the point on the circle and the ring never crosses text. */
export default function LoopRing() {
  const lineIn = point(LINE_STEP, R - 5);
  const lineOut = point(LINE_STEP, R + 5);
  const lineLabel = point(LINE_STEP, R + 10);
  return <div className={styles.ring}>
    <svg className={styles.ringSvg} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="entry-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38BDF8" />
          <stop offset="0.55" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      <circle className={styles.ringTrack} cx="50" cy="50" r={R} />
      <circle className={styles.ringArc} cx="50" cy="50" r={R} pathLength={1} stroke="url(#entry-ring)" transform="rotate(-90 50 50)" />
      <line className={styles.lineMark} x1={lineIn.x} y1={lineIn.y} x2={lineOut.x} y2={lineOut.y} />
      <g className={styles.marker}><circle cx="50" cy={50 - R} r="1.5" /></g>
    </svg>
    <span className={styles.lineLabel} style={{ "--x": `${lineLabel.x}%`, "--y": `${lineLabel.y}%` } as CSSProperties} aria-hidden="true">你们定的线</span>
    <div className={styles.focus} aria-hidden="true">
      <p className={styles.focusTitle}>团队日报<small>今天</small></p>
      <ol>{NODES.map((node, k) => <li key={node.id} data-line={node.id === "decide" || undefined} style={{ "--r": reachOf(k), "--rn": reachOf(k + 1) } as CSSProperties}>{node.focus}</li>)}</ol>
    </div>
    <ol className={styles.nodes} aria-label="组织里的一圈：记录、汇总、审阅、起草、拍板、回到一线">
      {NODES.map((node, k) => {
        const { x, y, side } = at(k);
        const Icon = NODE_ICONS[node.id];
        return <li key={node.id} className={styles.node} data-actor={node.actor} data-side={side} data-weight={node.id === "decide" ? "heavy" : undefined} style={{ "--x": `${x}%`, "--y": `${y}%`, "--r": reachOf(k), "--rn": reachOf(k + 1) } as CSSProperties}>
          <span className={styles.nodeIcon}><Icon size={node.id === "decide" ? 23 : 20} strokeWidth={1.7} aria-hidden="true" /></span>
          <span className={styles.nodeLabel}>{node.label}<small>{node.role}</small></span>
        </li>;
      })}
    </ol>
  </div>;
}
