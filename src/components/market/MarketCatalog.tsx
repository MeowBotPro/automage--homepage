import Link from "next/link";
import { Search } from "lucide-react";
import { skillCatalog } from "@/lib/skill-catalog";
import { findGroups, SKILL_GROUPS, WORK_AREAS } from "@/lib/skill-groups";
import { catalogUrl, pageWindow, type CatalogQuery } from "@/lib/market-navigation";
import MarketChrome, { MarketFooter } from "./MarketChrome";
import SkillGroupCard from "./SkillGroupCard";
import styles from "./MarketPage.module.css";

export default function MarketCatalog({ params }: { params: CatalogQuery }) {
  const query = params.q?.trim() ?? "";
  const area = WORK_AREAS.some((item) => item.id === params.area) ? params.area : undefined;
  const groups = findGroups(query, area, params.domain).filter((group) => !params.group || group.id === params.group);
  const window = pageWindow(groups.length, params.page);
  const displayed = groups.slice(window.start, window.end);
  const skillCount = new Set(groups.flatMap((group) => group.skillIds)).size;
  const state = { ...params, area, q: query, page: String(window.page) };
  const returnTo = `${catalogUrl(state)}#catalog`;
  return <div className={styles.page}>
    <MarketChrome active="market" />
    <main className={styles.libraryMain}>
      <header className={styles.libraryHeader}>
        <div className={styles.libraryBreadcrumb}><Link href="/">AutoMage</Link><span>/</span><span>能力库</span></div>
        <div className={styles.libraryHeaderLine}><div><p className={styles.libraryEyebrow}>AUTOMAGE PRODUCT <span aria-hidden="true">→</span> CAPABILITIES</p><h1>AutoMage 当前可展示的能力</h1><p className={styles.libraryLead}>这是 AutoMage 的公开能力库。按工作查找，按产出比较，了解这套系统当前能够承载什么。</p></div><Link className={styles.libraryParent} href="/">回到产品概览 <span aria-hidden="true">↗</span></Link></div>
        <div className={styles.libraryStats}><span>{SKILL_GROUPS.length} 类工作</span><span>{skillCatalog.getAll().length} 个 Skill</span><span>公开能力索引</span></div>
      </header>
      <div className={styles.workspace} id="catalog">
        <nav className={styles.areas} aria-label="工作领域"><Link className={styles.areaLink} href={`${catalogUrl({})}#catalog`} aria-current={!area && !params.domain && !query ? "true" : undefined}>全部工作<span>{SKILL_GROUPS.length}</span></Link>{WORK_AREAS.map((item) => <Link key={item.id} className={styles.areaLink} href={`${catalogUrl({ area: item.id, q: query })}#catalog`} aria-current={area === item.id ? "true" : undefined}>{item.title}<span>{SKILL_GROUPS.filter((group) => group.area === item.id).length}</span></Link>)}</nav>
        <div className={styles.catalogBody}>
          <form className={styles.toolbar} action="/market#catalog" method="get"><input type="hidden" name="view" value="all" />{area && <input type="hidden" name="area" value={area} />}{params.domain && <input type="hidden" name="domain" value={params.domain} />}<div className={styles.searchWrap}><Search className={styles.searchIcon} size={17} aria-hidden="true" /><input className={styles.search} name="q" type="search" aria-label="搜索工作或 Skill" defaultValue={query} placeholder="例如：客户流失、采购比价、视频脚本" key={query} /></div><button className={styles.ghost} type="submit">搜索</button></form>
          <div className={styles.resultLine}><span>{groups.length} 类工作 · {skillCount} 个 Skill{params.domain ? ` · 原分类：${params.domain}` : ""}</span>{(query || area || params.domain || params.group) && <Link href="/market#catalog">清除筛选</Link>}</div>
          {groups.length ? <><ul className={styles.groupList}>{displayed.map((group) => <li key={group.id}><SkillGroupCard group={group} returnTo={returnTo} query={query} expanded={Boolean(params.group)} /></li>)}</ul><nav className={styles.pager} aria-label="任务分页">{window.page > 1 && <Link className={styles.pageLink} href={`${catalogUrl({ ...state, page: String(window.page - 1) })}#catalog`}>← 上一页</Link>}{Array.from({ length: window.pages }, (_, i) => <Link key={i} className={styles.pageLink} href={`${catalogUrl({ ...state, page: String(i + 1) })}#catalog`} aria-current={window.page === i + 1 ? "page" : undefined} aria-label={`第 ${i + 1} 页`}>{i + 1}</Link>)}{window.page < window.pages && <Link className={styles.pageLink} href={`${catalogUrl({ ...state, page: String(window.page + 1) })}#catalog`}>下一页 →</Link>}</nav></> : <div className={styles.empty}><h3>暂时没有匹配的任务</h3><p>试试更短的关键词，或清除当前领域限制。<br />也可以把具体问题告诉我们，一起判断适合的做法。</p><Link className={styles.ghost} href="/market#catalog">查看全部工作</Link>{" "}<Link className={styles.primary} href={`/contact?${new URLSearchParams({ need: query })}`}>带着问题聊聊</Link></div>}
        </div>
      </div>
      <section className={styles.callout}><div><h2>能力可以组合，工作需要上下文。</h2><p>了解 AutoMage 如何连接信息、人的判断与后续行动。</p></div><Link className={styles.ghost} href="/">了解 AutoMage <span aria-hidden="true">↗</span></Link></section>
    </main><MarketFooter />
  </div>;
}
