/* The homepage stage: one company's ordinary week, told twice. Without AutoMage, a piece of work moves
   because people keep it in mind, pass it on and chase it; the week is a long run of talk, and the
   state of each work lives in someone's head or in a chat. With AutoMage, the same week: each work keeps
   its own state, with where every piece came from, and the talk that only carried that state is no
   longer needed. What is left between people is what needs people; the two works that reach a line in
   the company's rules arrive at the person that line names, with their evidence. Industry nouns are
   kept out on purpose. Demo data throughout. */

export const DAYS = ["周一", "周二", "周三", "周四", "周五"] as const;

/** A beat of the week with AutoMage: when something happens on a work, in stage progress (--p), and
    the time of day it happens at. */
export const BEATS = [
  { p: 2.08, day: 0, time: "09:00" }, // 0 Monday's meeting
  { p: 2.2, day: 0, time: "09:40" }, //  1 it asks the supplier
  { p: 2.32, day: 0, time: "18:00" }, // 2 Monday's checks
  { p: 2.46, day: 1, time: "16:40" }, // 3 the supplier answers
  { p: 2.62, day: 2, time: "18:00" }, // 4 Wednesday
  { p: 2.8, day: 3, time: "11:10" }, //  5 the customer calls
  { p: 3.16, day: 4, time: "09:10" }, // 6 Friday: a line, for the sales manager
  { p: 3.3, day: 4, time: "10:45" }, //  7 Friday: a line, for the owner
  { p: 3.5, day: 4, time: "11:20" }, //  8 the owner decides
] as const;

/** Where in the week a moment is: 0 is Monday 08:00, 1 is Tuesday 08:00; a working day runs to 19:00. */
export function weekPoint(day: number, time = "12:00") {
  const [hours, minutes] = time.split(":").map(Number);
  return day + Math.min(1, Math.max(0, (hours + minutes / 60 - 8) / 11));
}

/** Without AutoMage, the week's lines come in one after another from here, this far apart. */
export const BEFORE = { start: 0.5, step: 0.055 } as const;

/** With AutoMage, the works are held from here on, one shortly after another. */
export const FLIP = { start: 1.9, step: 0.03 } as const;

/** Who took a step on a work: AutoMage itself, a person, or a business system. */
export type Actor = "ai" | "person" | "system";

export interface Line {
  id: string;
  day: number;
  time?: string;
  from: string;
  to?: string;
  /** Where it was said. "没说出口" is something kept only in someone's head. */
  via: string;
  /** `**…**` marks the part that matters. */
  text: string;
  kind?: "unsaid" | "ai" | "owner";
  /** With AutoMage, the beat at which the line is no longer needed: its work keeps that state. */
  fold?: number;
  /** With AutoMage, still said, but this instead, from the beat. */
  becomes?: { beat: number; text: string };
  /** Said only in the week with AutoMage, from the beat. */
  added?: number;
}

export const LINES: Line[] = [
  { id: "meeting", day: 0, time: "09:00", from: "各部门", via: "例会", text: "轮流过一遍上周的进度，开了一个半小时。", becomes: { beat: 0, text: "上周的进度大家都看过了，只谈要定的两件事。" } },
  { id: "ask", day: 0, time: "09:40", from: "老板", to: "销售经理", via: "当面", text: "客户 A 那批货，怎么样了？", fold: 1 },
  { id: "ask-2", day: 0, time: "09:42", from: "销售经理", to: "老板", via: "当面", text: "我问一下。", fold: 1 },
  { id: "ask-3", day: 0, time: "10:05", from: "销售经理", to: "采购", via: "群消息", text: "A 的料，问下供应商哪天到。", fold: 1 },
  { id: "ask-4", day: 0, time: "10:30", from: "采购", to: "供应商", via: "电话", text: "那批料哪天能到？", fold: 1 },
  { id: "stock", day: 0, from: "仓库", via: "没说出口", kind: "unsaid", text: "有几批货快到期了，得找时间查。", fold: 2 },
  { id: "chase", day: 1, time: "14:20", from: "销售经理", to: "采购", via: "群消息", text: "供应商回了没？", fold: 3 },
  { id: "chase-2", day: 1, time: "14:52", from: "采购", to: "销售经理", via: "群消息", text: "还没回，我再催催。", fold: 3 },
  { id: "reply", day: 1, time: "16:40", from: "供应商", to: "采购", via: "电话", text: "下周二吧，**先到一半**。", fold: 3 },
  { id: "reply-2", day: 1, time: "17:05", from: "采购", to: "销售经理", via: "群消息", text: "说是下周二。", fold: 3 },
  { id: "reply-3", day: 1, time: "17:30", from: "销售经理", to: "老板", via: "群消息", text: "大概下周，具体还不确定。", fold: 3 },
  { id: "analysis", day: 2, from: "老板", via: "没说出口", kind: "unsaid", text: "这个月的数该看了，还散在几张 Excel 里。", fold: 4 },
  { id: "daily", day: 2, time: "18:30", from: "老板", to: "各部门", via: "群消息", text: "日报怎么又没交齐？", fold: 4 },
  { id: "discount", day: 3, time: "11:10", from: "客户 A", to: "销售经理", via: "电话", text: "上次说好的 5% 折扣，还算吗？" },
  { id: "discount-yes", day: 3, time: "11:12", from: "销售经理", to: "客户 A", via: "电话", text: "算，9 月 3 日答应的，这次照给。", added: 5 },
  { id: "discount-2", day: 3, time: "11:20", from: "销售经理", to: "群里", via: "群消息", text: "当时谁答应的 5%？", fold: 5 },
  { id: "discount-3", day: 3, time: "11:42", from: "采购", to: "销售经理", via: "群消息", text: "这事只有老刘清楚，他在出差。", fold: 5 },
  { id: "to-sales", day: 4, time: "09:10", from: "AutoMage", to: "销售经理", via: "群消息", kind: "ai", text: "", added: 6 },
  { id: "cash", day: 4, time: "10:20", from: "老板", to: "财务", via: "电话", text: "E 公司的钱到了吗？", fold: 7 },
  { id: "cash-2", day: 4, time: "10:35", from: "财务", to: "老板", via: "电话", text: "没到，对方又说下月初。", fold: 7 },
  { id: "cash-3", day: 4, time: "10:40", from: "老板", to: "财务、销售经理", via: "群消息", text: "下周那批货还发不发？先整理下情况给我。", fold: 7 },
  { id: "to-owner", day: 4, time: "10:45", from: "AutoMage", to: "老板", via: "私聊", kind: "owner", text: "", added: 7 },
  { id: "decide", day: 4, time: "11:20", from: "老板", to: "AutoMage", via: "私聊", text: "先发一半。", added: 8 },
  { id: "visit", day: 4, time: "11:30", from: "老板", to: "销售经理", via: "当面", text: "E 那边你熟，下周当面去聊聊。", added: 8 },
  { id: "cash-4", day: 4, time: "16:05", from: "财务", to: "老板", via: "Excel", text: "整理好了，您看下。", fold: 7 },
  { id: "cash-5", day: 4, time: "16:30", from: "销售经理", to: "群里", via: "群消息", text: "发不发货，等老板定。", fold: 7 },
];

export interface Rec {
  beat: number;
  actor: Actor;
  text: string;
  source?: string;
}

export interface Work {
  id: string;
  title: string;
  area: string;
  /** Without AutoMage: where this work's state is. */
  where: string;
  /** Standing work: what it does, and the days it has done it. */
  every?: string;
  cycles?: { beat: number; day: number }[];
  /** Already on the work when the week starts. */
  history?: Omit<Rec, "beat">;
  records: Rec[];
  /** Still open: asked and not answered yet. */
  open?: { beat: number; text: string };
  unknown?: { beat: number; text: string };
  /** Friday: the work reached a line in the company's rules and went to the person it names. */
  route?: { beat: number; to: string; text: string };
}

const WEEKDAYS = [2, 3, 4, 5].map((beat, day) => ({ beat, day }));

export const WORKS: Work[] = [
  {
    id: "order", title: "客户 A 的订单", area: "销售 · 采购", where: "进展在四个人的对话里",
    history: { actor: "person", text: "9 月 3 日：老刘答应客户 **5% 折扣**", source: "群消息" },
    records: [
      { beat: 1, actor: "ai", text: "它在供应商群里直接问了交期", source: "群消息" },
      { beat: 3, actor: "person", text: "供应商：下周二**先到一半**，余下周五", source: "供应商回复" },
    ],
    open: { beat: 5, text: "余下一半：问了两次还没确认，明天再问" },
    route: { beat: 6, to: "销售经理", text: "交期要变，先发哪部分由他定" },
  },
  {
    id: "cash", title: "E 公司回款", area: "财务", where: "在财务心里记着：对方说周五付",
    every: "每周核对应收",
    records: [
      { beat: 4, actor: "system", text: "财务软件：**¥26 万逾期，快 60 天了**" },
      { beat: 4, actor: "person", text: "财务：对方说周五付", source: "财务回复" },
      { beat: 7, actor: "person", text: "周五没到账，**过了 60 天**；对方改口下月初", source: "财务回复" },
    ],
    route: { beat: 7, to: "老板", text: "逾期超过 60 天，发不发货由老板定" },
  },
  {
    id: "analysis", title: "月底经营数", area: "管理", where: "各部门的数散在几张 Excel 里，没人汇总",
    records: [{ beat: 4, actor: "ai", text: "初稿：**利润下滑，最大一项是人工**", source: "财务软件 · Excel" }],
    unknown: { beat: 4, text: "有一笔大额报销没分摊：已问财务" },
  },
  {
    id: "daily", title: "团队日报", area: "每天", where: "散在各部门的群里，等人汇总",
    every: "每天 18:00 汇总", cycles: WEEKDAYS, records: [],
  },
  {
    id: "stock", title: "库存保质期", area: "仓库 · 每天", where: "在库存表里，只是没人对",
    every: "每天对库存表", cycles: WEEKDAYS,
    records: [{ beat: 3, actor: "ai", text: "3 批 20 天内到期，**告诉了销售先出**", source: "Excel 库存表" }],
  },
];

/** The work that reaches the sales manager on Friday: an ordinary line. */
export const SALES_MESSAGE = {
  title: "客户 A 的订单",
  status: "需要你定",
  rule: "交期要变，由销售经理定",
  text: "下周二只到一半，余下的还没确认。先发哪部分、怎么跟客户说？",
  source: "供应商回复",
};

/** The work that reaches the owner on Friday: a line only the owner decides. */
export const OWNER_MESSAGE = {
  title: "E 公司回款",
  status: "需要你定",
  rule: "逾期超过 60 天、还要不要继续发货，由老板定",
  ruleNote: "30 天内的催收，由财务跟",
  happened: "¥26 万已逾期 61 天。周三说周五付，周五没到账，对方改口下月初。",
  happenedSources: ["财务软件", "财务回复"],
  history: "过去一年和 E 结算 9 次：按时 7 次，逾期 2 次。",
  historySource: "财务软件",
  optionsLead: "下周还有一批 ¥14 万的货要发",
  options: ["照常发货", "先发一半，余款到账再发", "暂停发货，等回款"],
  reply: "直接回复就行；也可以打开这件工作，看全部记录和出处。",
};

/** What people say in any organization, every week. */
export const PHRASES = ["那个怎么样了？", "我问一下。", "还没回，我再催催。", "这事只有他清楚。", "当时谁说的？", "等老板定。"];

/** The opening: an organization's talk, in three lanes that keep coming. Not one company: shops, clinics,
    workshops and offices say the same things. `key` marks the lines every owner knows. */
export interface Chat {
  from: string;
  to: string;
  text: string;
  key?: boolean;
}

export const FEED: Chat[][] = [
  [
    { from: "老板", to: "销售", text: "那个怎么样了？", key: true },
    { from: "店长", to: "老板", text: "今天的数晚点报。" },
    { from: "采购", to: "供应商", text: "那批料哪天能到？" },
    { from: "销售", to: "老板", text: "我问一下。", key: true },
    { from: "前台", to: "店长", text: "那位客户的回访谁打？" },
    { from: "财务", to: "老板", text: "还没到账，对方说下周。" },
    { from: "老板", to: "群里", text: "这个谁在跟？" },
    { from: "人事", to: "主管", text: "排班表定了吗？" },
  ],
  [
    { from: "采购", to: "销售", text: "还没回，我再催催。", key: true },
    { from: "项目经理", to: "老板", text: "客户说要改，等您定。" },
    { from: "车间", to: "计划", text: "电镀件回来没？" },
    { from: "主管", to: "老板", text: "这事只有他清楚。", key: true },
    { from: "老板", to: "各部门", text: "日报怎么又没交齐？" },
    { from: "客服", to: "仓库", text: "退货收到没？" },
    { from: "财务", to: "老板", text: "整理好了，您看下。" },
    { from: "销售", to: "群里", text: "上次不是说好了吗？" },
  ],
  [
    { from: "销售", to: "群里", text: "当时谁说的？", key: true },
    { from: "主管", to: "老板", text: "我晚点问问。" },
    { from: "前台", to: "医生", text: "下午那位改约了吗？" },
    { from: "仓库", to: "销售", text: "库存表谁改的？" },
    { from: "销售", to: "老板", text: "发不发货，等老板定。", key: true },
    { from: "项目经理", to: "设计", text: "图什么时候能出？" },
    { from: "销售", to: "客户", text: "我确认一下再回您。" },
    { from: "财务", to: "销售", text: "发票开了吗？" },
  ],
];

/** People are drawn as work chats draw anyone without a photo: a small square with their role. */
const HUES: Record<string, number> = {
  老板: 34, 销售: 172, 销售经理: 172, 采购: 262, 供应商: 212, 财务: 342, 仓库: 84, 店长: 18, 前台: 302,
  人事: 52, 主管: 192, 项目经理: 140, 车间: 104, 计划: 232, 客服: 2, 医生: 160, 设计: 282, 客户: 200, "客户 A": 200, 各部门: 220,
};

export function avatarOf(role: string, via?: string) {
  if (role === "AutoMage") return { label: "AM", hue: -1 };
  const label = via === "例会" ? "例会" : role.replace(/^客户.*/, "客户").replace("销售经理", "销售").replace("项目经理", "项目").replace("供应商", "供应").slice(0, 2);
  return { label, hue: HUES[role] ?? 220 };
}

export const COPY = {
  title: ["一件事要往前走，", "得有人记着、传着、催着。"],
  category: "AutoMage 让 AI 记着每件事的进展和来龙去脉，接着往下跟；需要人拍板时，它带着依据找到该定的人。",
  hint: "往下看：一家公司的一周",
  before: {
    kicker: "没有 AutoMage 时",
    title: "想知道一件事，得一层层问下去。",
    text: "进展在人的脑子里和聊天记录里。问一次，传一遍，每过一手晚一点、少一点；没人记着的，就停在那。",
  },
  after: {
    kicker: "有了 AutoMage",
    title: "同一周，进展记在工作上。",
    text: "它直接问到源头，把回复、表格和系统里的记录连同出处记在那件工作上。谁想看都看得清，不用再一层层问；没回音的，它接着问。",
  },
  friday: {
    kicker: "需要人的时候",
    title: "要人拍板的，它带着依据找到该定的人。",
    text: "碰到你们定的线才来：一般的找对应负责人，更高的才到你这里。人和人之间留下的，是这些要人定的事。结果仍由你们负责。",
  },
  status: [
    "",
    "没有 AutoMage 时：一周里，进展靠人一层层问、传、催",
    "有了 AutoMage：同一周，进展记在工作上，那些传话不用再说",
    "周五：两件碰到线的事，带着依据分别找到了销售经理和老板",
  ],
};

/** Phones and short screens: the stretch of talk that shows the relay, then the end of the week. */
export const STILL_BEFORE = ["ask", "ask-2", "ask-3", "ask-4", "chase", "chase-2", "reply", "reply-2", "reply-3"];
