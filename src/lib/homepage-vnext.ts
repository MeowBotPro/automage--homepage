export type ContentMode = 'demo' | 'live';

export type EpistemicType =
  | 'observed_fact'
  | 'derived_fact'
  | 'inference'
  | 'recommendation'
  | 'user_assertion';

export type GovernanceStatus =
  | 'unreviewed'
  | 'awaiting_review'
  | 'revised'
  | 'rejected'
  | 'approved'
  | 'expired';

export type ExecutionStatus =
  | 'not_attempted'
  | 'dispatched'
  | 'acknowledged'
  | 'failed'
  | 'handed_off';

export type VerificationStatus = 'unmeasured' | 'measured' | 'disputed' | 'verified';

export interface Provenance {
  source: string;
  evidenceRef: string;
  capturedAt: string;
  freshness: string;
}

export interface EvidenceClaim {
  id: string;
  label: string;
  value: string;
  note: string;
  mode: ContentMode;
  epistemicType: EpistemicType;
  provenance: Provenance;
  governance: GovernanceStatus;
  execution: ExecutionStatus;
  verification: VerificationStatus;
}

export interface ScenarioOption {
  id: 'immediate' | 'split';
  name: string;
  shorthand: string;
  quantity: string;
  cost: string;
  deliveryRisk: string;
  cashUse: string;
  unknown: string;
  recommendation: string;
}

export const SCENARIO = {
  mode: 'demo' as const,
  id: 'SC-DEMO-0817',
  title: '原材料 A 缺料风险',
  statement: '原材料 A 预计在 12 天后跌破安全库存。',
  source: 'WMS 演示快照',
  capturedAt: 'T+00 · 固定演示时间',
  facts: [
    {
      id: 'inventory-on-hand',
      label: '可用库存',
      value: '126 吨',
      note: '演示快照中的可用库存，不代表真实企业数据。',
      mode: 'demo',
      epistemicType: 'observed_fact',
      provenance: {
        source: 'WMS 演示快照', evidenceRef: 'DEMO-WMS-001', capturedAt: 'T+00', freshness: '固定演示数据',
      },
      governance: 'unreviewed', execution: 'not_attempted', verification: 'unmeasured',
    },
    {
      id: 'daily-consumption',
      label: '日均消耗',
      value: '17.4 吨',
      note: '用于演示缺口推导的确定性输入。',
      mode: 'demo',
      epistemicType: 'observed_fact',
      provenance: {
        source: 'MES 演示快照', evidenceRef: 'DEMO-MES-002', capturedAt: 'T+00', freshness: '固定演示数据',
      },
      governance: 'unreviewed', execution: 'not_attempted', verification: 'unmeasured',
    },
    {
      id: 'locked-orders',
      label: '受影响订单',
      value: '3 个',
      note: '由订单与物料关系生成的演示关联。',
      mode: 'demo',
      epistemicType: 'derived_fact',
      provenance: {
        source: 'ERP 演示订单集', evidenceRef: 'DEMO-ERP-003', capturedAt: 'T+01', freshness: '固定演示数据',
      },
      governance: 'unreviewed', execution: 'not_attempted', verification: 'unmeasured',
    },
    {
      id: 'supplier-lead-time',
      label: '平均交期',
      value: '16 天',
      note: '三家候选供应商历史样本的演示聚合值。',
      mode: 'demo',
      epistemicType: 'derived_fact',
      provenance: {
        source: '供应商履约演示集', evidenceRef: 'DEMO-SRM-004', capturedAt: 'T+01', freshness: '固定演示数据',
      },
      governance: 'unreviewed', execution: 'not_attempted', verification: 'unmeasured',
    },
  ] satisfies EvidenceClaim[],
  inferences: [
    {
      id: 'shortage-window',
      label: '缺料窗口',
      value: '约 12 天后',
      note: '基于演示库存和消耗速率推导，不是实时预测。',
      mode: 'demo',
      epistemicType: 'inference',
      provenance: {
        source: '演示推断规则', evidenceRef: 'DEMO-RULE-005', capturedAt: 'T+02', freshness: '随本演示输入计算',
      },
      governance: 'awaiting_review', execution: 'not_attempted', verification: 'unmeasured',
    },
    {
      id: 'price-range',
      label: '14 天价格区间',
      value: '+2.9% 至 +5.1%',
      note: '仅用于展示推断与事实的边界，不代表可用预测模型。',
      mode: 'demo',
      epistemicType: 'inference',
      provenance: {
        source: '价格趋势演示模型', evidenceRef: 'DEMO-MODEL-006', capturedAt: 'T+02', freshness: '固定演示输出',
      },
      governance: 'awaiting_review', execution: 'not_attempted', verification: 'unmeasured',
    },
  ] satisfies EvidenceClaim[],
  unknowns: [
    '供应商 B 能否将交期提前 4 天',
    '客户订单 C 是否允许拆分交付',
    '第二批采购时的实际价格',
  ],
};

export const MANUAL_CHAIN = [
  { role: '仓库', question: '实际可用库存是多少？', source: 'WMS / 盘点记录' },
  { role: '销售', question: '哪三个订单不能延期？', source: 'ERP / 客户沟通' },
  { role: '计划', question: '排产是否可以调整？', source: 'MES / 生产计划' },
  { role: '采购', question: '谁能在风险日前交付？', source: 'SRM / 询价记录' },
  { role: '财务', question: '现金占用是否在预算内？', source: '预算 / 资金计划' },
  { role: '负责人', question: '哪个方案值得承担？', source: '责任 / 授权策略' },
];

export const CAPABILITIES = [
  { name: '库存检查', state: '已读取演示快照' },
  { name: '订单影响分析', state: '已建立演示关联' },
  { name: '供应商履约分析', state: '正在比较 3 个候选' },
  { name: '价格趋势分析', state: '推断示例 · 未验证' },
];

export const OPTIONS: ScenarioOption[] = [
  {
    id: 'immediate', name: '方案 A · 立即补货', shorthand: '一次补齐', quantity: '85 吨',
    cost: '相对较高', deliveryRisk: '低', cashUse: '高', unknown: '供应商议价空间',
    recommendation: '优先保障交付，接受较高现金占用。',
  },
  {
    id: 'split', name: '方案 B · 分批采购', shorthand: '40 + 45 吨', quantity: '85 吨',
    cost: '相对较低', deliveryRisk: '中', cashUse: '中', unknown: '第二批价格波动',
    recommendation: '平衡交付与现金占用，保留第二批调整空间。',
  },
];

export const CORE_PRIMITIVES = [
  ['Event', '接住业务事件'], ['Context', '补齐最小完整上下文'], ['Explore', '核验事实、未知与选项'],
  ['Gate', '约束责任与授权范围'], ['Commit', '推进经过授权的动作'],
  ['Evidence', '收集回执与结果证据'], ['Continuity', '维持事件直到关闭'],
] as const;

export const MATURITY = [
  { layer: '协同', state: '本页确定性演示', description: '展示事件、上下文、方案、门控和回执语义，不连接真实企业系统。' },
  { layer: '预测', state: '推断示例 · 待验证', description: '仅演示事实与模型推断如何分离，不主张真实准确率。' },
  { layer: '金融', state: '路线图纵深', description: '本页不触发授信、付款、放款或任何银行接口。' },
];
