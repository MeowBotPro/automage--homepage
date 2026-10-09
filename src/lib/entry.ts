/* The default entry: the abstract page. It says what AutoMage changes in how an organization's
   information works, in three acts answering what an owner feels (看不清 / 推不动 / 事后说不清), and
   gives each tab its reason to be entered. Rewritten from the June homepage (git 918ab20), not copied:
   the same thesis, noise-to-work moment, loop and gate, with the frozen philosophy's stance — it pushes
   on within the lines it is given and comes to a person at them. The data is an example throughout;
   the doors draw on the tabs' own data, so what the entry promises is what the tab shows. */

import { DAYS, LINES, type Line } from "./home-stage";
import { LAST_DAY, N, projectionAt, type Ctx } from "./supply-chain-world";
import type { SkillCatalog } from "./skill-catalog";
import { findGroups, SKILL_GROUPS, WORK_AREAS } from "./skill-groups";

export const HERO = {
  title: ["重塑组织管理的", "信息逻辑"],
  /* Each clause sits on the same row as what it names on the right: AutoMage's information work, and
     the one point where a person judges. */
  lead: ["当 AI 接管信息处理，", "人回归判断本身。"],
  text: "AutoMage 把散在群聊、日报和业务系统里的信息，汇成一件件看得清、带着出处的事，接着往下跟；碰到你们定的线，它带着依据来找该定的人。",
  /** What the moving example beside the clauses shows, for anyone who cannot watch it. */
  example: "示例：一件事被接住。组织里的话汇成它的出处；AutoMage 汇总、追问、起草；碰到你们定的线，才交给该定的人，在线内的事不用找人。",
  cta: "预约演示",
  hint: "往下看它怎么运转",
} as const;

/** The hero's protagonist: one work at a time, being carried. The organization's talk drifts in and
    lands as the work's sources; AutoMage's information work is written on it in blue; at a line the work
    goes to the person the line names, and a work inside the lines needs nobody. Three works rotate, so
    no single trade or single outcome becomes the picture. */
export type HeroWork = {
  title: string;
  state: string;
  talk: readonly { source: string; text: string }[];
  actions: readonly string[];
  line: { hit: boolean; text: string };
  person: { role: string; text: string } | null;
  after: string;
};
export const HERO_WORKS: readonly HeroWork[] = [
  {
    title: "客户交付延期",
    state: "客户提了延期，交付资源还没排",
    talk: [{ source: "日报", text: "今天客户说交付要延期…" }, { source: "工作群", text: "@所有人 项目进度？" }, { source: "口头交代", text: "老板说尽快搞定" }],
    actions: ["汇了 3 处出处", "问了项目经理", "起草了 2 个方案"],
    line: { hit: true, text: "碰到你们定的线：延期由负责人定" },
    person: { role: "负责人", text: "选 B，调整范围。" },
    after: "5 项任务回到一线，它接着跟",
  },
  {
    title: "E 公司回款",
    state: "说好周五付，到现在没到账",
    talk: [{ source: "财务软件", text: "¥26 万，逾期 61 天" }, { source: "电话", text: "对方说周五付" }, { source: "工作群", text: "下周那批货还发吗？" }],
    actions: ["对了财务软件", "问了财务", "查了过去一年的结算"],
    line: { hit: true, text: "碰到你们定的线：逾期超过 60 天，发不发货由老板定" },
    person: { role: "老板", text: "先发一半。" },
    after: "已通知仓库和销售，下周一再对账",
  },
  {
    title: "库存临期",
    state: "3 批货 20 天内到期，还没人对过",
    talk: [{ source: "库存表", text: "3 批 20 天内到期" }, { source: "工作群", text: "仓库那几批还在吗？" }, { source: "日报", text: "销售说这周有活动" }],
    actions: ["对了库存表", "问了仓库", "告诉销售先出这 3 批"],
    line: { hit: false, text: "没碰到线：在它能自己办的范围里" },
    person: null,
    after: "办完了，没打扰任何人；下周一再对一次",
  },
];

export const ACTS = {
  noise: {
    kicker: "01 · 看得清",
    title: "从噪声，到看得清的事",
    text: "日报、群消息、会议纪要、口头交代、改了三版的表格……进展散在各处，每过一手就少一点。AutoMage 把它们汇到对应的事上：谁负责、到哪了、下一步是什么，每一条都带着出处。",
  },
  loop: {
    kicker: "02 · 推得动",
    title: "从一线，到判断，再回到一线",
    text: "它把一线的记录汇成判断材料，起草可选的方案；人只在要定的地方定。定了以后，任务回到一线，它接着跟，直到这件事有结果。",
    /* The ring is one turn of one standing duty, not a fixed workflow (philosophy §1). */
    note: "这是团队日报的一圈。换一件工作，圈上的步骤会不同；哪一步要人定，由你们定。",
  },
  gate: {
    kicker: "03 · 说得清",
    title: "AI 可以推进，但不能越权。",
    text: "线在哪里，由你们定。线内的事，它自己往前推；碰到线，它停下来，带着依据去找该定的人。每一次推进、确认、回流都留下记录，事后说得清。",
  },
} as const;

/** The noise: where an organization's progress actually sits. Positions are the chip's centre on the
    stage, in percent; `rot` tilts it, as notes thrown on a desk; `work` is the thing it belongs to, where
    it lands as a source. */
export const NOISE = [
  { source: "日报", text: "今天客户说交付要延期…", work: 0, x: 13, y: 11, rot: -4 },
  { source: "工作群", text: "@所有人 项目进度？", work: 0, x: 31, y: 6, rot: 3 },
  { source: "工作群", text: "已读未回", work: 2, x: 17, y: 31, rot: 2 },
  { source: "会议纪要", text: "讨论了，但没结论", work: 2, x: 32, y: 38, rot: -3 },
  { source: "表格", text: "Q2预算表_v3_最终版_改.xlsx", work: 1, x: 13, y: 56, rot: 3 },
  { source: "邮件", text: "FW: FW: FW: 请确认", work: 1, x: 30, y: 64, rot: -2 },
  { source: "口头交代", text: "老板说尽快搞定", work: 0, x: 15, y: 83, rot: 4 },
  { source: "周报", text: "这周做了很多事情…", work: 2, x: 32, y: 91, rot: -3 },
] as const;

/** What the noise becomes: things that each know who carries them, where they are and what is next;
    their sources are the notes that landed in them. */
export const WORKS = [
  { title: "客户交付延期", risk: "高", owner: "项目经理", state: "客户提了延期，交付资源还没排", next: "今天排好资源，下午回复客户" },
  { title: "Q2 预算调整", risk: "中", owner: "财务", state: "第三版改完了，还差审批", next: "周四前提交审批" },
  { title: "跨部门复盘会", risk: "低", owner: "运营", state: "会上提了，时间没定", next: "定在下周二，发会议通知" },
] as const;

/** Stage progress on the noise act: each note starts drifting at `start` and lands `NOTE_FLIGHT` later;
    a work fills in once its last note has landed. */
export const NOTE_FLIGHT = 0.35;
export const noteStart = (i: number) => 0.12 + i * 0.07;
export const workFill = (w: number) => Math.max(...NOISE.flatMap((note, i) => (note.work === w ? [noteStart(i) + NOTE_FLIGHT] : [])));

/** The loop an organization runs every day (philosophy §1: 看见 → 理解 → 决定 → 落实 → 再看见), drawn
    as the six steps of the daily chain AutoMage carries: people record and decide, AutoMage does the
    information work between. Not a fixed lifecycle for every work; one turn of one standing duty. */
export type LoopNode = {
  id: string;
  /** Where the turn's work stands once this step is done, shown at the ring's centre. */
  focus: string;
  label: string;
  actor: "person" | "ai";
  role: string;
  title: string;
  line: string;
  input: readonly string[];
  output: readonly string[];
  note: string;
};
export const NODES: readonly LoopNode[] = [
  {
    id: "record", focus: "23 条记录进来", label: "记录", actor: "person", role: "一线",
    title: "一线照常记录", line: "今天 5 个部门交了 23 条：日报、群里的进展、系统里的数。",
    input: ["日报", "群里的进展", "业务系统里的数"], output: ["23 条记录", "各自挂到对应的事上"],
    note: "大家照常写日报、在群里说话，不用多填一张表",
  },
  {
    id: "sum", focus: "4 个风险 · 1 处信息不全", label: "汇总", actor: "ai", role: "AutoMage",
    title: "汇成一份带出处的汇总", line: "认出 4 个风险、2 处相互依赖、1 处信息不全。",
    input: ["23 条记录", "这些事之前的进展"], output: ["4 个风险，按轻重排好", "信息不全的那处，已去问当事人"],
    note: "每一条都能点回原话",
  },
  {
    id: "review", focus: "3 条确认 · 1 条去补", label: "审阅", actor: "person", role: "主管",
    title: "主管过一遍", line: "3 条确认，1 条要补充。",
    input: ["汇总", "风险排序"], output: ["3 条确认", "1 条退回补充"],
    note: "要补充的那条，它去找当事人要",
  },
  {
    id: "draft", focus: "交付延期：2 个方案", label: "起草", actor: "ai", role: "AutoMage",
    title: "要定的事，起草方案", line: "交付延期要人定：两个方案，各自的代价和依据。",
    input: ["确认过的风险", "相关记录和以往的决定"], output: ["方案 A：延期，增派人手", "方案 B：调整范围，重排优先级"],
    note: "选项和依据一起，送到该定的人面前",
  },
  {
    id: "decide", focus: "碰到线 · 等负责人定", label: "拍板", actor: "person", role: "负责人",
    title: "碰到线，人来定", line: "交付延期碰到了你们定的线：由负责人定。",
    input: ["两个方案", "各自的代价", "截止时间"], output: ["选 B，优先级高", "周五前完成"],
    note: "回一句话就行",
  },
  {
    id: "back", focus: "5 项任务在跟", label: "回到一线", actor: "ai", role: "AutoMage",
    title: "回到一线，接着跟", line: "拆成 5 项任务，派给 3 个人。",
    input: ["决定：方案 B", "优先级高 · 周五前"], output: ["任务 01：同步客户延期风险", "任务 02：补充依赖说明", "任务 03：更新交付计划"],
    note: "谁接了、做到哪、卡在哪，都记回这件事；下一圈从这里开始",
  },
];

/** Stage progress at which the marker reaches each node; the turn closes back at the top at LOOP_END. */
export const LOOP_START = 0.3;
export const LOOP_STEP = 0.5;
export const LOOP_END = LOOP_START + NODES.length * LOOP_STEP;
export const reachOf = (k: number) => (k <= 0 ? -1 : k >= NODES.length ? 99 : LOOP_START + k * LOOP_STEP);
/** Where on the ring the line is: between drafting and the decision, in node steps from the top. */
export const LINE_STEP = NODES.findIndex((node) => node.id === "decide") - 0.5;

/** One turn, counted: each count lights when the node that produces it is reached. */
export const COUNTS = [
  { n: "23", unit: "条记录", node: 0 },
  { n: "4", unit: "个风险", node: 1 },
  { n: "1", unit: "个决定", node: 4 },
  { n: "5", unit: "项任务", node: 5 },
] as const;

/** One pass through a line, left to right; the line itself is the second station. */
export const GATE = [
  { actor: "ai", title: "线内，它自己推进", text: "汇总、追问、起草、跟进，不用等人吩咐。" },
  { actor: "line", title: "碰到你们定的线", text: "花钱、改交期、对外承诺……线由你们定，可以不止一条。" },
  { actor: "person", title: "该定的人来定", text: "依据和选项一起到，回一句话就行。" },
  { actor: "ai", title: "定了，接着推进", text: "结果记回这件事：谁定的、凭什么，都查得到。" },
] as const;

export const FACTS = [
  { icon: "shield", title: "数据不裸奔", text: "脱敏处理、权限隔离，支持私有化部署，数据可以不出你们的服务器。" },
  { icon: "scale", title: "不越权", text: "碰到线的决定由人做。它能做到哪，由你们定，不会自己扩大。" },
  { icon: "history", title: "行为可追溯", text: "每一次推进、确认、回流都有记录，能点回原始出处。" },
] as const;

export const DOORS = {
  work: {
    tab: "AI for Work · 新公司运行模式",
    href: "/work",
    title: "同一家公司的一周，过两遍",
    text: "没有 AutoMage 时，想知道一件事，得一层层问下去；有了它，同一周里传来传去的话少了一大半，要人定的事带着依据，找到该定的人。",
    cta: "进入 AI for Work",
  },
  supply: {
    tab: "AI+供应链",
    href: "/scenarios/supply-chain",
    title: "一项缺料风险，交给 AutoMage 之后的 14 天",
    text: "PA66 树脂预计第 12 天跌破安全库存。它查库存、问供应商、算缺口、起草方案；要花钱的那一步，回到供应链负责人手上。第 6 天供应商只交了一部分，原来的方案不成立了，它重新打开这件事。",
    cta: "进入 AI+供应链",
    note: "可以亲手操作：签批方案，条件变了重新决定，改一条规矩再重放。",
  },
  library: {
    tab: "AI 自动化能力库",
    href: "/market",
    title: "它能接手的具体工作",
    text: "客户流失复盘、找货源比价、合同审阅、视频脚本……按你要完成的工作找：看它交付什么、你要提供什么、到哪一步回来找你。",
    cta: "进入能力库",
  },
} as const;

/** The AI for Work week as marks: every line, day by day, in the week without AutoMage and the same
    week with it. Said by a person, only thought (unsaid), or brought by AutoMage. */
type Mark = "said" | "unsaid" | "ai";
const markOf = (line: Line): Mark => (line.kind === "unsaid" ? "unsaid" : line.kind === "ai" || line.kind === "owner" ? "ai" : "said");
export const WEEK = DAYS.map((day, i) => ({
  day,
  before: LINES.filter((line) => line.day === i && line.added === undefined).map(markOf),
  after: LINES.filter((line) => line.day === i && line.fold === undefined).map(markOf),
}));
export const WEEK_TOTAL = { before: WEEK.reduce((n, d) => n + d.before.length, 0), after: WEEK.reduce((n, d) => n + d.after.length, 0) };

/** The AI+供应链 stock, from the same model the tab runs: left alone, and with the plan AutoMage
    carried (v1 split, the day 6 gap closed by supplier C). */
const ctx = (v1: Ctx["v1"], v2: Ctx["v2"]): Ctx => ({ run: "first", rule: "confirm_all", v1, v2 });
const alone = projectionAt(1, ctx(null, null), { v1Signed: false, v2Signed: false });
const carried = projectionAt(LAST_DAY, ctx("split", "spot"), { v1Signed: true, v2Signed: true });
export const STOCK = {
  days: LAST_DAY,
  safety: N.safety,
  top: N.stock,
  alone: alone.series.slice(0, LAST_DAY + 1),
  carried: carried.series.slice(0, LAST_DAY + 1),
  breachDay: alone.breachDay,
  marks: [
    { day: 3, text: "签批方案" },
    { day: 6, text: "供应商少交" },
    { day: 9, text: "缺口补上" },
  ],
};

/** The library door's figures, from the catalog the library tab itself shows. */
export function libraryOf(catalog: SkillCatalog) {
  const listed = findGroups(catalog, "");
  return {
    areas: WORK_AREAS.map((area) => ({ title: area.title, count: listed.filter((group) => group.area === area.id).length })),
    groups: listed.length,
    skills: catalog.getAll().length,
    examples: SKILL_GROUPS.filter((group) => listed.includes(group)).slice(0, 4).map((group) => group.title),
  };
}

export const FAQ = [
  {
    q: "AutoMage 是什么？",
    a: "给企业用的 AI 工作系统。群聊、日报、业务系统里的信息，它汇到对应的事上，汇总、追问、起草、跟进，让事情一直往前走；碰到你们定的线，它带着依据来找该定的人。它不是聊天工具，也不是项目管理工具。",
  },
  {
    q: "跟飞书、钉钉有什么区别？",
    a: "飞书、钉钉解决的是沟通效率：让消息传得更快。AutoMage 解决的是信息结构：消息里的进展、承诺和风险，被记到对应的事上，不失真、不遗漏，接着往下跟。它不替代你们的沟通工具。",
  },
  {
    q: "要换掉我们现在的系统吗？",
    a: "不用。大家照常在群里说话、写日报，业务系统照常记录；AutoMage 在这些地方之间工作。接入哪些系统、线怎么定，部署时按你们的情况配置。",
  },
  {
    q: "数据安全怎么保证？",
    a: "三层：数据脱敏后再交给 AI 处理；支持本地私有化部署，数据可以不出你们的服务器；按角色隔离权限，每一次操作都有审计记录。",
  },
  {
    q: "AI 出错、越权怎么办？",
    a: "AI 能理解模糊的情况，也可能理解错，所以它带着依据和边界工作：每个判断都标出处，不知道的标出来、去问；碰到线一定停下来找人，它的权限不会自己扩大。所有动作都有记录，可以追溯，也可以收紧。",
  },
  {
    q: "从哪里开始？",
    a: "从一件具体的事开始：最近卡住的、要有人一直记着的那件。我们一起定好交给它什么、它能做到哪、什么时候回来找人，再把它交给 AutoMage。",
  },
] as const;

export const CLOSING = {
  title: "带一件最近卡住的事来",
  text: "进展在谁那里、谁在追、哪一步必须由人拍板。我们按你们的系统和规矩，把它交给 AutoMage。",
  primary: "预约演示",
  secondary: "先看能力库",
} as const;
