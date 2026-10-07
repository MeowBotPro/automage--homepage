import { N, WORK, delivered, shortfall, spotExtra, v1Option, type Source } from "./supply-chain-world";

/* The homepage stage uses the same supply-chain work as /scenarios/supply-chain (SC-0817): same facts,
   people and sources. It shares the case, not the plot. The stage makes two claims: scattered messages
   become one piece of work AutoMage can take on; the same change in the world ends differently under two
   delegation boundaries. The days, the sign-off, the reopening and rewriting a rule yourself belong to
   the supply-chain page. */

const PLAN = "split" as const;

export { WORK };

export interface Fragment {
  id: string;
  who: string;
  via: string;
  at: string;
  text: string;
  alert?: boolean;
  /** Resting position on the stage, in % of the visual box. */
  x: number;
  y: number;
  far?: boolean;
  /** The place on the work this message lands on: a fact it becomes, or the next step it feeds. */
  to: string;
  /** Resting tilt in degrees; straightens as the message lands. */
  r: number;
}

/** Places on the record, top to bottom; messages land in this order. The alert becomes the work itself;
    the others shrink into the source tag of the line they become. */
export const LANDING = ["head", "stock", "regular", "orders", "gap", "u-huanan", "next"];

export const FRAGMENTS: Fragment[] = [
  { id: "wms", who: "WMS", via: "库存预警", at: "第 0 天 09:42", text: `PA66 树脂账面 ${N.book}t，按当前排产约第 12 天跌破安全库存。`, alert: true, x: 2, y: 6, r: -1.2, to: "head" },
  { id: "srm", who: "SRM", via: "供应商 A 回复", at: "第 1 天 14:10", text: `常规批次 ${N.regular}t 新交期：第 ${N.regularDay} 天（对方产线检修）。`, x: 58, y: 1, r: 1, far: true, to: "regular" },
  { id: "liu", who: "刘敏 · 仓库", via: "群聊", at: "第 1 天 08:55", text: `${N.book}t 里有 ${N.frozen}t 在质检冻结，能用的是 ${N.stock}t。`, x: 31, y: 21, r: 0.8, to: "stock" },
  { id: "zhou", who: "周婷 · 销售", via: "群聊", at: "第 1 天 10:30", text: "C 是汽车客户，合同有延期罚则，不能拖。", x: 60, y: 37, r: -1.5, far: true, to: "orders" },
  { id: "huang", who: "黄海 · 华南仓", via: "群聊", at: "第 2 天 09:20", text: `最多能调 ${N.transfer}t，再多我们自己也要跌破安全线。`, x: 0, y: 40, r: 1.2, far: true, to: "u-huanan" },
  { id: "zhao", who: "赵磊 · 采购", via: "群聊", at: "第 2 天 10:05", text: `B 能供 100t，¥17,600/t，第 ${N.supplyDay} 天到；C 有现货 ${N.spotC}t。`, x: 35, y: 55, r: -0.6, to: "next" },
  { id: "sun", who: "孙倩 · 财务", via: "群聊", at: "第 2 天 10:40", text: `昨天在外面，刚看到。本月原料预算还剩 ${N.budget} 万。`, x: 60, y: 66, r: 1.4, far: true, to: "next" },
  { id: "chen", who: "陈工 · 生产计划", via: "群聊", at: "第 2 天 11:15", text: "订单 E 真不够可以先停几天，要销售先跟客户说好。", x: 6, y: 69, r: -1, to: "next" },
];

export const FIELD_NOTE = "同一件缺料，散在八条消息里，没有一处看得到全貌";

export interface Line {
  id: string;
  kind: "fact" | "inference" | "unknown";
  label: string;
  value: string;
  source: Source;
}

export const KNOWN: Line[] = [
  { id: "stock", kind: "fact", label: "可用库存", value: `${N.stock}t（${N.frozen}t 在质检冻结）`, source: { who: "刘敏 · 仓库主管", via: "群聊；WMS 冻结标记已核对", at: "第 1 天 08:55" } },
  { id: "regular", kind: "fact", label: `常规批次 ${N.regular}t`, value: `第 ${N.regularDay} 天才到`, source: { who: "SRM", via: "供应商 A 回复", at: "第 1 天 14:10" } },
  { id: "orders", kind: "fact", label: "依赖订单", value: "3 个；订单 C 不可延期", source: { who: "周婷 · 销售经理", via: "群聊；ERP 订单关联", at: "第 1 天 10:30" } },
  { id: "gap", kind: "inference", label: "缺口", value: `第 12 天跌破安全线；需另补 ${N.gap}t`, source: { who: "AutoMage", via: `依据：可用 ${N.stock}t、日用 ${N.use}t、安全线 ${N.safety}t、常规批次第 ${N.regularDay} 天到`, at: "第 1 天 14:12" } },
];

/** The next step on the record was put together from three people's replies on day 2. */
export const NEXT_SOURCE: Source = { who: "赵磊、孙倩、陈工", via: "群聊：补料报价、预算余量、订单 E 能否暂停", at: "第 2 天" };

export const UNKNOWN: Line = {
  id: "u-huanan",
  kind: "unknown",
  label: "华南仓调出后，自己下周够不够用",
  value: "黄海口头说「能顶住」，没有书面",
  source: { who: "黄海 · 华南仓主管", via: "群聊", at: "第 2 天 09:20" },
};

/** The plan in force when the change arrives: plan A, approved by the supply-chain lead. */
export const PLAN_A = v1Option(PLAN);
export const PLAN_SIGNED: Source = { who: "供应链负责人", via: "签批（委托第 4 条：新的采购或调拨方案须签批）", at: "第 3 天 16:40" };
export const BROKEN = PLAN_A.premises.find((premise) => premise.id === "p-b")!;
export const INTACT = PLAN_A.premises.length - 1;
export const GOT = delivered(PLAN);
export const SHORT = shortfall(PLAN);
export const EXTRA = spotExtra(PLAN);

/** The change in the world: it arrives like the first eight messages and lands on the premise it breaks. */
export const CHANGE: Fragment & { source: Source } = {
  id: "change",
  who: "赵磊 · 采购",
  via: "转述供应商 B 邮件",
  at: "第 6 天 10:20",
  text: `供应商 B 一批原料检验不合格：第 ${N.supplyDay} 天只能交 ${GOT}t。`,
  alert: true,
  x: 44,
  y: 54,
  r: 1.4,
  to: "change",
  source: { who: "赵磊 · 采购", via: "转述供应商 B 邮件；SRM 交期变更", at: "第 6 天 10:20" },
};

/** The same change under two delegation boundaries. The facts are identical; only the delegation's line
    on changes during execution differs (the supply-chain page's two rules, worded for the homepage). */
export const BOUNDARIES = [
  {
    id: "back",
    tone: "human",
    rule: "执行中出现任何变化：回来找人确认",
    result: "回到负责人手上",
    status: "等负责人决定",
    detail: "带着方案 A 为什么成立、这次变了什么，和两个处理办法。",
  },
  {
    id: "within",
    tone: "ai",
    rule: `额外成本不超过已批金额 ${N.limit}%：自己调整，事后报备`,
    result: "AutoMage 自己补上",
    status: "已报备",
    detail: `缺的 ${SHORT}t 改由供应商 C 现货补，多花 ¥${EXTRA.wan.toFixed(1)} 万，占已批金额 ${EXTRA.pct}%。负责人收到一张报备。`,
  },
] as const;

export const CLAIMS = [
  {
    id: "work",
    kicker: "把工作交给它",
    title: "八条消息，接成一件它能接手的工作",
    text: "说的是同一件缺料，却散在预警、供应商回复和几个人的群聊里。AutoMage 按委托接下来：事实、测算和还不知道的分开写，每一条都标着是谁、什么时候说的；目标和下一步写在同一张单子上。委托里也写明了，它能自己做到哪、什么时候必须回来找人。",
    status: `工作单 ${WORK.id}：AutoMage 跟进中`,
  },
  {
    id: "boundary",
    kicker: "规矩由你们定",
    tag: "产品方向 · 模拟",
    title: "同一个变化，委托边界不同，结果就不同",
    text: `执行途中，供应商 B 一批原料检验不合格，只能交 ${GOT}t，方案 A 的一个前提不成立了。事实一模一样，差别只在委托里的这一条：变化都要回来找人，它就带着依据回到负责人手上；额外成本在 ${N.limit}% 以内可以自己调整，它就自己补上，负责人只收到一张报备。`,
    status: "同一个变化，两种委托边界：一种回到负责人手上，一种由 AutoMage 自己补上并报备",
  },
] as const;
