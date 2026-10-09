import type { SkillCatalog, SkillRecord } from "./skill-catalog";

export const WORK_AREAS = [
  { id: "customers", title: "销售与客户" },
  { id: "service", title: "客服与协同" },
  { id: "trade", title: "采购与外贸" },
  { id: "commerce", title: "电商运营" },
  { id: "legal", title: "法律与合规" },
  { id: "finance", title: "财务与投资" },
  { id: "creative", title: "内容与设计" },
] as const;

export type WorkArea = (typeof WORK_AREAS)[number]["id"];
export type SkillGroup = {
  id: string;
  area: WorkArea;
  title: string;
  description: string;
  guide: string;
  skillIds: string[];
  keywords: string;
};

// Order is editorial: the first member is an entry point for this task, not a quality ranking.
export const SKILL_GROUPS: SkillGroup[] = [
  { id: "customer-retention", area: "customers", title: "理解客户流失，准备挽回", description: "把客户为什么离开、下一次怎么留住分开处理。", guide: "已经流失，先做复盘；正在取消订阅，比较挽回流程；要看整体策略，再看客户成功顾问。", keywords: "客户 流失 留存 复盘 churn 客户成功", skillIds: ["churn-autopsy", "churn-prevention", "chief-customer-officer-advisor"] },
  { id: "sourcing", area: "trade", title: "找货源，比较候选商品", description: "区分实际查找商品与采购方法指导，按你的问题选择。", guide: "要查询商品，先看找货比价；两套 1688 指导材料有较多重叠，通常择一了解；比较国内零售价格可看电商比价。", keywords: "采购 供应商 找货 寻源 比价 1688", skillIds: ["1688-product-find", "1688-sourcing-agent", "1688-procurement-agent", "maishou"] },
  { id: "video-writing", area: "creative", title: "把一个想法写成可拍的脚本", description: "把长文、产品介绍或知识点，转成口播、分镜与发布文案。", guide: "已有内容需要改编，先看短视频口播脚本；只想改开头，看钩子脚本；做长期选题，用内容日历。", keywords: "短视频 脚本 分镜 口播 内容 文章 选题", skillIds: ["short-video-script-skill", "short-video-script", "script", "video-content-strategist", "video-copy-analyzer", "content-production", "social-content", "lingzao-skill"] },
  { id: "inbound-sales", area: "customers", title: "接住询盘，判断下一步", description: "从客户对话中补齐需求，形成资格判断与跟进记录。", guide: "适合已经有客户来询问产品、需要统一问答和交接方式的团队。", keywords: "销售 客户 询盘 线索 对话 资格", skillIds: ["b2b-sales-agent"] },
  { id: "contracts", area: "legal", title: "审阅合同，形成修订意见", description: "识别条款问题、准备红线修订，或起草商务合同。", guide: "审风险先看合同红线审查；需要可编辑修订稿，看合同修订稿；起草合同与审核合同是不同任务。", keywords: "合同 法务 审查 修订 NDA 法律", skillIds: ["claude-legal-skill", "legal-redline-tools", "transaction-legal-skills", "gc-review", "general-counsel-advisor", "contract-and-proposal-writer", "commercial-legal-pl", "internet-court-skill"] },
  { id: "customer-support", area: "service", title: "让客服回复与转交有章可循", description: "整理服务规范，分流问题，按沟通渠道准备应答。", guide: "先用客服 SOP 明确处理方式；企微、台湾电商和特定产品客服有各自条件，按实际渠道选择。", keywords: "客服 工单 客诉 企业微信 企微 分流 回复", skillIds: ["cs-sop", "support-ticket-triage", "wecom-ai-customer-service", "tw-ecom-operations-customer-service", "cs-chatbot-design", "social-reply-bot", "happycapy-customer-service", "pollyreach"] },
  { id: "account-research", area: "customers", title: "拜访前，把客户研究清楚", description: "整理客户背景、购买线索、会前问题与售前材料。", guide: "通用客户背景从卷宗开始；大客户调研与攻单策略来自特定销售方法，使用前确认与你的业务是否匹配。", keywords: "客户 背调 调研 拜访 售前 招标", skillIds: ["lead-dossier", "account-research", "account-strategy", "discovery-playbook", "sales-prep", "sales-engineer"] },
  { id: "outreach", area: "customers", title: "开发客户，安排连续跟进", description: "寻找潜在客户，准备开发信，组织后续触达。", guide: "只需要邮件文案，从 B2B 开发信开始；需要找线索或持续跟进，再比较开发流水与 SDR。", keywords: "销售 外贸 开发信 邮件 获客 SDR 线索 展会", skillIds: ["b2b-cold-outreach", "cold-email", "auto-trade-customer-development", "b2b-lead-generation", "b2b-sdr-agent", "sales-outreach", "b2b-email-intel", "b2b-exhibition", "predictable-revenue", "ai-sales-team-claude"] },
  { id: "crm-records", area: "customers", title: "整理客户档案与跟进状态", description: "查找、导入、同步客户资料，或整理当日跟进重点。", guide: "先按已有 CRM 选择：HubSpot、Zoho 与 Cordys 不能互相替代；查询、导入与同步也有不同操作范围。", keywords: "客户 CRM 管道 档案 记录 同步 导入 HubSpot Zoho", skillIds: ["crm-lookup", "aigtm-crm", "crm-sync", "lead-import", "magnus919-crm", "zoho", "cordys-crm", "revops-salesforce", "sales-pipeline"] },
  { id: "commercial-decisions", area: "customers", title: "准备成交条件与异议应答", description: "核对折扣、毛利和例外条件，再准备谈判与应答。", guide: "具体交易先看成交审查；制定长期折扣规则看折扣与例外；现场回应客户用异议话术。", keywords: "销售 报价 折扣 谈判 毛利 成交", skillIds: ["deal-desk", "commercial-policy", "commercial-skills", "sales-objections"] },
  { id: "growth", area: "customers", title: "选择获客方式与增长动作", description: "评估免费工具、付费投放、搜索和竞品对比等获客路径。", guide: "按获客方式选择；免费工具评估、投放计划和管理顾问提供的是不同层次的建议。", keywords: "增长 获客 SEO 搜索 投放 市场", skillIds: ["free-tool-strategy", "marketing-demand-acquisition", "competitor-alternatives", "gingiris-b2b-growth", "cro-advisor"] },
  { id: "sales-reporting", area: "customers", title: "把销售进展整理成复盘材料", description: "从管道或询盘记录中准备报告，支持周会和经营讨论。", guide: "需要文件交付看管道报告 PDF；分析运营指标看收入运营；外贸询盘周会用询盘复盘。", keywords: "销售 报告 汇报 复盘 询盘 周会", skillIds: ["sales-report-pdf", "revenue-operations", "b2b-inquiry-meeting"] },
  { id: "service-operations", area: "service", title: "规划客服人力与沟通节奏", description: "用服务数据准备排班、质量分析、通知和内部沟通。", guide: "排班与编制从客服人力规划开始；质量分析、客户通知与内部通知分别选择。", keywords: "客服 排班 编制 人力 指标 通知 协同", skillIds: ["capacity-planner", "cs-analytics", "cs-notification-strategy", "internal-comms"] },
  { id: "supplier-evaluation", area: "trade", title: "评估供应商与采购条件", description: "围绕地区、交期、风险与已有订单，准备采购判断材料。", guide: "找产地看地区建议；评估合作方看供应商评分；询价与采购周期审计各自处理具体环节。", keywords: "采购 供应链 供应商 交期 订单 询价 风险", skillIds: ["aes-product-sourcing-advisor", "vendor-management", "procurement-optimizer", "1688-supplychain-order-inquiry"] },
  { id: "trade-research", area: "trade", title: "核对贸易信息与合规条件", description: "研究买家、海关税号、行业变化和跨境上架条件。", guide: "寻找买家用海关数据；核税号用关税报告；行业研究与贸易热点更适合持续观察。", keywords: "外贸 海关 税号 关税 买家 合规 行业", skillIds: ["b2b-customs-data", "customs-trade-report", "b2b-trade-compliance", "industry-research-system", "tradehot"] },
  { id: "trade-documents", area: "trade", title: "准备报价、单证与含税测算", description: "把产品、条款和交易资料转成商务文件。", guide: "要报价单、PI 或合同，看单证起草；要核对含税价格，选择定价测算。", keywords: "外贸 采购 报价 单证 PI 合同 税务", skillIds: ["b2b-doc-generation", "1688-finance-tax"] },
  { id: "product-research", area: "commerce", title: "判断商品机会与用户需求", description: "比较品类、评论痛点和产品需求，准备选品判断。", guide: "已有评论，先看评价痛点；判断能否进入新品类，比较选品评估；DTC 方案侧重咨询。", keywords: "电商 选品 产品 需求 评论 亚马逊 退货", skillIds: ["review-analysis", "category-selection", "zach-product-research", "zach-feature-demand-validator", "afa-product"] },
  { id: "listing", area: "commerce", title: "把商品资料整理成上架内容", description: "准备商品标题、卖点、关键词与平台所需的资料。", guide: "按上架平台选择亚马逊或 Ozon；只需要改标题或描述时，选对应的单项能力。", keywords: "电商 上架 商品 标题 Listing 亚马逊 Ozon", skillIds: ["product-description-generator", "amazon-listing-builder", "1688-product-to-ozon", "b2b-product-description", "product-title-optimization", "keyword-research"] },
  { id: "store-improvement", area: "commerce", title: "找出店铺与投放的改进点", description: "检查页面、搜索词和视觉内容，整理可讨论的优化动作。", guide: "页面转化、广告搜索词和 Listing 健康检查使用不同数据；先选你能提供材料的环节。", keywords: "电商 店铺 广告 转化 搜索 SEO Listing", skillIds: ["conversion-rate-optimization", "zach-listing-health-checker", "zach-search-term-report-analyzer", "ecommerce-landing-page", "product-page-seo", "store-teardown", "afa-launch"] },
  { id: "product-creative", area: "commerce", title: "制作商品主图与广告素材", description: "围绕商品信息和平台要求，准备视觉素材与创意方案。", guide: "主图、整套详情页与广告创意矩阵是不同交付物；先确定需要什么，再选择工具。", keywords: "电商 主图 海报 详情页 广告 创意 图片", skillIds: ["ecommerce-designer", "gpt-image2-ecommerce", "design-pipeline", "afa-creative"] },
  { id: "finance-operations", area: "finance", title: "整理收支、预算与财务分析", description: "记录收入支出，核对财务报表，准备预算与现金流材料。", guide: "日常收支看小企业记账；报表分析看财务分析；公司模型与研发预算另有侧重。", keywords: "财务 财税 记账 账本 预算 现金流 收支", skillIds: ["startup-bookkeeper", "openclaw-accounting", "financial-analyst", "cfo-advisor", "research-finance"] },
  { id: "tax-filing", area: "finance", title: "按地区准备税务申报", description: "为不同司法辖区整理所需材料与申报流程。", guide: "先按地区筛选。中国零申报、印度、荷兰、美国及孟加拉税务不能互换；印度条目再区分准备、报告和提交。", keywords: "财税 税务 报税 申报 中国 印度 荷兰 美国 孟加拉", skillIds: ["zero-tax-filing-cn", "itr-prep-skill", "itr-ca-report", "india-itr-copilot", "file-itr-india", "open-itr", "nl-tax-agent-skills", "us-foreign-llc-tax-filing", "bd-income-tax-skills"] },
  { id: "investment-research", area: "finance", title: "整理行情与投资研究材料", description: "获取市场数据，准备估值、研报、尽调或个人财务分析。", guide: "数据查询、研究分析与账户交易是不同任务；按市场、资料来源和需要的产出选择。", keywords: "财务 投资 行情 A股 研报 尽调 估值", skillIds: ["financial-analyst", "equity-research-skill", "a-stock-data", "tushare-finance-skill", "waditu-tushare-skills", "ai-berkshire", "buffet-analyst", "investment-masters", "private-equity-investment-dd-skill", "claude-finance", "finance-assistant", "personal-finance-skill", "agentic-trading-desk"] },
  { id: "legal-research", area: "legal", title: "找到适用的法律分析方法", description: "按地区与问题类型查找法律咨询、案例与执业领域资料。", guide: "劳动争议先看劳动法；综合法律包按地区和覆盖内容比较，子技能数量不代表适用程度。", keywords: "法律 法务 劳动法 合规 中国 案例 律师", skillIds: ["claude-skill-labor-lawyer", "legal-skills-cn", "Legal-Skills-Chinese", "greater-china-legal", "claude-for-legal-ZH", "excel1949-cn-legal-skills", "cat-xierluo-legal-skills", "awesome-legal-aiagent-skills", "FachuanHybridSystem", "law-ye-skill", "china-lawyer-analyst", "luoxiang-skill"] },
  { id: "compliance", area: "legal", title: "准备合规与安全核查", description: "对照监管要求、隐私规则和安全问题，整理差距与材料。", guide: "先确认地区和监管主题。GDPR、智利数据法、器械申报与安全测试的适用条件各不相同。", keywords: "法律 合规 安全 隐私 GDPR 法规 审计", skillIds: ["compliance-readiness", "compliance-os", "cyber-compliance-mapper", "compliance-cl", "ciso-advisor", "gdpr-audit-prep", "gdpr-dsgvo-expert", "regulatory-affairs-head", "guardian-cli"] },
  { id: "office-documents", area: "creative", title: "把材料做成可编辑的文档", description: "创建、读取和修改 Word、表格、PDF 与演示文稿。", guide: "按交付文件选 Word、Excel、PDF 或 PPT；需要共同梳理内容时，看文书共创。", keywords: "文档 合同 报告 Word Excel PPT PDF 表格 演示", skillIds: ["docx", "xlsx", "pdf", "pptx", "ppt-image-first", "doc-coauthoring"] },
  { id: "video-editing", area: "creative", title: "把长素材变成可剪辑的内容", description: "整理字幕、切出片段，或生成可继续编辑的视频工程。", guide: "要短片段看长视频切短；要剪映工程看剪映编辑；YouTube 文稿只负责文字与检索。", keywords: "视频 剪辑 切片 字幕 剪映 YouTube", skillIds: ["shorts", "clipify", "youtube-clipper", "youtube-full", "jianying-editor", "qiaomu-cut", "narrator-ai-cli"] },
  { id: "video-production", area: "creative", title: "准备生成视频与解说动画", description: "为不同制作方式提供提示词、白板、解说或产品演示方案。", guide: "已有视频生成工具，先看提示词；需要白板或产品演示，选择对应制作方式。", keywords: "视频 生成 动画 即梦 Seedance 解说 白板", skillIds: ["seedance", "seedance-20", "whiteboard-video", "vox-director", "demo-video"] },
  { id: "image-production", area: "creative", title: "按工具与工作流生成图像", description: "将提示和视觉要求交给对应的生成工具或工作流。", guide: "先按已有环境选即梦、ComfyUI 或其他模型；多工具路由与整套视觉导演承担不同范围。", keywords: "图文 生成 图片 生图 即梦 ComfyUI 视觉", skillIds: ["image-router", "comfyui-agent-skill", "ComfyUI_Skills_OpenClaw", "dreamina-cli-skill", "jimeng-cli-free", "chatgpt-imagegen", "nano-image-generator-skill", "ai-visual-director"] },
  { id: "social-creative", area: "creative", title: "制作图文、封面与文章配图", description: "为不同内容渠道准备笔记、社交卡片、插画和海报。", guide: "完整笔记先看小红书笔记；只做封面、文章插图或特定风格卡片时，选择对应单项。", keywords: "图文 小红书 内容 封面 配图 海报 社交", skillIds: ["xhs-note-creator", "xhs-imagen", "xhs-cover-skill", "guizang-social-card-skill", "Document-illustrator-skill", "gimi-illustration-skill", "poster-design-skill"] },
  { id: "brand-interface", area: "creative", title: "设计标志、图标与界面", description: "准备品牌标志、成组图标和可进一步实现的界面。", guide: "标志、图标与交互界面的产出不同；界面草图转代码与设计系统生成分别比较。", keywords: "图文 设计 品牌 Logo UI 界面 图标", skillIds: ["logo-generator-skill", "oil-icon", "draw-ui", "taste-skill"] },
  { id: "brand-discovery", area: "customers", title: "了解品牌在 AI 回答中的表现", description: "对照多个 AI 引擎的回答，整理品牌被提及的情况。", guide: "适合已有品牌、希望对照生成式搜索结果的团队；需要收集并提供各引擎的回答。", keywords: "品牌 GEO 曝光 AI 搜索 营销", skillIds: ["geo-effect-validator"] },
];

/** A group's skills in this catalog: every skill listed under the group, in the group's editorial order —
    the members named above first, then any the skill index adds to it, in index order. */
export function groupSkills(group: SkillGroup, catalog: SkillCatalog): SkillRecord[] {
  const rank = (skill: SkillRecord) => {
    const at = group.skillIds.indexOf(skill.id);
    return at < 0 ? group.skillIds.length : at;
  };
  return catalog.getAll()
    .filter((skill) => skill.groups.includes(group.id))
    .map((skill, order) => ({ skill, order }))
    .sort((a, b) => rank(a.skill) - rank(b.skill) || a.order - b.order)
    .map(({ skill }) => skill);
}

export function groupsForSkill(skill: SkillRecord): SkillGroup[] {
  return skill.groups.map((id) => SKILL_GROUPS.find((group) => group.id === id)).filter((group) => group !== undefined);
}

export function searchTerms(query: string) {
  const aliases: Record<string, string> = { "采购比价": "采购 比价", "视频脚本": "视频 脚本", "客户复盘": "客户 复盘", "制作视频": "视频 制作", "合同审核": "合同 审查", "报税": "税务" };
  let normalized = query.toLowerCase().trim();
  for (const [phrase, words] of Object.entries(aliases)) normalized = normalized.replaceAll(phrase, words);
  return normalized.split(/\s+/).filter(Boolean);
}

/** The groups that match, among those with at least one skill in this catalog. */
export function findGroups(catalog: SkillCatalog, query: string, area?: string, domain?: string) {
  const terms = searchTerms(query);
  return SKILL_GROUPS.filter((group) => {
    if (area && group.area !== area) return false;
    const skills = groupSkills(group, catalog);
    if (!skills.length) return false;
    if (domain && !skills.some((skill) => skill.domain === domain)) return false;
    const text = [group.title, group.description, group.keywords, ...skills.map((s) => `${s.id} ${s.title} ${s.summary} ${s.domain} ${s.output} ${s.keywords.join(" ")}`)].join(" ").toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}
