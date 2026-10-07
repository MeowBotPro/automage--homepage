import Link from "next/link";
import { groupSkills, searchTerms, type SkillGroup } from "@/lib/skill-groups";
import { detailUrl } from "@/lib/market-navigation";
import styles from "./MarketPage.module.css";

export default function SkillGroupCard({ group, returnTo, query = "", expanded = false, currentId }: { group: SkillGroup; returnTo: string; query?: string; expanded?: boolean; currentId?: string }) {
  const skills = groupSkills(group);
  const terms = searchTerms(query);
  const matched = terms.length ? skills.find((skill) => terms.every((term) => `${skill.id} ${skill.title} ${skill.summary}`.toLowerCase().includes(term))) : undefined;
  const primary = matched ?? skills[0];
  return <article className={styles.group} id={`task-${group.id}`}>
    <div className={styles.groupHeading}><div><h3>{group.title}</h3><p>{group.description}</p></div><span className={styles.groupNumber}>{String(skills.length).padStart(2, "0")} SKILLS</span></div>
    {!currentId && <Link className={styles.groupChoice} href={detailUrl(primary.id, returnTo)}><div><small>{matched ? "与你的搜索匹配" : "先看这一项"}</small><h4>{primary.title}</h4><p>{primary.summary}</p><p>产出 · {primary.output}</p></div><span className={styles.textLink}>查看详情 <span aria-hidden="true">↗</span></span></Link>}
    {skills.length > 1 ? <details className={styles.compare} open={expanded || Boolean(matched && matched.id !== skills[0].id)}>
      <summary role="button"><span>怎么选？比较这 {skills.length} 个 Skill</span><span aria-hidden="true">+</span></summary>
      <p className={styles.guide}>{group.guide}</p>
      {skills.map((skill) => <div className={styles.variant} key={skill.id}>
        <Link href={detailUrl(skill.id, returnTo)} aria-current={currentId === skill.id ? "page" : undefined}><strong>{skill.title}</strong><small>{currentId === skill.id ? "当前查看" : skill.nestedCount ? `技能包 · ${skill.nestedCount} 个子技能` : "独立 Skill"}</small></Link>
        <p>{skill.summary}<span className={styles.variantOutput}>产出 · {skill.output}</span></p>
        <Link href={detailUrl(skill.id, returnTo)} aria-label={`了解${skill.title}`}>↗</Link>
      </div>)}
    </details> : <div className={styles.compare}><p className={styles.guide} style={{ paddingTop: 15 }}>{group.guide}</p></div>}
  </article>;
}
