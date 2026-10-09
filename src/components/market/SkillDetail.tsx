import Link from "next/link";
import type { SkillRecord } from "@/lib/skill-catalog";
import { groupsForSkill } from "@/lib/skill-groups";
import { SKILL_STORIES } from "@/lib/skill-stories";
import { catalogUrl } from "@/lib/market-navigation";
import MarketChrome, { MarketFooter } from "./MarketChrome";
import OutcomePreview from "./OutcomePreview";
import SkillGroupCard from "./SkillGroupCard";
import SkillIntentButton from "./SkillIntentButton";
import styles from "./MarketPage.module.css";

// Reading path: what it is → what you get (the one light object) → who provides what and where it stops → reference.
export default function SkillDetail({ skill, selected, returnTo }: { skill: SkillRecord; selected: boolean; returnTo: string }) {
  const groups = groupsForSkill(skill.id);
  const group = groups[0];
  const story = SKILL_STORIES[skill.id];
  const currentUrl = `/market/${encodeURIComponent(skill.id)}?${new URLSearchParams({ returnTo })}`;
  return <div className={styles.page}><MarketChrome active="detail" /><main className={styles.main}>
    <nav className={styles.breadcrumb} aria-label="当前位置"><Link href={returnTo}>← 返回浏览结果</Link><span>/</span><Link href="/market">AI 自动化能力库</Link><span>/</span>{group && <Link href={`${catalogUrl({ group: group.id })}#catalog`}>{group.title}</Link>}</nav>
    <header className={styles.capHead}>
      <div>
        <p className={styles.capMeta}><Link href="/market">AI 自动化能力库</Link><span>{skill.domain}</span></p>
        <h1 className={styles.capTitle}>{skill.title}</h1>
        <p className={styles.capPromise}>{story?.description ?? skill.summary}</p>
        {story && <dl className={styles.capFit}><div><dt>什么时候用</dt><dd>{story.scenario}</dd></div><div><dt>适合</dt><dd>{story.audience}</dd></div></dl>}
        <div className={styles.detailActions}><SkillIntentButton id={skill.id} selected={selected} returnTo={currentUrl} /><Link className={styles.ghost} href={`/contact?${new URLSearchParams({ skill: skill.id })}`}>咨询这项能力 ↗</Link></div>
        <p className={styles.detailHint}>加入清单，方便一起讨论你的需求。</p>
      </div>
      {story ? <OutcomePreview kind={story.preview} title={skill.output} items={story.outcomes} /> : <div className={styles.preview} aria-label={`${skill.output}，产出说明`}><div className={styles.previewEyebrow}>你会拿到<span>能力说明</span></div><h3>{skill.output}</h3><p className={styles.previewLead}>产出的具体结构随你的资料而定，部署前和你一起确认。</p></div>}
    </header>
    <section className={styles.capDuty} aria-label="分工与边界">
      <div><h2>你提供</h2><ul>{(story?.inputs ?? skill.inputs).map((input, i) => <li key={`${input}-${i}`}>{input}</li>)}</ul></div>
      {story && <div><h2>从资料到交付</h2><ol className={styles.capSteps}>{story.steps.map((step, i) => <li key={step.title}><span>{String(i + 1).padStart(2, "0")}</span><div><strong>{step.title}</strong><p>{step.text}</p></div></li>)}</ol></div>}
      {story && <div><h2>范围与边界</h2><p>{story.boundary}</p></div>}
      <div><h2>接入条件</h2><p>{story?.requirements ?? "需要能运行该 Skill 的环境及对应资料访问权限。具体系统接入条件可随咨询一起确认。"}</p></div>
    </section>
    {group && <section className={styles.detailSection}><h2>和同类能力怎么选</h2><SkillGroupCard group={group} returnTo={returnTo} currentId={skill.id} expanded={group.skillIds.length <= 4} /></section>}
    {skill.videoUrl && <section className={styles.detailSection}><h2>观看讲解</h2><video className={styles.video} src={skill.videoUrl} poster={skill.posterUrl ?? undefined} controls preload="metadata" /></section>}
    <p className={styles.capSource}>{skill.nestedCount > 0 && <span>包含 {skill.nestedCount} 个子技能。</span>}<span>Skill 标识 <code>{skill.id}</code></span></p>
  </main><MarketFooter /></div>;
}
