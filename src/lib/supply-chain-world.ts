// Deterministic 14-day scenario for /scenarios/supply-chain.
// Everything here is demo content reconstructed from a real enterprise scenario;
// nothing reads or writes a business system.

export type Layer = "enterprise" | "automage" | "boundary";
export type Run = "first" | "replay";
export type Rule = "confirm_all" | "within_5";
export type V1Choice = "split" | "single";
export type V2Choice = "spot" | "reschedule";
export type ClaimKind = "fact" | "inference" | "unknown";
export type Act =
  | "接手" | "取数" | "核对" | "追问" | "测算" | "整理" | "分派" | "跟进"
  | "请你决定" | "发现变化" | "退回" | "自行调整" | "报备" | "关闭";

export interface Ctx {
  run: Run;
  rule: Rule;
  v1: V1Choice | null;
  v2: V2Choice | null;
}

export const LAST_DAY = 14;
export const V1_DAY = 3;
export const CHANGE_DAY = 6;
export const REPLAY_FROM = 5;
export const CHART_DAYS = 18;

export const WORK = {
  id: "SC-0817",
  title: "PA66 缺料风险",
  site: "华东工厂",
  material: "PA66 树脂（注塑原料）",
};

export const N = {
  book: 312,
  frozen: 12,
  stock: 300,
  use: 20,
  safety: 80,
  regular: 120,
  regularDay: 17,
  gap: 100,
  transfer: 50,
  transferDay: 8,
  supplyDay: 9,
  priceB: 17600,
  priceC: 18600,
  freight: 2,
  spotC: 40,
  budget: 210,
  delivered: 0.6,
  limit: 5,
};

export const PEOPLE = {
  you: { name: "你", role: "供应链负责人" },
  liu: { name: "刘敏", role: "仓库主管" },
  zhou: { name: "周婷", role: "销售经理" },
  chen: { name: "陈工", role: "生产计划" },
  zhao: { name: "赵磊", role: "采购" },
  huang: { name: "黄海", role: "华南仓主管" },
  sun: { name: "孙倩", role: "财务" },
} as const;

export type PersonId = keyof typeof PEOPLE;

export interface Source {
  who: string;
  via: string;
  at: string;
  ref?: string;
}

/* ── Delegation (委托) ── */

export interface DelegationTerm {
  id: string;
  label: string;
  text: string;
  returnsToYou?: boolean;
}

export const RULE_TEXT: Record<Rule, string> = {
  confirm_all: "已批准的方案在执行中出现任何变化：回来找你确认。",
  within_5: "已批准的方案在执行中出现变化：调整的额外成本不超过已批金额 5% 的，AutoMage 自行调整，事后向你报备；其他情况回来找你。",
};

export function delegationTerms(rule: Rule): DelegationTerm[] {
  return [
    { id: "d1", label: "交给它的工作", text: "原料缺料风险：从预警开始跟进，直到风险解除。" },
    { id: "d2", label: "目标", text: "守住安全库存；订单 C 不延期。" },
    { id: "d3", label: "它可以自己做", text: "查询 WMS、ERP、MES、SRM；在群里追问相关同事；整理事实、推断和方案；方案批准后把任务派给具体的人，跟进对方的确认（回执）。" },
    { id: "d4", label: "须你签批", text: "新的采购或调拨方案。", returnsToYou: true },
    { id: "d5", label: "执行中出现变化", text: RULE_TEXT[rule], returnsToYou: true },
    { id: "d6", label: "不能自己做", text: "下采购单、修改系统数据、对客户或供应商做承诺。" },
    { id: "d7", label: "完成标准", text: "补货全部入库；测算守住安全线到常规批次到货；相关任务全部回执。" },
  ];
}

/* ── Decisions ── */

export interface V1Option {
  id: V1Choice;
  why?: string;
  name: string;
  plan: string;
  cash: number;
  bQty: number;
  good: string;
  cost: string;
  unknown: string;
  unknownSource: Source;
  suggested: boolean;
  premises: Premise[];
}

export interface Premise {
  id: string;
  text: string;
  source: Source;
}

const premiseRegular: Premise = {
  id: "p-regular",
  text: `主供应商常规批次第 ${N.regularDay} 天到货`,
  source: { who: "SRM", via: "供应商 A 回复", at: "第 1 天 14:10" },
};
const premiseUse: Premise = {
  id: "p-use",
  text: `排产日用量 ${N.use}t`,
  source: { who: "MES", via: "排产计划", at: "第 0 天 09:44" },
};

export const V1_OPTIONS: V1Option[] = [
  {
    id: "split",
    name: "方案 A · 调拨 + 采购",
    plan: `华南仓调拨 ${N.transfer}t（第 ${N.transferDay} 天到）+ 供应商 B 采购 50t（第 ${N.supplyDay} 天到）`,
    cash: 90,
    bQty: 50,
    good: "现金占用低；两个来源，一边出问题只影响一半。",
    cost: "华南仓降到自身安全线附近。",
    unknown: "华南仓调出 50t 后，下周华南客户备货是否够用——黄海口头说「能顶住」，没有书面确认。",
    unknownSource: { who: "黄海 · 华南仓主管", via: "群聊", at: "第 2 天 09:20" },
    suggested: true,
    why: "现金占用只有方案 B 的一半；补料分在两个来源，一边出问题只影响一半。",
    premises: [
      { id: "p-transfer", text: `华南仓第 ${N.transferDay} 天到货 ${N.transfer}t`, source: { who: "黄海 · 华南仓主管", via: "群聊", at: "第 2 天 09:20" } },
      { id: "p-b", text: `供应商 B 第 ${N.supplyDay} 天交付 50t`, source: { who: "赵磊 · 采购", via: "群聊 + SRM 报价单 Q-0212", at: "第 2 天 10:05" } },
      premiseRegular,
      premiseUse,
    ],
  },
  {
    id: "single",
    name: "方案 B · 一次采购",
    plan: `供应商 B 一次采购 100t（第 ${N.supplyDay} 天到）`,
    cash: 176,
    bQty: 100,
    good: "华南仓不动。",
    cost: "现金占用高；全部压在一家供应商上。",
    unknown: "供应商 B 一次交 100t 的产能——赵磊电话确认过，没有书面。",
    unknownSource: { who: "赵磊 · 采购", via: "电话后转述到群聊", at: "第 2 天 10:05" },
    suggested: false,
    premises: [
      { id: "p-b", text: `供应商 B 第 ${N.supplyDay} 天交付 100t`, source: { who: "赵磊 · 采购", via: "群聊 + SRM 报价单 Q-0212", at: "第 2 天 10:05" } },
      premiseRegular,
      premiseUse,
    ],
  },
];

export const v1Option = (id: V1Choice) => V1_OPTIONS.find((option) => option.id === id)!;

export function shortfall(v1: V1Choice) {
  const qty = v1Option(v1).bQty;
  return qty - qty * N.delivered;
}

export function delivered(v1: V1Choice) {
  return v1Option(v1).bQty * N.delivered;
}

export function spotExtra(v1: V1Choice) {
  const extraYuan = shortfall(v1) * (N.priceC - N.priceB);
  const wan = extraYuan / 10000;
  const pct = (wan / v1Option(v1).cash) * 100;
  return { wan, pct: Math.round(pct * 10) / 10 };
}

export interface V2Option {
  id: V2Choice;
  name: string;
  plan: string;
  extra: string;
  good: string;
  cost: string;
  basedOn: Source & { text: string };
  suggested: boolean;
}

export function v2Options(v1: V1Choice): V2Option[] {
  const short = shortfall(v1);
  const extra = spotExtra(v1);
  const pauseDays = short / 5;
  return [
    {
      id: "spot",
      name: "补缺口 · 供应商 C 现货",
      plan: `缺的 ${short}t 改由供应商 C 现货补，第 ${N.supplyDay} 天到。`,
      extra: `额外 ¥${extra.wan.toFixed(1)} 万（已批金额的 ${extra.pct}%）`,
      good: "守住安全线，客户交期不动。",
      cost: "多花一点钱。",
      basedOn: { text: `供应商 C 现货 ${N.spotC}t，¥18,600/t，今天已复核`, who: "赵磊 · 采购", via: "群聊（AutoMage 追问后复核）", at: "第 6 天 10:41" },
      suggested: true,
    },
    {
      id: "reschedule",
      name: "调整排产 · 订单 E 暂停",
      plan: `订单 E 暂停 ${pauseDays} 天，第 16 天前少用 ${short}t。`,
      extra: "不加钱",
      good: "不增加采购成本。",
      cost: "客户 E 的交期会往后推，需周婷先和客户谈。",
      basedOn: { text: "订单 E 每天用 5t 左右，可以先停几天", who: "陈工 · 生产计划", via: "群聊", at: "第 2 天 11:15" },
      suggested: false,
    },
  ];
}

export const v2Option = (v1: V1Choice, id: V2Choice) => v2Options(v1).find((option) => option.id === id)!;

/** In replay under the 5% rule AutoMage resolves the Day 6 change itself. */
export function autoResolves(ctx: Ctx) {
  return ctx.run === "replay" && ctx.rule === "within_5" && ctx.v1 !== null && spotExtra(ctx.v1).pct <= N.limit;
}

/** The v2 choice in effect: the visitor's in the first run, AutoMage's in an auto-resolved replay. */
export function effectiveV2(ctx: Ctx): V2Choice | null {
  return autoResolves(ctx) ? "spot" : ctx.v2;
}

/* ── Inventory projection ── */

export interface Arrival {
  day: number;
  qty: number;
  label: string;
}

export interface Projection {
  series: number[];
  arrivals: Arrival[];
  breachDay: number | null;
  stopDay: number | null;
  previous?: { series: number[]; label: string };
  label: string;
}

function series(base: number, arrivals: Arrival[], saved: Record<number, number> = {}) {
  const values: number[] = [];
  let stock = base;
  for (let day = 0; day <= CHART_DAYS; day += 1) {
    if (day > 0) stock = Math.max(0, stock - (N.use - (saved[day - 1] ?? 0)));
    stock += arrivals.filter((arrival) => arrival.day === day).reduce((sum, arrival) => sum + arrival.qty, 0);
    values.push(stock);
  }
  return values;
}

function firstBreach(values: number[]) {
  const index = values.findIndex((value) => value < N.safety);
  return index === -1 ? null : index;
}

function firstStop(values: number[]) {
  const index = values.findIndex((value) => value <= 0);
  return index === -1 ? null : index;
}

function project(values: number[], arrivals: Arrival[], label: string, previous?: Projection["previous"]): Projection {
  return { series: values, arrivals, breachDay: firstBreach(values), stopDay: firstStop(values), label, previous };
}

function plannedArrivals(v1: V1Choice, bQty: number): Arrival[] {
  const list: Arrival[] = [];
  if (v1 === "split") list.push({ day: N.transferDay, qty: N.transfer, label: "华南仓调拨" });
  list.push({ day: N.supplyDay, qty: bQty, label: "供应商 B" });
  return list;
}

function savedUse(v1: V1Choice): Record<number, number> {
  const days = shortfall(v1) / 5;
  const saved: Record<number, number> = {};
  for (let index = 0; index < days; index += 1) saved[N.transferDay + index] = 5;
  return saved;
}

export interface DecisionState {
  v1Signed: boolean;
  v2Signed: boolean;
}

export function projectionAt(day: number, ctx: Ctx, signed: DecisionState): Projection {
  const regular: Arrival = { day: N.regularDay, qty: N.regular, label: "常规批次" };
  if (day < 1) return project(series(N.book, []), [], "按账面库存测算");
  const noAction = series(N.stock, [regular]);
  if (!ctx.v1 || !signed.v1Signed || day < V1_DAY) return project(noAction, [regular], "不补料时的测算");
  const v1 = ctx.v1;
  const fullPlan = [...plannedArrivals(v1, v1Option(v1).bQty), regular];
  const fullValues = series(N.stock, fullPlan);
  if (day < CHANGE_DAY) return project(fullValues, fullPlan, "按 v1 测算");
  const reduced = [...plannedArrivals(v1, delivered(v1)), regular];
  const v2 = effectiveV2(ctx);
  const resolved = autoResolves(ctx) || signed.v2Signed;
  if (!v2 || !resolved) {
    return project(series(N.stock, reduced), reduced, "供应商 B 少交后的测算", { series: fullValues, label: "v1 签批时的测算" });
  }
  if (v2 === "spot") {
    const fixed = [...reduced, { day: N.supplyDay, qty: shortfall(v1), label: "供应商 C" }];
    return project(series(N.stock, fixed), fixed, autoResolves(ctx) ? "AutoMage 调整后的测算" : "按 v2 测算");
  }
  return project(series(N.stock, reduced, savedUse(v1)), reduced, "按 v2 测算（订单 E 暂停）");
}

/* ── Feed: what reaches the desk each day ── */

export type FeedKind = "system" | "person" | "automage" | "you";

export interface FeedItem {
  id: string;
  day: number;
  time: string;
  kind: FeedKind;
  from: string;
  role?: string;
  via?: string;
  text: string;
  act?: Act;
  tone?: "alert" | "change" | "verified" | "return" | "report";
  layer: Layer;
  lens: string;
}

const person = (id: PersonId) => ({ kind: "person" as const, from: PEOPLE[id].name, role: PEOPLE[id].role, layer: "enterprise" as const, lens: `企业的人 · ${PEOPLE[id].role}` });
const system = (name: string) => ({ kind: "system" as const, from: name, layer: "enterprise" as const, lens: `企业系统 · ${name}` });
const automage = (act: Act) => ({ kind: "automage" as const, from: "AutoMage", act, layer: "automage" as const, lens: `AutoMage · ${act}` });
const you = () => ({ kind: "you" as const, from: "你", role: "供应链负责人", layer: "boundary" as const, lens: "委托边界 · 你签批（委托第 4、5 条）" });

export function feedForDay(day: number, ctx: Ctx): FeedItem[] {
  const v1 = ctx.v1 ?? "split";
  const split = v1 === "split";
  const short = shortfall(v1);
  const got = delivered(v1);
  const extra = spotExtra(v1);
  const v2 = effectiveV2(ctx);
  const items: Omit<FeedItem, "day">[] = [];

  switch (day) {
    case 0:
      items.push(
        { id: "f0-1", time: "09:42", ...system("WMS"), via: "库存预警", tone: "alert", text: `PA66 树脂账面库存 ${N.book}t。按当前排产，约第 12 天跌破安全库存（${N.safety}t）。` },
        { id: "f0-2", time: "09:43", ...automage("接手"), text: `按「原料缺料风险」委托新建工作 ${WORK.id}，开始跟进。` },
        { id: "f0-3", time: "09:44", ...automage("取数"), text: "读取 WMS 库存、MES 排产、ERP 在制订单、SRM 在途采购。" },
        { id: "f0-4", time: "09:45", ...system("SRM"), via: "在途采购", text: `主供应商 A 常规批次 ${N.regular}t：原定第 10 天到货，状态「延迟，新交期待定」。` },
        { id: "f0-5", time: "09:51", ...automage("追问"), via: "群聊 · PA66 补料", text: "@刘敏 312t 里有没有冻结或待检的批次？@周婷 哪些订单靠这批料，有不能延期的吗？@赵磊 主供应商的新交期能问到吗？有没有备选供应商？@黄海 华南仓能调出多少？@孙倩 本月原料预算还剩多少？" },
      );
      break;
    case 1:
      items.push(
        { id: "f1-1", time: "08:55", ...person("liu"), via: "群聊", text: "312t 里有 12t 在质检冻结，现在能用的是 300t。" },
        { id: "f1-2", time: "09:02", ...automage("核对"), text: "对照 WMS 冻结标记，12t 确实处于质检冻结。可用库存更正为 300t；跌破日仍是第 12 天。" },
        { id: "f1-3", time: "10:30", ...person("zhou"), via: "群聊", text: "靠这批料的订单有 3 个。C 是汽车客户，合同有延期罚则，不能拖；D、E 可以谈。" },
        { id: "f1-4", time: "14:10", ...system("SRM"), via: "供应商 A 回复", text: `常规批次新交期：第 ${N.regularDay} 天（对方产线检修）。` },
        { id: "f1-5", time: "14:12", ...automage("测算"), text: `常规批次第 ${N.regularDay} 天才到：第 12–16 天要守住安全线，需要另补 ${N.gap}t（5 天用量）。` },
        { id: "f1-6", time: "17:30", ...automage("跟进"), via: "群聊 · PA66 补料", text: "@孙倩 本月原料预算还剩多少，今天能给个数吗？明天上午要整理方案。其他问题都有人回了。" },
      );
      break;
    case 2:
      items.push(
        { id: "f2-1", time: "09:20", ...person("huang"), via: "群聊", text: `华南仓最多能调 ${N.transfer}t，再多我们自己也要跌破安全线。第 5 天发车，第 ${N.transferDay} 天到。` },
        { id: "f2-2", time: "10:05", ...person("zhao"), via: "群聊", text: `问了两家：供应商 B 能供 100t，¥17,600/t，第 ${N.supplyDay} 天到；供应商 C 有现货 ${N.spotC}t，¥18,600/t，下单 3 天到。` },
        { id: "f2-3", time: "10:40", ...person("sun"), via: "群聊", text: `昨天在外面，刚看到。本月原料预算还剩 ¥${N.budget} 万。` },
        { id: "f2-4", time: "11:15", ...person("chen"), via: "群聊", text: "订单 E 每天用 5t 左右，真不够的话可以先停几天，但要销售先跟客户说好。" },
        { id: "f2-5", time: "11:30", ...automage("测算"), text: "供应商履约分析：供应商 B 近 12 个月准时交付 92%，有 2 次部分交付。" },
      );
      break;
    case 3:
      items.push(
        { id: "f3-1", time: "09:00", ...automage("整理"), text: "补 100t 的两个方案已整理好：事实、推断、未知分开列出，各自依赖的前提也已写明。" },
        { id: "f3-2", time: "09:01", kind: "automage", from: "AutoMage", act: "请你决定", tone: "return", layer: "boundary", lens: "委托边界 · 采购决定须你签批", text: `新的采购或调拨方案要你签批（委托第 4 条）。${WORK.id} 已放进你的待办。` },
      );
      if (ctx.v1) {
        items.push({ id: "f3-3", time: "16:40", ...you(), text: `签批 v1：${v1Option(ctx.v1).name}。${ctx.v1 === "split" ? "接受未书面确认的条件：华南仓调出后下周是否够用。" : "接受未书面确认的条件：供应商 B 一次交 100t 的产能。"}` });
      }
      break;
    case 4:
      items.push(
        { id: "f4-1", time: "09:10", ...automage("分派"), text: split ? "任务 → 赵磊：向供应商 B 下单 50t。任务 → 黄海：华南仓 50t 第 5 天发车。任务 → 刘敏：第 8、9 天收货。" : "任务 → 赵磊：向供应商 B 下单 100t。任务 → 刘敏：第 9 天收货。" },
        { id: "f4-2", time: "15:30", ...person("zhao"), via: "群聊", text: `B 的单下了（SRM PO-0612），对方书面确认第 ${N.supplyDay} 天交 ${v1Option(v1).bQty}t。` },
        { id: "f4-3", time: "15:32", ...automage("跟进"), tone: "verified", text: "回执已记录：供应商 B 书面确认交期。" },
      );
      break;
    case 5:
      if (split) {
        items.push(
          { id: "f5-1", time: "08:40", ...person("huang"), via: "群聊", text: `${N.transfer}t 已装车发出，第 ${N.transferDay} 天到。` },
          { id: "f5-2", time: "08:45", ...automage("跟进"), text: "调拨在途。已提醒刘敏第 8 天安排收货。" },
        );
      } else {
        items.push(
          { id: "f5-1", time: "10:00", ...person("zhao"), via: "群聊", text: "跟 B 确认过，生产按计划在排。" },
          { id: "f5-2", time: "10:05", ...automage("跟进"), text: "供应商 B 排产正常。已提醒刘敏第 9 天安排收货。" },
        );
      }
      break;
    case 6:
      items.push(
        { id: "f6-1", time: "10:20", ...person("zhao"), via: "群聊 · 转述供应商 B 邮件", tone: "change", text: `B 刚来邮件：一批原料检验不合格，第 ${N.supplyDay} 天只能交 60%，也就是 ${got}t。剩下的最早第 20 天，不保证。` },
        { id: "f6-2", time: "10:21", ...system("SRM"), via: "交期变更", text: `PO-0612：第 ${N.supplyDay} 天 ${v1Option(v1).bQty}t → ${got}t，余量待定。` },
        { id: "f6-3", time: "10:23", ...automage("发现变化"), tone: "change", text: `v1 的前提「供应商 B 第 ${N.supplyDay} 天交付 ${v1Option(v1).bQty}t」不再成立。重新测算：第 ${split ? 16 : 15} 天跌破安全线。` },
        { id: "f6-3b", time: "10:25", ...automage("追问"), via: "群聊 · PA66 补料", text: `@赵磊 供应商 C 第 2 天报的 ${N.spotC}t 现货还在吗？价格变了没有？` },
        { id: "f6-3c", time: "10:41", ...person("zhao"), via: "群聊", text: `刚问过，C 还有 ${N.spotC}t 现货，价格没变，下单 3 天到。` },
      );
      if (autoResolves(ctx)) {
        items.push(
          { id: "f6-4", time: "10:45", kind: "automage", from: "AutoMage", act: "自行调整", tone: "report", layer: "boundary", lens: "委托边界 · 授权内自行调整", text: `额外 ¥${extra.wan.toFixed(1)} 万，占已批金额 ${extra.pct}%，在 5% 以内：缺的 ${short}t 改由供应商 C 现货补。任务 → 赵磊：向供应商 C 下单 ${short}t。` },
          { id: "f6-5", time: "10:47", ...automage("报备"), tone: "report", text: "报备已发给你：变化、处理方式、花费和授权依据。没有采用「订单 E 暂停」——会改客户交期，不在授权内。" },
          { id: "f6-6", time: "15:10", ...person("zhao"), via: "群聊", text: `C 的单下了，书面确认第 ${N.supplyDay} 天到 ${short}t。` },
        );
      } else {
        items.push({ id: "f6-4", time: "10:45", kind: "automage", from: "AutoMage", act: "退回", tone: "return", layer: "boundary", lens: "委托边界 · 变化须回来找你", text: `按委托第 5 条，已批准的方案出现变化要回来找你。${WORK.id} 已退回你的待办，附上 v1 的依据、这次的变化和两个处理办法。` });
        if (ctx.v2) {
          items.push(
            { id: "f6-5", time: "13:50", ...you(), text: `签批 v2：${v2Option(v1, ctx.v2).name}。` },
            { id: "f6-6", time: "14:05", ...automage("分派"), text: ctx.v2 === "spot" ? `任务 → 赵磊：向供应商 C 下单 ${short}t。` : `任务 → 周婷：和客户 E 确认交期后移。任务 → 陈工：订单 E 暂停 ${short / 5} 天。` },
          );
        }
      }
      break;
    case 7:
      if (v2 === "spot") {
        if (!autoResolves(ctx)) items.push({ id: "f7-1", time: "09:30", ...person("zhao"), via: "群聊", text: `C 的单下了，书面确认第 ${N.supplyDay} 天到 ${short}t。` });
        items.push({ id: "f7-2", time: "09:35", ...automage("跟进"), tone: "verified", text: `回执已记录。测算：守住安全线到第 ${N.regularDay} 天常规批次到货。` });
      } else {
        items.push(
          { id: "f7-1", time: "11:00", ...person("zhou"), via: "群聊", text: "客户 E 同意交期往后推，邮件已确认。" },
          { id: "f7-2", time: "11:20", ...person("chen"), via: "群聊", text: `订单 E 从第 8 天起暂停 ${short / 5} 天，排产已改。` },
          { id: "f7-3", time: "11:25", ...automage("跟进"), tone: "verified", text: `两项回执已记录。测算：守住安全线到第 ${N.regularDay} 天常规批次到货。` },
        );
      }
      break;
    case 8:
      if (split) {
        items.push(
          { id: "f8-1", time: "13:40", ...system("WMS"), via: "入库", tone: "verified", text: `华南仓调拨 ${N.transfer}t 入库。` },
          { id: "f8-2", time: "13:45", ...automage("核对"), text: "入库数量与调拨单一致。" },
        );
      } else {
        items.push({ id: "f8-1", time: "16:00", ...automage("跟进"), text: "提醒刘敏：明天到货，预留卸货位。" });
      }
      break;
    case 9:
      items.push({ id: "f9-1", time: "10:15", ...system("WMS"), via: "入库", tone: "verified", text: v2 === "spot" ? `供应商 B ${got}t、供应商 C ${short}t 入库。` : `供应商 B ${got}t 入库。` });
      items.push({ id: "f9-2", time: "10:20", ...automage("核对"), text: v2 === "spot" ? `到货与订单一致。补料累计 ${N.gap}t。` : `到货与订单一致。补料累计 ${split ? N.transfer + got : got}t，订单 E 暂停少用 ${short}t。` });
      break;
    case 10:
      items.push({ id: "f10-1", time: "09:00", ...automage("测算"), tone: "verified", text: `按实际入库重算：库存守得住安全线，直到第 ${N.regularDay} 天常规批次到货。` });
      if (split) {
        items.push(
          { id: "f10-2", time: "16:20", ...person("huang"), via: "群聊", text: "华南这周的客户备货顶住了，没动到安全线。" },
          { id: "f10-3", time: "16:22", ...automage("核对"), tone: "verified", text: "你签批 v1 时接受的那个未知，现在有了答案：华南仓没受影响。" },
        );
      }
      break;
    case 11:
      items.push(
        { id: "f11-1", time: "17:30", ...person("zhou"), via: "群聊", text: "订单 C 今天按期发货了。" },
        { id: "f11-2", time: "17:32", ...automage("跟进"), tone: "verified", text: "订单 C 交付已确认，目标之一达成。" },
      );
      break;
    case 12:
      items.push(
        { id: "f12-1", time: "08:00", ...system("WMS"), via: "日结", text: `库存 ${projectionAt(12, ctx, { v1Signed: true, v2Signed: true }).series[12]}t，安全线 ${N.safety}t。` },
        { id: "f12-2", time: "08:05", ...automage("核对"), tone: "verified", text: "原定的风险日：库存在安全线以上。" },
      );
      break;
    case 13:
      items.push(
        { id: "f13-1", time: "10:00", ...automage("跟进"), text: "请赵磊向供应商 A 确认常规批次的发运安排。" },
        { id: "f13-2", time: "15:20", ...person("zhao"), via: "群聊", text: "A 说明天发车。" },
      );
      break;
    case 14:
      items.push(
        { id: "f14-1", time: "11:00", ...system("SRM"), via: "发运通知", text: `常规批次 ${N.regular}t 已发运，书面确认第 ${N.regularDay} 天到货。` },
        { id: "f14-2", time: "11:05", kind: "automage", from: "AutoMage", act: "关闭", tone: "verified", layer: "boundary", lens: "委托边界 · 完成标准", text: "委托第 7 条的完成标准全部满足。工作关闭，过程留在记录里。" },
      );
      break;
  }
  return items.map((item) => ({ ...item, day }));
}

/* ── Work object state ── */

export type Status = "following" | "awaiting" | "reopened" | "closed";

export interface Change {
  id: string;
  text: string;
  why: string;
  tone?: "change" | "verified" | "return" | "report";
}

export function statusAt(day: number, ctx: Ctx, signed: DecisionState): Status {
  if (day >= LAST_DAY) return "closed";
  if (day === V1_DAY && !signed.v1Signed) return "awaiting";
  if (day === CHANGE_DAY && !autoResolves(ctx) && !signed.v2Signed) return "reopened";
  return "following";
}

export function changesForDay(day: number, ctx: Ctx, signed: DecisionState): Change[] {
  const v1 = ctx.v1 ?? "split";
  const split = v1 === "split";
  const short = shortfall(v1);
  const extra = spotExtra(v1);
  const v2 = effectiveV2(ctx);
  switch (day) {
    case 0:
      return [{ id: "c0", text: `新工作：约第 12 天跌破安全库存`, why: `WMS 预警进入；AutoMage 按委托接手，并在群里向 5 位同事追问。` }];
    case 1:
      return [
        { id: "c1a", text: `可用库存 ${N.book}t → ${N.stock}t`, why: `刘敏指出 ${N.frozen}t 在质检冻结，WMS 冻结标记已核对。` },
        { id: "c1b", text: `缺口：需另补 ${N.gap}t`, why: `SRM 回复常规批次第 ${N.regularDay} 天才到，按日用 ${N.use}t 测算。` },
      ];
    case 2:
      return [{ id: "c2", text: "找到三个补料来源，预算余量已知", why: "黄海、赵磊、孙倩、陈工在群里回复；供应商 B 的履约记录已分析。" }];
    case 3:
      return signed.v1Signed
        ? [{ id: "c3", text: `你签批了 v1：${v1Option(v1).name}`, why: "新的采购或调拨方案须你签批（委托第 4 条）。", tone: "return" }]
        : [{ id: "c3", text: "两个方案已整理好，等你决定", why: "新的采购或调拨方案须你签批（委托第 4 条）。", tone: "return" }];
    case 4:
      return [{ id: "c4", text: `v1 开始落实：${split ? 3 : 2} 项任务已分派`, why: "签批后，AutoMage 可以自己分派任务、跟进回执（委托第 3 条）。" }];
    case 5:
      return [{ id: "c5", text: split ? "华南仓调拨在途" : "供应商 B 排产正常", why: split ? "黄海回复已发车。" : "赵磊向供应商 B 确认。" }];
    case 6: {
      const list: Change[] = [{ id: "c6a", text: `v1 的一个前提不再成立：供应商 B 只能交 ${delivered(v1)}t`, why: "赵磊转述供应商 B 邮件；SRM 交期已变更。", tone: "change" }];
      if (autoResolves(ctx)) {
        list.push({ id: "c6b", text: `AutoMage 自行调整：缺的 ${short}t 改由供应商 C 补`, why: `额外成本 ${extra.pct}%，在你给的 5% 授权内（委托第 5 条，推演中改写）。只给你发了报备。`, tone: "report" });
      } else if (signed.v2Signed && ctx.v2) {
        list.push({ id: "c6b", text: `你签批了 v2：${v2Option(v1, ctx.v2).name}`, why: "已批准的方案出现变化，须回来找你（委托第 5 条）。", tone: "return" });
      } else {
        list.push({ id: "c6b", text: "工作重新打开，退回给你", why: "已批准的方案出现变化，须回来找你（委托第 5 条）。", tone: "return" });
      }
      return list;
    }
    case 7:
      return [{ id: "c7", text: v2 === "spot" ? "供应商 C 书面确认交期" : "客户 E 同意后移，订单 E 排产已改", why: "AutoMage 跟进回执。", tone: "verified" }];
    case 8:
      return split
        ? [{ id: "c8", text: `华南仓 ${N.transfer}t 入库`, why: "WMS 入库记录，与调拨单核对一致。", tone: "verified" }]
        : [{ id: "c8", text: "等待明天到货", why: "AutoMage 已提醒收货准备。" }];
    case 9:
      return [{ id: "c9", text: v2 === "spot" ? `补料 ${N.gap}t 全部到齐` : `到货 ${split ? N.transfer + delivered(v1) : delivered(v1)}t，订单 E 暂停补足其余`, why: "WMS 入库记录，与采购订单核对一致。", tone: "verified" }];
    case 10:
      return [
        { id: "c10", text: `测算确认：守住安全线到第 ${N.regularDay} 天`, why: "按实际入库数重算，不再依赖口头承诺。", tone: "verified" },
        ...(split ? [{ id: "c10b", text: "你接受过的未知有了答案：华南仓顶住了", why: "黄海在群里确认，本周华南备货没动到安全线。", tone: "verified" as const }] : []),
      ];
    case 11:
      return [{ id: "c11", text: "订单 C 按期发货", why: "周婷确认。目标「订单 C 不延期」达成。", tone: "verified" }];
    case 12:
      return [{ id: "c12", text: "原定的风险日：库存在安全线以上", why: "WMS 日结。", tone: "verified" }];
    case 13:
      return [{ id: "c13", text: "跟进常规批次发运", why: "完成标准之一：常规批次到货要有书面确认。" }];
    case 14:
      return [{ id: "c14", text: "完成标准全部满足，工作关闭", why: "常规批次已发运并书面确认第 17 天到货（委托第 7 条）。", tone: "verified" }];
    default:
      return [];
  }
}

/* ── Claims: facts, inferences, unknowns ── */

export interface Claim {
  id: string;
  kind: ClaimKind;
  label: string;
  value: string;
  source: Source;
  since: number;
  previous?: string;
  resolved?: string;
  resolvedDay?: number;
  accepted?: string;
  layer: Layer;
  lens: string;
  isRule?: boolean;
}

export function claimsAt(day: number, ctx: Ctx, signed: DecisionState): Claim[] {
  const v1 = ctx.v1;
  const v2 = effectiveV2(ctx);
  const changed = day >= CHANGE_DAY && v1 !== null;
  const list: Claim[] = [];
  const fact = (claim: Omit<Claim, "kind" | "layer" | "lens"> & { lens?: string }) =>
    list.push({ kind: "fact", layer: "enterprise", lens: claim.lens ?? `企业数据 · ${claim.source.who.split(" ")[0]}`, ...claim });
  const inference = (claim: Omit<Claim, "kind" | "layer" | "lens">) =>
    list.push({ kind: "inference", layer: "automage", lens: "AutoMage · 测算", ...claim });
  const unknown = (claim: Omit<Claim, "kind" | "layer" | "lens" | "value"> & { value?: string }) =>
    list.push({ kind: "unknown", layer: "automage", lens: "AutoMage · 标出未知", value: claim.value ?? "", ...claim });

  fact(day < 1
    ? { id: "stock", label: "账面库存", value: `${N.book}t`, source: { who: "WMS", via: "库存快照", at: "第 0 天 09:42", ref: "WMS-INV-0817" }, since: 0 }
    : { id: "stock", label: "可用库存", value: `${N.stock}t`, previous: `${N.book}t`, source: { who: "刘敏 · 仓库主管", via: "群聊；WMS 冻结标记已核对", at: "第 1 天 08:55" }, since: 1 });
  fact({ id: "use", label: "排产日用量", value: `${N.use}t`, source: { who: "MES", via: "排产计划", at: "第 0 天 09:44" }, since: 0 });
  fact({ id: "safety", label: "安全库存线", value: `${N.safety}t（4 天用量）`, source: { who: "企业库存规则", via: "WMS 预警阈值", at: "长期" }, since: 0, isRule: true, lens: "企业规则 · 安全库存" });
  fact(day < 1
    ? { id: "regular", label: "常规批次 120t", value: "延迟，新交期待定", source: { who: "SRM", via: "在途采购", at: "第 0 天 09:45" }, since: 0 }
    : { id: "regular", label: "常规批次 120t", value: day >= 14 ? `已发运，第 ${N.regularDay} 天到` : `第 ${N.regularDay} 天到货`, source: day >= 14 ? { who: "SRM", via: "发运通知", at: "第 14 天 11:00" } : { who: "SRM", via: "供应商 A 回复", at: "第 1 天 14:10" }, since: day >= 14 ? 14 : 1 });
  if (day >= 1) fact({ id: "orders", label: "依赖订单", value: "3 个；订单 C 不可延期", source: { who: "周婷 · 销售经理", via: "群聊；ERP 订单关联", at: "第 1 天 10:30" }, since: 1, isRule: true, lens: "企业规则 · 客户合同" });
  if (day >= 2) {
    fact({ id: "budget", label: "原料预算余量", value: `¥${N.budget} 万`, source: { who: "孙倩 · 财务", via: "群聊；预算表", at: "第 2 天 10:40" }, since: 2, lens: "企业规则 · 预算" });
    fact({ id: "transfer", label: "华南仓可调", value: `最多 ${N.transfer}t，第 ${N.transferDay} 天到`, source: { who: "黄海 · 华南仓主管", via: "群聊", at: "第 2 天 09:20" }, since: 2 });
    if (day < 4 || !v1) {
      fact({ id: "quoteB", label: "供应商 B", value: `100t 可供，¥17,600/t，第 ${N.supplyDay} 天到`, source: { who: "赵磊 · 采购", via: "群聊；SRM 报价单 Q-0212", at: "第 2 天 10:05" }, since: 2 });
    } else if (!changed) {
      fact({ id: "quoteB", label: "供应商 B", value: `书面确认第 ${N.supplyDay} 天交 ${v1Option(v1).bQty}t`, source: { who: "赵磊 · 采购", via: "SRM PO-0612", at: "第 4 天 15:30" }, since: 4 });
    } else {
      fact({ id: "quoteB", label: "供应商 B", value: `第 ${N.supplyDay} 天只能交 ${delivered(v1)}t；余量最早第 20 天，不保证`, previous: `书面确认 ${v1Option(v1).bQty}t`, source: { who: "赵磊 · 采购", via: "转述供应商 B 邮件；SRM 交期变更", at: "第 6 天 10:20" }, since: 6 });
    }
    fact(day >= CHANGE_DAY && v1
      ? { id: "spotC", label: "供应商 C", value: `现货 ${N.spotC}t，¥18,600/t，下单 3 天到（第 6 天复核）`, source: { who: "赵磊 · 采购", via: "群聊（AutoMage 追问后复核）", at: "第 6 天 10:41" }, since: 6 }
      : { id: "spotC", label: "供应商 C", value: `现货 ${N.spotC}t，¥18,600/t，下单 3 天到`, source: { who: "赵磊 · 采购", via: "群聊", at: "第 2 天 10:05" }, since: 2 });
    fact({ id: "shiftE", label: "订单 E", value: "每天约 5t，可暂停几天，需先和客户谈", source: { who: "陈工 · 生产计划", via: "群聊", at: "第 2 天 11:15" }, since: 2 });
  }
  if (day >= 8 && v1 === "split") fact({ id: "in8", label: "入库", value: `华南仓 ${N.transfer}t`, source: { who: "WMS", via: "入库记录", at: "第 8 天 13:40" }, since: 8 });
  if (day >= 9 && v1) fact({ id: "in9", label: "入库", value: v2 === "spot" ? `供应商 B ${delivered(v1)}t + 供应商 C ${shortfall(v1)}t` : `供应商 B ${delivered(v1)}t`, source: { who: "WMS", via: "入库记录", at: "第 9 天 10:15" }, since: 9 });
  if (day >= 11) fact({ id: "orderC", label: "订单 C", value: "已按期发货", source: { who: "周婷 · 销售经理", via: "群聊", at: "第 11 天 17:30" }, since: 11 });

  inference(day < 1
    ? { id: "breach", label: "跌破安全线", value: "约第 12 天", source: { who: "AutoMage", via: `依据：账面 ${N.book}t、日用 ${N.use}t、安全线 ${N.safety}t`, at: "第 0 天 09:44" }, since: 0 }
    : { id: "breach", label: "不补料时跌破安全线", value: "第 12 天；第 15 天停线", source: { who: "AutoMage", via: `依据：可用 ${N.stock}t、日用 ${N.use}t、安全线 ${N.safety}t`, at: "第 1 天 09:02" }, since: 1 });
  if (day >= 1) inference({ id: "gap", label: "缺口", value: `需另补 ${N.gap}t，守到第 ${N.regularDay} 天`, source: { who: "AutoMage", via: "依据：常规批次第 17 天到、日用 20t", at: "第 1 天 14:12" }, since: 1 });
  if (day >= 2) inference({ id: "reliability", label: "供应商 B 履约", value: "准时 92%，有 2 次部分交付", source: { who: "AutoMage · 供应商履约分析", via: "依据：SRM 近 12 个月交付记录", at: "第 2 天 11:30" }, since: 2 });
  if (v1 && day >= V1_DAY && signed.v1Signed) {
    const projection = projectionAt(day, ctx, signed);
    const verified = day >= 10;
    inference({
      id: "plan",
      label: verified ? "按实际入库重算" : "按当前方案测算",
      value: projection.breachDay === null ? `守住安全线到第 ${N.regularDay} 天` : `第 ${projection.breachDay} 天跌破安全线`,
      previous: changed && day === CHANGE_DAY && projection.breachDay !== null ? "守住安全线到第 17 天" : undefined,
      source: { who: "AutoMage", via: verified ? "依据：WMS 入库记录" : "依据：方案与回执", at: verified ? "第 10 天 09:00" : `第 ${Math.min(day, CHANGE_DAY)} 天` },
      since: verified ? 10 : changed ? 6 : 3,
    });
  }

  unknown({ id: "u-frozen", label: "312t 里有无冻结批次", source: { who: "AutoMage", via: "群聊追问 @刘敏", at: "第 0 天 09:51" }, since: 0, resolved: "有 12t 冻结", resolvedDay: 1 });
  unknown({ id: "u-orders", label: "哪些订单受影响、能否延期", source: { who: "AutoMage", via: "群聊追问 @周婷", at: "第 0 天 09:51" }, since: 0, resolved: "3 个，订单 C 不可延期", resolvedDay: 1 });
  unknown({ id: "u-regular", label: "常规批次新交期", source: { who: "AutoMage", via: "群聊追问 @赵磊", at: "第 0 天 09:51" }, since: 0, resolved: "第 17 天", resolvedDay: 1 });
  unknown({ id: "u-sources", label: "能从哪里补、补多少", source: { who: "AutoMage", via: "群聊追问 @赵磊 @黄海", at: "第 0 天 09:51" }, since: 0, resolved: "华南仓 50t、供应商 B、供应商 C", resolvedDay: 2 });
  unknown({ id: "u-budget", label: "预算余量", source: { who: "AutoMage", via: "群聊追问 @孙倩", at: "第 0 天 09:51" }, since: 0, resolved: "¥210 万", resolvedDay: 2 });
  if (day >= 2) {
    const signedV1 = v1 !== null && signed.v1Signed && day >= V1_DAY;
    unknown({
      id: "u-huanan",
      label: "华南仓调出后下周是否够用",
      value: "黄海口头说「能顶住」，没有书面",
      source: { who: "黄海 · 华南仓主管", via: "群聊", at: "第 2 天 09:20" },
      since: 2,
      accepted: signedV1 && v1 === "split" && day < 10 ? "你签批 v1 时接受，写进了条件" : undefined,
      resolved: signedV1 && v1 === "single" ? "方案 B 不动华南仓" : signedV1 && v1 === "split" ? "第 10 天黄海确认：华南仓顶住了" : undefined,
      resolvedDay: v1 === "split" ? 10 : V1_DAY,
    });
    unknown({
      id: "u-bcap",
      label: "供应商 B 一次交 100t 的产能",
      value: "赵磊电话确认，没有书面",
      source: { who: "赵磊 · 采购", via: "电话后转述", at: "第 2 天 10:05" },
      since: 2,
      accepted: signedV1 && v1 === "single" && day < 4 ? "你签批 v1 时接受，写进了条件" : undefined,
      resolved: signedV1 && v1 === "split" ? "方案 A 只要 B 交 50t" : signedV1 && day >= 4 ? "第 4 天书面确认交期" : undefined,
      resolvedDay: signedV1 && v1 === "split" ? V1_DAY : 4,
    });
  }
  if (changed && day >= CHANGE_DAY) {
    unknown({ id: "u-remainder", label: "供应商 B 余量何时能到", value: "最早第 20 天，不保证", source: { who: "赵磊 · 采购", via: "转述供应商 B 邮件", at: "第 6 天 10:20" }, since: 6, resolved: v2 && (signed.v2Signed || autoResolves(ctx)) ? "不再依赖：缺口已另行补足" : undefined, resolvedDay: 6 });
  }
  return list.filter((claim) => claim.since <= day).map((claim) => (
    claim.resolvedDay !== undefined && claim.resolvedDay > day ? { ...claim, resolved: undefined } : claim
  ));
}

/* ── Tasks ── */

export interface Task {
  id: string;
  who: string;
  what: string;
  status: "waiting" | "done" | "changed";
  receipt?: string;
  since: number;
}

export function tasksAt(day: number, ctx: Ctx): Task[] {
  const v1 = ctx.v1;
  if (!v1 || day < 4) return [];
  const split = v1 === "split";
  const v2 = effectiveV2(ctx);
  const short = shortfall(v1);
  const tasks: Task[] = [];
  const bQty = v1Option(v1).bQty;
  tasks.push({
    id: "t-b",
    who: "赵磊",
    what: `向供应商 B 下单 ${bQty}t`,
    since: 4,
    status: day >= 9 ? "done" : day >= CHANGE_DAY ? "changed" : "done",
    receipt: day >= 9 ? `${delivered(v1)}t 已入库（少交 ${short}t）` : day >= CHANGE_DAY ? `第 6 天变更：只能交 ${delivered(v1)}t` : `书面确认第 ${N.supplyDay} 天交付`,
  });
  if (split) {
    tasks.push({ id: "t-transfer", who: "黄海", what: `华南仓调拨 ${N.transfer}t`, since: 4, status: day >= 8 ? "done" : "waiting", receipt: day >= 8 ? "已入库" : day >= 5 ? "第 5 天已发车" : undefined });
  }
  tasks.push({ id: "t-receive", who: "刘敏", what: split ? "第 8、9 天收货" : "第 9 天收货", since: 4, status: day >= 9 ? "done" : "waiting", receipt: day >= 9 ? "已收货，数量核对一致" : undefined });
  if (day >= CHANGE_DAY && v2) {
    const resolvedToday = autoResolves(ctx) || ctx.v2 !== null;
    if (resolvedToday && v2 === "spot") {
      tasks.push({ id: "t-c", who: "赵磊", what: `向供应商 C 下单 ${short}t`, since: 6, status: day >= 9 ? "done" : autoResolves(ctx) || day >= 7 ? "done" : "waiting", receipt: day >= 9 ? "已入库" : autoResolves(ctx) || day >= 7 ? `书面确认第 ${N.supplyDay} 天到` : undefined });
    }
    if (resolvedToday && v2 === "reschedule") {
      tasks.push({ id: "t-e1", who: "周婷", what: "和客户 E 确认交期后移", since: 6, status: day >= 7 ? "done" : "waiting", receipt: day >= 7 ? "客户邮件同意" : undefined });
      tasks.push({ id: "t-e2", who: "陈工", what: `订单 E 暂停 ${short / 5} 天`, since: 6, status: day >= 7 ? "done" : "waiting", receipt: day >= 7 ? "排产已改" : undefined });
    }
  }
  if (day >= 13) tasks.push({ id: "t-a", who: "赵磊", what: "向供应商 A 确认常规批次发运", since: 13, status: day >= 14 ? "done" : "waiting", receipt: day >= 14 ? `已发运，书面确认第 ${N.regularDay} 天到` : undefined });
  return tasks;
}

/* ── Lens summary ── */

export function lensSummary(upTo: number, ctx: Ctx) {
  const acts = new Map<string, number>();
  let enterprise = 0;
  let boundary = 0;
  const systems = new Set<string>();
  const people = new Set<string>();
  for (let day = 0; day <= upTo; day += 1) {
    for (const item of feedForDay(day, ctx)) {
      if (item.layer === "automage" && item.act) acts.set(item.act, (acts.get(item.act) ?? 0) + 1);
      if (item.layer === "enterprise") {
        enterprise += 1;
        if (item.kind === "system") systems.add(item.from);
        if (item.kind === "person") people.add(item.from);
      }
      if (item.layer === "boundary") boundary += 1;
    }
  }
  return { acts: [...acts.entries()], enterprise, systems: [...systems], people: [...people], boundary };
}

/* ── First run vs replay ── */

export interface RunSummary {
  rule: Rule;
  day6: string;
  interrupted: boolean;
  yourActions: string;
  resolution: string;
  extra: string;
  record: string;
}

export function summarizeRun(run: Run, rule: Rule, v1: V1Choice, v2: V2Choice | null): RunSummary {
  const ctx: Ctx = { run, rule, v1, v2 };
  const auto = autoResolves(ctx);
  const effective = effectiveV2(ctx);
  const extra = spotExtra(v1);
  return {
    rule,
    day6: auto ? "留在 AutoMage 手上，当天调整" : "退回你的待办，等你重新决定",
    interrupted: !auto,
    yourActions: auto ? "看一张报备卡" : effective ? "比较两个处理办法，签批 v2" : "比较两个处理办法，签批 v2（你还没签）",
    resolution: effective ? `${auto ? "AutoMage" : "你"}：${v2Option(v1, effective).name}` : "还没定：等你在第 6 天重新决定",
    extra: !effective ? "—" : effective === "spot" ? `+¥${extra.wan.toFixed(1)} 万（${extra.pct}%）` : "不加钱，客户 E 交期后移",
    record: auto ? "v1 + 一次授权内调整及其依据" : effective ? "v1、v2 两次决定，和中间的退回原因" : "v1，和这次退回的原因（v2 待定）",
  };
}
