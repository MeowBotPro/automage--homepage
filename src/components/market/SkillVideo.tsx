"use client";

import { useState } from "react";
import type { SkillVideoSource } from "@/lib/skill-video";
import styles from "./MarketPage.module.css";

/** The skill's demo video, in a 16:9 frame. Until its file is uploaded — or if it fails to load — the
    frame is a cover: the skill and its own steps. Nothing on the cover looks playable, because it isn't. */
export default function SkillVideo({ title, output, steps, video }: {
  title: string;
  output: string;
  steps: string[];
  video: SkillVideoSource | null;
}) {
  const [failed, setFailed] = useState(false);
  if (video && !failed) {
    return <video className={styles.videoFrame} src={video.src} poster={video.poster} controls preload="metadata" playsInline aria-label={`${title}演示视频`} onError={() => setFailed(true)} />;
  }
  return <div className={styles.videoFrame} data-slot>
    <p className={styles.videoTitle}>{title}</p>
    {steps.length > 0
      ? <ol className={styles.videoSteps}>{steps.map((step, i) => <li key={step}><span>{String(i + 1).padStart(2, "0")}</span>{step}</li>)}</ol>
      : <p className={styles.videoOutput}>交付 · {output}</p>}
  </div>;
}
