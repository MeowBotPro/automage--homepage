export type CapabilityCategory = "管理与组织" | "项目与交付" | "运营与供应链";

export interface PrototypeCapability {
  id: string;
  index: string;
  category: CapabilityCategory;
  title: string;
  summary: string;
  outcome: string;
  inputs: string[];
  output: string;
  gate: string;
  agents: string[];
  skills: string[];
}

export const PROTOTYPE_PLAN_STORAGE_KEY = "automage.prototype.capability-plan.v1";
export const DEFAULT_CAPABILITY_IDS = ["management-brief"];

export const CAPABILITY_CATEGORIES = [
  "全部",
  "管理与组织",
  "项目与交付",
  "运营与供应链",
] as const;

export const CAPABILITY_CATALOG: PrototypeCapability[] = [
  {
    id: "management-brief",
    index: "01",
    category: "管理与组织",
    title: "管理层每日简报",
    summary: "把跨团队信号压缩成每天真正需要管理层判断的事项。",
    outcome: "每天固定时间形成一份有来源、有责任人的管理简报。",
    inputs: ["企业 IM", "日报数据", "组织目录"],
    output: "每日 Brief · 待判断事项 · 责任人",
    gate: "创建正式任务前由负责人确认",
    agents: ["信息汇总 Agent", "管理简报 Agent"],
    skills: ["日报读取", "信息压缩", "责任人映射", "简报投递"],
  },
  {
    id: "daily-rollup",
    index: "02",
    category: "管理与组织",
    title: "日报智能汇总",
    summary: "将不同格式的日报整理成团队进展、风险与缺口。",
    outcome: "减少重复汇报，让异常事项在当天被看见。",
    inputs: ["企业 IM", "日报数据"],
    output: "团队进展 · 风险摘要 · 缺失信息",
    gate: "追问信息可自动，绩效判断不可自动",
    agents: ["日报整理 Agent"],
    skills: ["日报采集", "格式归一", "风险提取"],
  },
  {
    id: "project-risk",
    index: "03",
    category: "项目与交付",
    title: "项目风险雷达",
    summary: "从项目群、任务系统与代码进展中识别延期和依赖风险。",
    outcome: "风险在成为延期之前进入负责人视野。",
    inputs: ["企业 IM", "项目系统", "代码仓库"],
    output: "风险简报 · 关键未知 · 恢复建议",
    gate: "修改优先级与排期前由项目负责人确认",
    agents: ["项目观察 Agent", "风险调查 Agent"],
    skills: ["状态聚合", "依赖识别", "延期风险分析"],
  },
  {
    id: "cross-team-blocker",
    index: "04",
    category: "项目与交付",
    title: "跨团队阻塞发现",
    summary: "持续识别等待、责任空缺和没有被接住的跨部门事项。",
    outcome: "把隐形等待变成有 owner、有下一步的事件。",
    inputs: ["企业 IM", "项目系统", "组织目录"],
    output: "阻塞清单 · 责任缺口 · 升级建议",
    gate: "跨部门升级前由业务负责人确认",
    agents: ["阻塞观察 Agent", "协同推进 Agent"],
    skills: ["等待识别", "责任映射", "上下文交接"],
  },
  {
    id: "delivery-watch",
    index: "05",
    category: "项目与交付",
    title: "客户交付预警",
    summary: "聚合客户承诺、里程碑和异常，提前暴露交付风险。",
    outcome: "让客户承诺与内部真实进度持续对齐。",
    inputs: ["企业 IM", "CRM", "项目系统"],
    output: "交付风险 · 承诺差异 · 沟通建议",
    gate: "对外发送承诺前由客户负责人确认",
    agents: ["交付观察 Agent", "客户升级 Agent"],
    skills: ["承诺提取", "里程碑对齐", "风险升级"],
  },
  {
    id: "supply-exception",
    index: "06",
    category: "运营与供应链",
    title: "供应链异常处理",
    summary: "把库存、订单和交期异常组织成可审阅的处置方案。",
    outcome: "一条异常持续推进到授权、执行与回执。",
    inputs: ["ERP / WMS", "企业 IM", "供应商数据"],
    output: "影响范围 · 处置方案 · 执行回执",
    gate: "采购、资金和对外承诺由责任人授权",
    agents: ["供应链事件 Agent", "方案调查 Agent"],
    skills: ["库存检查", "订单影响分析", "供应商履约分析"],
  },
];

export const CONSOLE_NAV_ITEMS = [
  { id: "overview", label: "总览", hint: "企业级状态" },
  { id: "automage", label: "我的 AutoMage", hint: "能力与范围" },
  { id: "environments", label: "环境", hint: "云端与私有运行" },
  { id: "integrations", label: "集成", hint: "系统连接" },
  { id: "governance", label: "治理", hint: "角色与授权" },
  { id: "organization", label: "企业设置", hint: "成员与服务" },
] as const;

export type ConsoleNavId = (typeof CONSOLE_NAV_ITEMS)[number]["id"];
