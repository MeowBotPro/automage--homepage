import type { SkillRecord } from "./skill-catalog";

// Public copy uses per-Skill inventory facts; sourceRef preserves provenance.
export const SKILL_RECORDS = [
  {
    "id": "aigtm-crm",
    "domain": "CRM",
    "title": "今日销售优先事项",
    "summary": "把 CRM 快照压成销售今天真正该跟的几件事。",
    "inputs": [
      "粘贴的客户记录"
    ],
    "output": "当日优先事项看板",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/aigtm-crm/SKILL.md"
  },
  {
    "id": "capacity-planner",
    "domain": "CRM",
    "title": "客服人力规划",
    "summary": "按进线量估算班次和编制，供管理者拍板。",
    "inputs": [
      "进线量数据"
    ],
    "output": "编制与班次建议",
    "gate": "none (budget still human)",
    "kind": "tool",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/capacity-planner/SKILL.md"
  },
  {
    "id": "chief-customer-officer-advisor",
    "domain": "CRM",
    "title": "客户成功顾问",
    "summary": "从留存和覆盖看客户健康，给出管理建议。",
    "inputs": [
      "客户成功指标"
    ],
    "output": "客户成功策略建议",
    "gate": null,
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/chief-customer-officer-advisor/SKILL.md"
  },
  {
    "id": "churn-autopsy",
    "domain": "CRM",
    "title": "客户流失复盘",
    "summary": "拆开一个已流失客户，找出当时错过的信号。",
    "inputs": [
      "客户历史记录",
      "服务工单",
      "使用记录"
    ],
    "output": "流失复盘报告",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/churn-autopsy/SKILL.md"
  },
  {
    "id": "churn-prevention",
    "domain": "CRM",
    "title": "流失挽回",
    "summary": "在取消和催收路径上准备可审阅的挽回方案。",
    "inputs": [
      "订阅账单",
      "客户服务记录"
    ],
    "output": "挽回方案",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/churn-prevention/SKILL.md"
  },
  {
    "id": "cordys-crm",
    "domain": "CRM",
    "title": "线索到回款助手",
    "summary": "沿线索到回款链路整理客户与漏斗。",
    "inputs": [
      "Cordys 系统接入",
      "使用者职责"
    ],
    "output": "客户全景和漏斗",
    "gate": "审批命令族",
    "kind": "role",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/cordys-crm/SKILL.md"
  },
  {
    "id": "crm-lookup",
    "domain": "CRM",
    "title": "HubSpot 客户档案查询",
    "summary": "按编号、邮箱或名称查询 HubSpot，并查看关联公司、联系人和商机。",
    "inputs": [
      "记录编号",
      "邮箱",
      "姓名"
    ],
    "output": "客户档案",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/crm-lookup/SKILL.md"
  },
  {
    "id": "crm-sync",
    "domain": "CRM",
    "title": "客户资料同步",
    "summary": "把名单写入 CRM，写入前需确认。",
    "inputs": [
      "市场名单"
    ],
    "output": "写入后的客户记录",
    "gate": "typed-yes + approval-manager",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/crm-sync/SKILL.md"
  },
  {
    "id": "lead-dossier",
    "domain": "CRM",
    "title": "客户背景卷宗",
    "summary": "从多源公开信息汇编一份客户档案。",
    "inputs": [
      "企业域名",
      "销售线索"
    ],
    "output": "客户背景卷宗",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/lead-dossier/SKILL.md"
  },
  {
    "id": "lead-import",
    "domain": "CRM",
    "title": "线索导入",
    "summary": "CSV 去重打分后导入 CRM，需人工确认。",
    "inputs": [
      "CSV 表格"
    ],
    "output": "导入报告",
    "gate": "typed-yes mandatory",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/lead-import/SKILL.md"
  },
  {
    "id": "magnus919-crm",
    "domain": "CRM",
    "title": "HubSpot 阶段推进",
    "summary": "读取商机并推进阶段，写入需确认。",
    "inputs": [
      "HubSpot 系统接入"
    ],
    "output": "查询记录",
    "gate": "explicit --yes on writes",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/magnus919-crm/SKILL.md"
  },
  {
    "id": "predictable-revenue",
    "domain": "CRM",
    "title": "销售开发与跟进节奏",
    "summary": "按 SDR / AE / CSM 角色组织外呼节奏。",
    "inputs": [
      "组织目标"
    ],
    "output": "增长剧本",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/predictable-revenue/SKILL.md"
  },
  {
    "id": "revops-salesforce",
    "domain": "CRM",
    "title": "Salesforce 运营模式",
    "summary": "整理对象、流程和预测的落地方式。",
    "inputs": [
      "Salesforce 业务资料"
    ],
    "output": "实施说明",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/revops-salesforce/SKILL.md"
  },
  {
    "id": "sales-pipeline",
    "domain": "CRM",
    "title": "销售管道复苏",
    "summary": "识别沉睡商机并重新分配跟进。",
    "inputs": [
      "事件接入",
      "目标客户画像"
    ],
    "output": "已分流的线索",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/sales-pipeline/SKILL.md"
  },
  {
    "id": "zoho",
    "domain": "CRM",
    "title": "Zoho 客户与项目",
    "summary": "查询 Zoho 中的客户、任务和会议。",
    "inputs": [
      "Zoho 系统接入"
    ],
    "output": "商机与任务记录",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "CRM.zip :: CRM/zoho/SKILL.md"
  },
  {
    "id": "ai-sales-team-claude",
    "domain": "CRM",
    "title": "AI 销售小组",
    "summary": "从画像、触达、异议到方案的一组销售技能。",
    "inputs": [
      "潜在客户"
    ],
    "output": "开发记录与报告",
    "gate": "email “do not send empty bump”",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 13,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: ai-sales-team-claude"
  },
  {
    "id": "cs-sop",
    "domain": "客服",
    "title": "客服 SOP",
    "summary": "整理一线到升级的话术、时限和模板。",
    "inputs": [
      "政策要求"
    ],
    "output": "客服作业说明",
    "gate": "refund > threshold → L2",
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "客服.zip :: σ«óµ£ì/cs-sop/SKILL.md"
  },
  {
    "id": "tw-ecom-operations-customer-service",
    "domain": "客服",
    "title": "台湾电商客服",
    "summary": "覆盖即时通讯与鉴赏期规则的应答。",
    "inputs": [
      "渠道消息"
    ],
    "output": "应答话术",
    "gate": "消保法 constraints",
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "客服.zip :: σ«óµ£ì/tw-ecom-operations-customer-service/SKILL.md"
  },
  {
    "id": "wecom-ai-customer-service",
    "domain": "客服",
    "title": "企业微信客服",
    "summary": "在企微里应答并在低把握时转人工。",
    "inputs": [
      "企业微信消息接入",
      "知识库"
    ],
    "output": "回复内容",
    "gate": "human handoff (confidence / claim)",
    "kind": "role",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "客服.zip :: σ«óµ£ì/wecom-ai-customer-service/SKILL.md"
  },
  {
    "id": "support-ticket-triage",
    "domain": "客服",
    "title": "工单分流",
    "summary": "按知识库和系统把工单分到该处理的人。",
    "inputs": [
      "服务工单"
    ],
    "output": "已分流的工单",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "客服.zip :: σ«óµ£ì/support-ticket-triage/SKILL.md"
  },
  {
    "id": "social-reply-bot",
    "domain": "客服",
    "title": "社媒回复",
    "summary": "在公开社交渠道准备可发出的回复。",
    "inputs": [
      "社交内容"
    ],
    "output": "待发送回复",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "客服.zip :: σ«óµ£ì/social-reply-bot/SKILL.md"
  },
  {
    "id": "cs-chatbot-design",
    "domain": "客服",
    "title": "客服对话设计",
    "summary": "设计意图、槽位和转人工边界。",
    "inputs": [
      "需求说明"
    ],
    "output": "对话设计说明",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "客服.zip :: σ«óµ£ì/cs-chatbot-design/SKILL.md"
  },
  {
    "id": "pollyreach",
    "domain": "客服",
    "title": "电话代办",
    "summary": "用电话号码完成指定外呼任务。",
    "inputs": [
      "电话号码"
    ],
    "output": "通话结果",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "客服.zip :: σ«óµ£ì/pollyreach/SKILL.md"
  },
  {
    "id": "internal-comms",
    "domain": "客服",
    "title": "内部沟通稿",
    "summary": "把简报写成可下发的内部通知。",
    "inputs": [
      "客户简报"
    ],
    "output": "分析备忘录",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "客服.zip :: σ«óµ£ì/internal-comms/SKILL.md"
  },
  {
    "id": "cs-notification-strategy",
    "domain": "客服",
    "title": "触达节奏",
    "summary": "决定何时通过哪条通道通知客户。",
    "inputs": [
      "产品资料",
      "目标受众"
    ],
    "output": "触达计划",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "客服.zip :: σ«óµ£ì/cs-notification-strategy/SKILL.md"
  },
  {
    "id": "cs-analytics",
    "domain": "客服",
    "title": "客服质量指标",
    "summary": "整理满意度、一次解决率等管理数字。",
    "inputs": [
      "客户成功指标"
    ],
    "output": "经营分析建议",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "客服.zip :: σ«óµ£ì/cs-analytics/SKILL.md"
  },
  {
    "id": "happycapy-customer-service",
    "domain": "客服",
    "title": "HappyCapy 客服人设",
    "summary": "针对该产品工单起草待发送回复。",
    "inputs": [
      "工单内容"
    ],
    "output": "回复草稿",
    "gate": "skill-update confirm on conflict",
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "客服.zip :: σ«óµ£ì/happycapy-customer-service/SKILL.md"
  },
  {
    "id": "1688-procurement-agent",
    "domain": "外贸",
    "title": "1688 采购流程指导",
    "summary": "围绕供应商评估、谈判、质量控制与物流安排，提供采购流程辅导。",
    "inputs": [
      "采购需求与现有经验",
      "供应商与交付条件",
      "质检、谈判或物流问题"
    ],
    "output": "采购评估、议价与质检指导",
    "gate": null,
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/1688-procurement-agent/SKILL.md"
  },
  {
    "id": "1688-product-find",
    "domain": "外贸",
    "title": "1688 找货比价",
    "summary": "按图或关键词找同款并比较价格。",
    "inputs": [
      "文字描述",
      "图片",
      "链接"
    ],
    "output": "商品与供应商对照表",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/1688-product-find/SKILL.md"
  },
  {
    "id": "1688-product-to-ozon",
    "domain": "外贸",
    "title": "1688 铺货 Ozon",
    "summary": "把 1688 商品转成海外店铺上架资料。",
    "inputs": [
      "1688 商品信息"
    ],
    "output": "Ozon 上架资料",
    "gate": "API write (implicit)",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/1688-product-to-ozon/SKILL.md"
  },
  {
    "id": "1688-sourcing-agent",
    "domain": "外贸",
    "title": "1688 寻源指导",
    "summary": "为国际买家讲解供应商核验、选品、议价与物流规划的方法。",
    "inputs": [
      "采购目标与商品类别",
      "已有供应商信息",
      "议价与物流问题"
    ],
    "output": "寻源方法与核验建议",
    "gate": null,
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/1688-sourcing-agent/SKILL.md"
  },
  {
    "id": "1688-supplychain-order-inquiry",
    "domain": "外贸",
    "title": "1688 订单询盘",
    "summary": "针对已有订单询价或议目标总价。",
    "inputs": [
      "订单编号",
      "具体问题"
    ],
    "output": "询盘记录",
    "gate": "confirm order id; no fake results",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/1688-supplychain-order-inquiry/SKILL.md"
  },
  {
    "id": "aes-product-sourcing-advisor",
    "domain": "外贸",
    "title": "产地与供应商评估",
    "summary": "按成本、交期和风险给地区建议。",
    "inputs": [
      "产品资料",
      "约束条件"
    ],
    "output": "产地与供应商建议",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/aes-product-sourcing-advisor/SKILL.md"
  },
  {
    "id": "auto-trade-customer-development",
    "domain": "外贸",
    "title": "外贸开发流水",
    "summary": "搜索、背调、写信到入库的一条开发链。",
    "inputs": [
      "一句话构想"
    ],
    "output": "触达记录",
    "gate": "sending is in the pipeline",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/auto-trade-customer-development/SKILL.md"
  },
  {
    "id": "b2b-cold-outreach",
    "domain": "外贸",
    "title": "B2B 开发信",
    "summary": "按产品和客户画像起草开发信。",
    "inputs": [
      "产品资料",
      "目标客户画像"
    ],
    "output": "邮件草稿",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/b2b-cold-outreach/SKILL.md"
  },
  {
    "id": "b2b-customs-data",
    "domain": "外贸",
    "title": "海关进出口筛选",
    "summary": "按税号或公司看采购商与贸易记录。",
    "inputs": [
      "商品税号",
      "企业资料"
    ],
    "output": "贸易信息",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/b2b-customs-data/SKILL.md"
  },
  {
    "id": "b2b-doc-generation",
    "domain": "外贸",
    "title": "外贸单证起草",
    "summary": "生成形式发票、合同和报价单草稿。",
    "inputs": [
      "交易事实"
    ],
    "output": "文档",
    "gate": "推测需人工核实",
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/b2b-doc-generation/SKILL.md"
  },
  {
    "id": "b2b-email-intel",
    "domain": "外贸",
    "title": "邮箱可信度核查",
    "summary": "对开发对象邮箱做来源与风险核验。",
    "inputs": [
      "邮箱"
    ],
    "output": "核验报告",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/b2b-email-intel/SKILL.md"
  },
  {
    "id": "b2b-exhibition",
    "domain": "外贸",
    "title": "展会跟进",
    "summary": "覆盖展前邀约、现场和会后跟进。",
    "inputs": [
      "展会资料",
      "清单"
    ],
    "output": "邀约与跟进材料",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/b2b-exhibition/SKILL.md"
  },
  {
    "id": "b2b-inquiry-meeting",
    "domain": "外贸",
    "title": "询盘复盘会",
    "summary": "把一周询盘整理成可开会的材料。",
    "inputs": [
      "询盘记录"
    ],
    "output": "复盘会材料",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/b2b-inquiry-meeting/SKILL.md"
  },
  {
    "id": "b2b-lead-generation",
    "domain": "外贸",
    "title": "B2B 线索开发",
    "summary": "从地图和社交渠道找客户并写信。",
    "inputs": [
      "目标客户画像"
    ],
    "output": "线索与开发文案",
    "gate": "sample-before-bulk (trade)",
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/b2b-lead-generation/SKILL.md"
  },
  {
    "id": "b2b-product-description",
    "domain": "外贸",
    "title": "外贸产品描述",
    "summary": "按卖点结构写产品说明。",
    "inputs": [
      "产品事实"
    ],
    "output": "产品描述",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/b2b-product-description/SKILL.md"
  },
  {
    "id": "b2b-trade-compliance",
    "domain": "外贸",
    "title": "上架与文化合规",
    "summary": "检查禁忌、条款和翻译是否可上架。",
    "inputs": [
      "产品描述",
      "商务条款"
    ],
    "output": "合同风险标注",
    "gate": "disclaimer-ish",
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/b2b-trade-compliance/SKILL.md"
  },
  {
    "id": "customs-trade-report",
    "domain": "外贸",
    "title": "中国税号与关税",
    "summary": "按商品描述给出八位税号和税率说明。",
    "inputs": [
      "产品描述"
    ],
    "output": "税号与税率说明",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/customs-trade-report/SKILL.md"
  },
  {
    "id": "industry-research-system",
    "domain": "外贸",
    "title": "行业研究库",
    "summary": "把一个行业题目收成可持续更新的研究库。",
    "inputs": [
      "主题"
    ],
    "output": "行业研究库",
    "gate": null,
    "kind": "pack",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/industry-research-system/SKILL.md"
  },
  {
    "id": "procurement-optimizer",
    "domain": "外贸",
    "title": "采购周期审计",
    "summary": "分析采购订单到货时间，找出采购周期中的延迟。",
    "inputs": [
      "采购订单时间记录"
    ],
    "output": "采购周期分析",
    "gate": "CFO approval thresholds as *topic*",
    "kind": "tool",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/procurement-optimizer/SKILL.md"
  },
  {
    "id": "tradehot",
    "domain": "外贸",
    "title": "跨境贸易雷达",
    "summary": "跟踪外贸热点与买家动向。",
    "inputs": [
      "查询需求"
    ],
    "output": "客户简报",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/tradehot/SKILL.md"
  },
  {
    "id": "vendor-management",
    "domain": "外贸",
    "title": "供应商评分",
    "summary": "给第三方供应商打风险与履约分。",
    "inputs": [
      "供应商名单"
    ],
    "output": "核查报告",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "外贸.zip :: σñûΦ┤╕/vendor-management/SKILL.md"
  },
  {
    "id": "afa-product",
    "domain": "电商",
    "title": "DTC 选品与定价",
    "summary": "咨询向选品、成本和备货，不直接操作供应链。",
    "inputs": [
      "品牌资料",
      "商品与规格资料"
    ],
    "output": "客户成功策略建议",
    "gate": "“不直接操作供应链”",
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/afa-product/SKILL.md"
  },
  {
    "id": "afa-launch",
    "domain": "电商",
    "title": "DTC 冷启动",
    "summary": "按四阶段安排从产品到首单的动作。",
    "inputs": [
      "产品资料"
    ],
    "output": "上线计划",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/afa-launch/SKILL.md"
  },
  {
    "id": "afa-creative",
    "domain": "电商",
    "title": "广告创意矩阵",
    "summary": "准备素材组合并标出疲劳风险。",
    "inputs": [
      "品牌名",
      "产品与报价"
    ],
    "output": "广告方案",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/afa-creative/SKILL.md"
  },
  {
    "id": "category-selection",
    "domain": "电商",
    "title": "亚马逊品类选择",
    "summary": "从五个维度评估是否进入某品类。",
    "inputs": [
      "商品品类"
    ],
    "output": "个股研报",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/category-selection/SKILL.md"
  },
  {
    "id": "conversion-rate-optimization",
    "domain": "电商",
    "title": "店铺转化审计",
    "summary": "指出页面上阻碍下单的问题。",
    "inputs": [
      "店铺链接",
      "业务数据"
    ],
    "output": "优化实验建议",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/conversion-rate-optimization/SKILL.md"
  },
  {
    "id": "design-pipeline",
    "domain": "电商",
    "title": "主图与海报流水",
    "summary": "按竞品风格产出主图和海报。",
    "inputs": [
      "参考店铺"
    ],
    "output": "主图和海报",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/design-pipeline/SKILL.md"
  },
  {
    "id": "ecommerce-designer",
    "domain": "电商",
    "title": "详情页设计",
    "summary": "按平台尺寸出详情和海报。",
    "inputs": [
      "客户简报"
    ],
    "output": "创意素材",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/ecommerce-designer/SKILL.md"
  },
  {
    "id": "ecommerce-landing-page",
    "domain": "电商",
    "title": "落地页转化检查",
    "summary": "审计落地页是否说清购买理由。",
    "inputs": [
      "网页链接"
    ],
    "output": "改进建议",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/ecommerce-landing-page/SKILL.md"
  },
  {
    "id": "keyword-research",
    "domain": "电商",
    "title": "亚马逊关键词",
    "summary": "把种子词扩成可投放的关键词表。",
    "inputs": [
      "初始关键词"
    ],
    "output": "分类关键词表",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/keyword-research/SKILL.md"
  },
  {
    "id": "maishou",
    "domain": "电商",
    "title": "国内电商比价",
    "summary": "对比淘宝、京东、拼多多和抖音价格。",
    "inputs": [
      "产品资料"
    ],
    "output": "价格对照表",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/maishou/SKILL.md"
  },
  {
    "id": "product-description-generator",
    "domain": "电商",
    "title": "多平台详情文案",
    "summary": "生成标题、卖点和详情正文。",
    "inputs": [
      "产品事实"
    ],
    "output": "标题与卖点",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/product-description-generator/SKILL.md"
  },
  {
    "id": "product-page-seo",
    "domain": "电商",
    "title": "详情页搜索优化",
    "summary": "检查页面是否能被搜到。",
    "inputs": [
      "页面内容"
    ],
    "output": "搜索优化建议",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/product-page-seo/SKILL.md"
  },
  {
    "id": "product-title-optimization",
    "domain": "电商",
    "title": "标题点击优化",
    "summary": "改写标题以提高搜索和点击。",
    "inputs": [
      "标题",
      "关键词"
    ],
    "output": "改写内容",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/product-title-optimization/SKILL.md"
  },
  {
    "id": "review-analysis",
    "domain": "电商",
    "title": "评价痛点分析",
    "summary": "从差评里抽出退货原因和客服话术。",
    "inputs": [
      "亚马逊商品编号",
      "商品评论"
    ],
    "output": "改进+客服模板",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/review-analysis/SKILL.md"
  },
  {
    "id": "store-teardown",
    "domain": "电商",
    "title": "店铺视觉拆解",
    "summary": "拆竞品店铺的视觉系统。",
    "inputs": [
      "店铺链接"
    ],
    "output": "视觉方案",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/store-teardown/SKILL.md"
  },
  {
    "id": "xhs-note-creator",
    "domain": "电商",
    "title": "小红书笔记",
    "summary": "生成笔记、卡片并可准备发布。",
    "inputs": [
      "客户简报"
    ],
    "output": "图文笔记",
    "gate": "publish implied",
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/xhs-note-creator/SKILL.md"
  },
  {
    "id": "zach-feature-demand-validator",
    "domain": "电商",
    "title": "微创新真伪校验",
    "summary": "用评价和搜索验证功能是否真有需求。",
    "inputs": [
      "商品评论",
      "关键词",
      "社群内容"
    ],
    "output": "是否进入该品类",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/zach-feature-demand-validator/SKILL.md"
  },
  {
    "id": "zach-listing-health-checker",
    "domain": "电商",
    "title": "Listing 健康检查",
    "summary": "从买家视角抓取并评估亚马逊页面。",
    "inputs": [
      "亚马逊商品编号"
    ],
    "output": "Listing 健康报告",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/zach-listing-health-checker/SKILL.md"
  },
  {
    "id": "zach-product-research",
    "domain": "电商",
    "title": "选品可否进入",
    "summary": "给出品类进入的是或否。",
    "inputs": [
      "商品品类"
    ],
    "output": "选品报告",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/zach-product-research/SKILL.md"
  },
  {
    "id": "zach-search-term-report-analyzer",
    "domain": "电商",
    "title": "广告搜索词报告",
    "summary": "把广告搜索词整理成投放决策。",
    "inputs": [
      "广告数据表"
    ],
    "output": "决策建议",
    "gate": "human semantic class",
    "kind": "tool",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/zach-search-term-report-analyzer/SKILL.md"
  },
  {
    "id": "amazon-listing-builder",
    "domain": "电商",
    "title": "亚马逊 Listing 工程",
    "summary": "按八步生成可上架资料。",
    "inputs": [
      "MCP 卖家精灵"
    ],
    "output": "上架资料包",
    "gate": "MCP>browser rule",
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "电商.zip :: τö╡σòå/amazon-listing-builder/skill.md"
  },
  {
    "id": "account-research",
    "domain": "销售",
    "title": "大客户调研",
    "summary": "按 Sparq 销售方法研究目标客户，生成包含业务线索与匹配判断的 Word 简报。",
    "inputs": [
      "企业资料"
    ],
    "output": "带评估的客户简报",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/account-research/SKILL.md"
  },
  {
    "id": "account-strategy",
    "domain": "销售",
    "title": "大客户策略备忘",
    "summary": "写成内部可传阅的攻单策略。",
    "inputs": [
      "调研资料"
    ],
    "output": "攻单策略备忘",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/account-strategy/SKILL.md"
  },
  {
    "id": "b2b-sales-agent",
    "domain": "销售",
    "title": "客户询盘与资格判断",
    "summary": "问清客户需求，基于产品知识应答，并留下包含下一步的跟进记录。",
    "inputs": [
      "客户对话"
    ],
    "output": "客户记录和下一步",
    "gate": "tests for high-risk security Qs",
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/b2b-sales-agent/b2b-sales-agent/SKILL.md"
  },
  {
    "id": "b2b-sdr-agent",
    "domain": "销售",
    "title": "出口 SDR 流水",
    "summary": "持续触达线索并记住跟进状态。",
    "inputs": [
      "销售线索",
      "沟通渠道"
    ],
    "output": "连续触达方案",
    "gate": "anti-amnesia; sending is the job",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 8,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/b2b-sdr-agent/SKILL.md"
  },
  {
    "id": "cold-email",
    "domain": "销售",
    "title": "冷邮件序列",
    "summary": "按客户画像写多封跟进信。",
    "inputs": [
      "目标客户画像"
    ],
    "output": "跟进序列",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/cold-email/SKILL.md"
  },
  {
    "id": "commercial-policy",
    "domain": "销售",
    "title": "折扣与例外",
    "summary": "把折扣规则变成可执行的审批路径。",
    "inputs": [
      "政策要求"
    ],
    "output": "合规对照与检查结果",
    "gate": "policy is the gate",
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/commercial-policy/SKILL.md"
  },
  {
    "id": "commercial-skills",
    "domain": "销售",
    "title": "商务条件建议",
    "summary": "针对价格、条款和伙伴给出建议。",
    "inputs": [
      "交易背景"
    ],
    "output": "改进建议",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/commercial-skills/SKILL.md"
  },
  {
    "id": "competitor-alternatives",
    "domain": "销售",
    "title": "竞品对比页",
    "summary": "生成给买家看的替代方案说明。",
    "inputs": [
      "竞品资料"
    ],
    "output": "页面内容",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/competitor-alternatives/SKILL.md"
  },
  {
    "id": "cro-advisor",
    "domain": "销售",
    "title": "收入负责人顾问",
    "summary": "按 ARR 和流失给出管理动作。",
    "inputs": [
      "年度经常性收入",
      "客户流失数据"
    ],
    "output": "预测与行动建议",
    "gate": null,
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/cro-advisor/SKILL.md"
  },
  {
    "id": "cyber-compliance-mapper",
    "domain": "销售",
    "title": "网络合规对照",
    "summary": "对照公司可能适用的网络监管。",
    "inputs": [
      "姓名",
      "企业域名"
    ],
    "output": "适用法规清单",
    "gate": null,
    "kind": "tool",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/cyber-compliance-mapper/SKILL.md"
  },
  {
    "id": "deal-desk",
    "domain": "销售",
    "title": "成交审查台",
    "summary": "算毛利和折扣，绝不自动批准。",
    "inputs": [
      "交易资料"
    ],
    "output": "评分与依据",
    "gate": "NEVER auto-approves; named human",
    "kind": "tool",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/deal-desk/SKILL.md"
  },
  {
    "id": "discovery-playbook",
    "domain": "销售",
    "title": "拜访提纲",
    "summary": "根据调研生成销售拜访问题。",
    "inputs": [
      "客户文件"
    ],
    "output": "拜访提纲",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/discovery-playbook/SKILL.md"
  },
  {
    "id": "free-tool-strategy",
    "domain": "销售",
    "title": "免费工具获客",
    "summary": "评估用免费工具换线索是否划算。",
    "inputs": [
      "选题或产品想法"
    ],
    "output": "上线计划",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/free-tool-strategy/SKILL.md"
  },
  {
    "id": "gingiris-b2b-growth",
    "domain": "销售",
    "title": "B2B 增长剧本",
    "summary": "按阶段给出从获客到规模的动作。",
    "inputs": [
      "业务阶段"
    ],
    "output": "增长剧本",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/gingiris-b2b-growth/SKILL.md"
  },
  {
    "id": "marketing-demand-acquisition",
    "domain": "销售",
    "title": "付费与搜索获客",
    "summary": "规划投放和搜索获客。",
    "inputs": [
      "预算建议",
      "目标客户画像"
    ],
    "output": "获客计划",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/marketing-demand-acquisition/SKILL.md"
  },
  {
    "id": "pptx",
    "domain": "销售",
    "title": "演示文稿编辑",
    "summary": "创建或修改 PowerPoint。",
    "inputs": [
      "PowerPoint 文件",
      "结构化文档"
    ],
    "output": "演示文稿",
    "gate": null,
    "kind": "tool",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/pptx/SKILL.md"
  },
  {
    "id": "revenue-operations",
    "domain": "销售",
    "title": "收入运营报告",
    "summary": "整理管道、预测和转化效率。",
    "inputs": [
      "销售管道数据"
    ],
    "output": "分析报告",
    "gate": null,
    "kind": "tool",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/revenue-operations/SKILL.md"
  },
  {
    "id": "sales-engineer",
    "domain": "销售",
    "title": "售前方案覆盖",
    "summary": "对照招标找出缺口和验证计划。",
    "inputs": [
      "招标需求"
    ],
    "output": "方案差距与验证计划",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/sales-engineer/SKILL.md"
  },
  {
    "id": "sales-objections",
    "domain": "销售",
    "title": "现场异议话术",
    "summary": "把反对意见变成可说的应答。",
    "inputs": [
      "客户异议"
    ],
    "output": "脚本",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/sales-objections/SKILL.md"
  },
  {
    "id": "sales-outreach",
    "domain": "销售",
    "title": "个性化外呼",
    "summary": "按对象写外呼序列。",
    "inputs": [
      "潜在客户"
    ],
    "output": "跟进序列",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/sales-outreach/SKILL.md"
  },
  {
    "id": "sales-prep",
    "domain": "销售",
    "title": "会前简报",
    "summary": "开会前把客户要点收成一页。",
    "inputs": [
      "客户资料"
    ],
    "output": "客户简报",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/sales-prep/SKILL.md"
  },
  {
    "id": "sales-report-pdf",
    "domain": "销售",
    "title": "管道报告 PDF",
    "summary": "把销售管道导出成可读报告。",
    "inputs": [
      "报告资料"
    ],
    "output": "管道报告",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "销售.zip :: ΘöÇσö«/sales-report-pdf/SKILL.md"
  },
  {
    "id": "1688-finance-tax",
    "domain": "财税",
    "title": "含税定价测算",
    "summary": "把报价拆成税负和到手价。",
    "inputs": [
      "价格资料",
      "税务条件"
    ],
    "output": "税负",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/1688-finance-tax/SKILL.md"
  },
  {
    "id": "a-stock-data",
    "domain": "财税",
    "title": "A股行情研报",
    "summary": "抓取行情、资金面和研报。",
    "inputs": [
      "证券代码"
    ],
    "output": "查询数据",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/a-stock-data/SKILL.md"
  },
  {
    "id": "agentic-trading-desk",
    "domain": "财税",
    "title": "短线交易台",
    "summary": "下单前必须确认，不是自动成交。",
    "inputs": [
      "证券代码"
    ],
    "output": "交易指令草稿",
    "gate": "explicit confirm before place_order",
    "kind": "role",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/agentic-trading-desk/SKILL.md"
  },
  {
    "id": "ai-berkshire",
    "domain": "财税",
    "title": "价值投资研究组",
    "summary": "按长期持有框架做标的研究。",
    "inputs": [
      "研究标的范围"
    ],
    "output": "选品建议与报告",
    "gate": null,
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 21,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: ai-berkshire"
  },
  {
    "id": "bd-income-tax-skills",
    "domain": "财税",
    "title": "孟加拉报税",
    "summary": "整理当地所得税申报材料。",
    "inputs": [
      "单证草稿"
    ],
    "output": "申报材料",
    "gate": "professional disclaimer likely",
    "kind": "pack",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: bd-income-tax-skills"
  },
  {
    "id": "buffet-analyst",
    "domain": "财税",
    "title": "个股价值分析",
    "summary": "按长期投资框架估值。",
    "inputs": [
      "申报材料"
    ],
    "output": "估值分析",
    "gate": null,
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/buffet-analyst/SKILL.md"
  },
  {
    "id": "cfo-advisor",
    "domain": "财税",
    "title": "创业公司财务顾问",
    "summary": "做模型和现金流判断材料。",
    "inputs": [
      "财务数据"
    ],
    "output": "财务模型",
    "gate": null,
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/cfo-advisor/SKILL.md"
  },
  {
    "id": "claude-finance",
    "domain": "财税",
    "title": "个人财务套件",
    "summary": "覆盖记账、投资和报税辅助。",
    "inputs": [
      "账户资料"
    ],
    "output": "触达计划",
    "gate": null,
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 16,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: claude-finance"
  },
  {
    "id": "equity-research-skill",
    "domain": "财税",
    "title": "机构级个股研报",
    "summary": "写成可内审的个股研究报告。",
    "inputs": [
      "证券代码"
    ],
    "output": "研报",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/equity-research-skill/SKILL.md"
  },
  {
    "id": "file-itr-india",
    "domain": "财税",
    "title": "印度报税提交",
    "summary": "准备并提交印度所得税申报。",
    "inputs": [
      "文档资料"
    ],
    "output": "申报数据包",
    "gate": "evidence-tied; not a CA substitute",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 5,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/file-itr-india/SKILL.md"
  },
  {
    "id": "india-itr-copilot",
    "domain": "财税",
    "title": "印度报税副驾",
    "summary": "辅助整理印度申报材料。",
    "inputs": [
      "文档资料"
    ],
    "output": "申报数据包",
    "gate": "evidence-tied; not a CA substitute",
    "kind": "pack",
    "status": "walkthrough",
    "nestedCount": 5,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/india-itr-copilot/SKILL.md"
  },
  {
    "id": "open-itr",
    "domain": "财税",
    "title": "印度报税开源流程",
    "summary": "按开源流程准备申报文件。",
    "inputs": [
      "文档资料"
    ],
    "output": "申报数据包",
    "gate": "evidence-tied; not a CA substitute",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 5,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/open-itr/SKILL.md"
  },
  {
    "id": "itr-prep-skill",
    "domain": "财税",
    "title": "印度报税准备",
    "summary": "把资料收成申报数据包。",
    "inputs": [
      "文档资料"
    ],
    "output": "申报数据包",
    "gate": "evidence-tied; not a CA substitute",
    "kind": "pack",
    "status": "walkthrough",
    "nestedCount": 5,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/itr-prep-skill/SKILL.md"
  },
  {
    "id": "itr-ca-report",
    "domain": "财税",
    "title": "印度会计师报告",
    "summary": "生成给会计师审阅的申报说明。",
    "inputs": [
      "文档资料"
    ],
    "output": "申报数据包",
    "gate": "evidence-tied; not a CA substitute",
    "kind": "pack",
    "status": "walkthrough",
    "nestedCount": 5,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/itr-ca-report/SKILL.md"
  },
  {
    "id": "finance-assistant",
    "domain": "财税",
    "title": "个人收支助手",
    "summary": "整理预算、投资和税务问题。",
    "inputs": [
      "账户资料"
    ],
    "output": "分析建议",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/finance-assistant/SKILL.md"
  },
  {
    "id": "financial-analyst",
    "domain": "财税",
    "title": "财务报表分析",
    "summary": "做比率、估值和差异分析。",
    "inputs": [
      "财务报表"
    ],
    "output": "文案分析",
    "gate": null,
    "kind": "tool",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/financial-analyst/SKILL.md"
  },
  {
    "id": "investment-masters",
    "domain": "财税",
    "title": "投资框架摘录",
    "summary": "把名家方法收成可用框架。",
    "inputs": [
      "姓名"
    ],
    "output": "合规框架",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/investment-masters/SKILL.md"
  },
  {
    "id": "nl-tax-agent-skills",
    "domain": "财税",
    "title": "荷兰税务代理",
    "summary": "处理荷兰申报材料。",
    "inputs": [
      "荷兰税务文件"
    ],
    "output": "申报材料",
    "gate": "TERMS/PRIVACY",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 12,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: nl-tax-agent-skills"
  },
  {
    "id": "openclaw-accounting",
    "domain": "财税",
    "title": "记账插件",
    "summary": "把凭证记入账本。",
    "inputs": [
      "流水账"
    ],
    "output": "账目记录",
    "gate": null,
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: openclaw-accounting"
  },
  {
    "id": "personal-finance-skill",
    "domain": "财税",
    "title": "个人账户执行",
    "summary": "连接账户后的操作需批准。",
    "inputs": [
      "银行账户接入"
    ],
    "output": "投放动作建议",
    "gate": "approval-gated execution",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/personal-finance-skill/SKILL.md"
  },
  {
    "id": "research-finance",
    "domain": "财税",
    "title": "研发预算财务",
    "summary": "管理内部研发项目的预算。",
    "inputs": [
      "项目资料"
    ],
    "output": "预算建议",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/research-finance/SKILL.md"
  },
  {
    "id": "startup-bookkeeper",
    "domain": "财税",
    "title": "小企业记账",
    "summary": "记录收支、应收应付和费用分类，按需生成财务概览。",
    "inputs": [
      "票据凭证"
    ],
    "output": "账本分录",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/startup-bookkeeper/SKILL.md"
  },
  {
    "id": "tushare-finance-skill",
    "domain": "财税",
    "title": "Tushare 行情",
    "summary": "读取 A 股与基本面数据。",
    "inputs": [
      "荷兰税务问题"
    ],
    "output": "行情数据",
    "gate": "token",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/tushare-finance-skill/SKILL.md"
  },
  {
    "id": "waditu-tushare-skills",
    "domain": "财税",
    "title": "Tushare 数据接口",
    "summary": "用 Tushare 拉取市场数据。",
    "inputs": [
      "荷兰税务问题"
    ],
    "output": "行情数据",
    "gate": "token",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: waditu-tushare-skills"
  },
  {
    "id": "us-foreign-llc-tax-filing",
    "domain": "财税",
    "title": "美国外商 LLC 报税",
    "summary": "梳理外商单成员公司税务流程。",
    "inputs": [
      "已有事实"
    ],
    "output": "工作流程",
    "gate": "DISCLAIMER.md",
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/us-foreign-llc-tax-filing/SKILL.md"
  },
  {
    "id": "xlsx",
    "domain": "财税",
    "title": "表格读写",
    "summary": "把 Excel 当作输入和输出。",
    "inputs": [
      "Excel 文件"
    ],
    "output": "Excel 表格",
    "gate": null,
    "kind": "tool",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/xlsx/SKILL.md"
  },
  {
    "id": "zero-tax-filing-cn",
    "domain": "财税",
    "title": "小规模零申报",
    "summary": "在深圳电子税务局做季度零申报辅助。",
    "inputs": [
      "相应系统账户"
    ],
    "output": "申报结果",
    "gate": "browser automation of gov site",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "财税.zip :: Φ┤óτ¿Ä/zero-tax-filing-cn/SKILL.md"
  },
  {
    "id": "legal-skills-cn",
    "domain": "法律",
    "title": "中国律师路由",
    "summary": "按诉讼、劳动、合同等分到对应法律技能。",
    "inputs": [
      "已有事实"
    ],
    "output": "对应法律技能",
    "gate": "do not replace attorney review / client auth",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 58,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/legal-skills-cn/SKILL.md"
  },
  {
    "id": "awesome-legal-aiagent-skills",
    "domain": "法律",
    "title": "美国执业领域库",
    "summary": "覆盖反垄断、基金、知识产权等美国业务。",
    "inputs": [
      "事项类型"
    ],
    "output": "法律流程材料",
    "gate": "professional",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 1252,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: awesome-legal-aiagent-skills"
  },
  {
    "id": "greater-china-legal",
    "domain": "法律",
    "title": "大中华法律框架",
    "summary": "按场景给出大中华区法律框架。",
    "inputs": [
      "场景"
    ],
    "output": "法律框架",
    "gate": "professional",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 574,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: greater-china-legal"
  },
  {
    "id": "claude-for-legal-ZH",
    "domain": "法律",
    "title": "中文法律诊所",
    "summary": "覆盖商事、知识产权、劳动和隐私。",
    "inputs": [
      "法律事项"
    ],
    "output": "领域法律材料",
    "gate": "professional",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 150,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: claude-for-legal-ZH"
  },
  {
    "id": "excel1949-cn-legal-skills",
    "domain": "法律",
    "title": "中国部门法律包",
    "summary": "按中国法律部门组织技能。",
    "inputs": [
      "法律事项"
    ],
    "output": "对应能力",
    "gate": "professional",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 40,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: excel1949-cn-legal-skills"
  },
  {
    "id": "cat-xierluo-legal-skills",
    "domain": "法律",
    "title": "中国法律技能树",
    "summary": "另一套按领域组织的中国法律技能。",
    "inputs": [
      "法律事项"
    ],
    "output": "对应能力",
    "gate": "professional",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 56,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: cat-xierluo-legal-skills"
  },
  {
    "id": "Legal-Skills-Chinese",
    "domain": "法律",
    "title": "北大法宝法律技能",
    "summary": "结合法条检索处理中国法律问题。",
    "inputs": [
      "法律事项"
    ],
    "output": "对应能力",
    "gate": "professional",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 38,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: Legal-Skills-Chinese"
  },
  {
    "id": "internet-court-skill",
    "domain": "法律",
    "title": "智能体合同信任层",
    "summary": "处理智能体之间的约定与争议。",
    "inputs": [
      "智能体间的约定"
    ],
    "output": "争议处理流程",
    "gate": "designed for *no* human",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 92,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/internet-court-skill/SKILL.md"
  },
  {
    "id": "FachuanHybridSystem",
    "domain": "法律",
    "title": "法穿法律助手",
    "summary": "完整的法律案件辅助应用。",
    "inputs": [
      "案件资料"
    ],
    "output": "申报辅助界面",
    "gate": "private deploy",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: FachuanHybridSystem"
  },
  {
    "id": "transaction-legal-skills",
    "domain": "法律",
    "title": "交易法律审查",
    "summary": "审查交易文件中的法律风险。",
    "inputs": [
      "交易文件"
    ],
    "output": "文案分析",
    "gate": "professional",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 2,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: transaction-legal-skills"
  },
  {
    "id": "claude-skill-labor-lawyer",
    "domain": "法律",
    "title": "中国劳动法",
    "summary": "处理裁员、加班、工伤和仲裁问题。",
    "inputs": [
      "已有事实"
    ],
    "output": "条文+策略",
    "gate": "disclaimer implied",
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/claude-skill-labor-lawyer/SKILL.md"
  },
  {
    "id": "claude-legal-skill",
    "domain": "法律",
    "title": "合同红线审查",
    "summary": "标注合同风险，不能替代律师。",
    "inputs": [
      "管道报告",
      "Word 文件"
    ],
    "output": "风险说明与合同修订",
    "gate": "lawyer-ready, not lawyer",
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/claude-legal-skill/skill.md"
  },
  {
    "id": "legal-redline-tools",
    "domain": "法律",
    "title": "合同修订稿",
    "summary": "生成带修订痕迹的合同稿。",
    "inputs": [
      "合同文本"
    ],
    "output": "带修订痕迹的 Word 文件",
    "gate": "not GC substitute",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/legal-redline-tools/skill.md"
  },
  {
    "id": "law-ye-skill",
    "domain": "法律",
    "title": "法律顾问问答",
    "summary": "按多部法律回答实务问题。",
    "inputs": [
      "具体问题"
    ],
    "output": "顾问答",
    "gate": null,
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/law-ye-skill/SKILL.md"
  },
  {
    "id": "luoxiang-skill",
    "domain": "法律",
    "title": "刑法表达仿写",
    "summary": "用通俗刑法表达写说明文字。",
    "inputs": [
      "主题"
    ],
    "output": "罗翔风格文本",
    "gate": null,
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/luoxiang-skill/SKILL.md"
  },
  {
    "id": "china-lawyer-analyst",
    "domain": "法律",
    "title": "请求权分析",
    "summary": "按成文法和指导案例拆请求权。",
    "inputs": [
      "事件"
    ],
    "output": "风险/依据",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/china-lawyer-analyst/SKILL.md"
  },
  {
    "id": "commercial-legal-pl",
    "domain": "法律",
    "title": "波兰商事合同",
    "summary": "审查波兰语商务和知识产权合同。",
    "inputs": [
      "波兰语合同"
    ],
    "output": "合同审查意见",
    "gate": "PL law",
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/commercial-legal-pl/SKILL.md"
  },
  {
    "id": "compliance-cl",
    "domain": "法律",
    "title": "智利数据合规",
    "summary": "对照智利数据法整理合规材料。",
    "inputs": [
      "组织情况"
    ],
    "output": "配套材料",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/compliance-cl/SKILL.md"
  },
  {
    "id": "compliance-os",
    "domain": "法律",
    "title": "合规框架编排",
    "summary": "配置并计算多套合规框架。",
    "inputs": [
      "合规框架"
    ],
    "output": "执行方案",
    "gate": null,
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/compliance-os/SKILL.md"
  },
  {
    "id": "compliance-readiness",
    "domain": "法律",
    "title": "合规就绪追问",
    "summary": "用六个问题检查合规准备。",
    "inputs": [
      "项目资料"
    ],
    "output": "核查问题清单",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/compliance-readiness/SKILL.md"
  },
  {
    "id": "ciso-advisor",
    "domain": "法律",
    "title": "安全负责人顾问",
    "summary": "把安全风险变成管理路线图。",
    "inputs": [
      "运行环境"
    ],
    "output": "安全路线图",
    "gate": null,
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/ciso-advisor/SKILL.md"
  },
  {
    "id": "gc-review",
    "domain": "法律",
    "title": "总法顾问追问",
    "summary": "从总法律顾问角度审合同和条款。",
    "inputs": [
      "触达计划",
      "单证草稿"
    ],
    "output": "总法追问清单",
    "gate": "counsel judgment",
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/gc-review/SKILL.md"
  },
  {
    "id": "gdpr-audit-prep",
    "domain": "法律",
    "title": "GDPR 审计准备",
    "summary": "按条款准备审计问答。",
    "inputs": [
      "适用范围"
    ],
    "output": "审计准备材料",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/gdpr-audit-prep/SKILL.md"
  },
  {
    "id": "gdpr-dsgvo-expert",
    "domain": "法律",
    "title": "代码隐私扫描",
    "summary": "扫描代码生成隐私影响材料。",
    "inputs": [
      "代码仓库"
    ],
    "output": "单证草稿",
    "gate": null,
    "kind": "tool",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/gdpr-dsgvo-expert/SKILL.md"
  },
  {
    "id": "general-counsel-advisor",
    "domain": "法律",
    "title": "创业公司总法",
    "summary": "审 MSA、NDA 和知识产权条款。",
    "inputs": [
      "合同文本"
    ],
    "output": "审查意见",
    "gate": "not a bar license",
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/general-counsel-advisor/SKILL.md"
  },
  {
    "id": "contract-and-proposal-writer",
    "domain": "法律",
    "title": "合同与方案起草",
    "summary": "起草雇佣或项目合同草稿。",
    "inputs": [
      "客户简报"
    ],
    "output": "合同草稿",
    "gate": "jurisdiction-aware",
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/contract-and-proposal-writer/SKILL.md"
  },
  {
    "id": "doc-coauthoring",
    "domain": "法律",
    "title": "文书共创",
    "summary": "按结构一起改一份正式文件。",
    "inputs": [
      "初稿"
    ],
    "output": "共创文档",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/doc-coauthoring/SKILL.md"
  },
  {
    "id": "docx",
    "domain": "法律",
    "title": "Word 文档处理",
    "summary": "读写 Word 文件。",
    "inputs": [
      "文件"
    ],
    "output": "可编辑的 Word 文档",
    "gate": null,
    "kind": "tool",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/docx/SKILL.md"
  },
  {
    "id": "pdf",
    "domain": "法律",
    "title": "PDF 处理",
    "summary": "读写 PDF 文件。",
    "inputs": [
      "文件"
    ],
    "output": "处理后的 PDF 或提取内容",
    "gate": null,
    "kind": "tool",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/pdf/SKILL.md"
  },
  {
    "id": "private-equity-investment-dd-skill",
    "domain": "法律",
    "title": "投委会尽调包",
    "summary": "把尽调材料收成投委会备忘。",
    "inputs": [
      "商业计划书",
      "投资信息备忘录",
      "尽调资料"
    ],
    "output": "投委会备忘",
    "gate": "evidence-driven",
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/private-equity-investment-dd-skill/SKILL.md"
  },
  {
    "id": "regulatory-affairs-head",
    "domain": "法律",
    "title": "器械法规申报",
    "summary": "准备医疗器械法规申报材料。",
    "inputs": [
      "医疗器械资料"
    ],
    "output": "申报资料包",
    "gate": "agency approval is the gate",
    "kind": "role",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/regulatory-affairs-head/SKILL.md"
  },
  {
    "id": "guardian-cli",
    "domain": "法律",
    "title": "渗透测试命令行",
    "summary": "自动化安全测试，误用风险高。",
    "inputs": [
      "目标说明"
    ],
    "output": "安全测试记录",
    "gate": "dangerous if misused",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "法律.zip :: µ│òσ╛ï/guardian-cli/SKILL.md"
  },
  {
    "id": "short-video-script-skill",
    "domain": "视频",
    "title": "短视频口播脚本",
    "summary": "把长内容收成钩子、口播和分镜。",
    "inputs": [
      "文章",
      "主题"
    ],
    "output": "口播、分镜与发布文案",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/short-video-script-skill/SKILL.md"
  },
  {
    "id": "short-video-script",
    "domain": "视频",
    "title": "口播与分镜",
    "summary": "从主题生成口播和动画分镜。",
    "inputs": [
      "主题"
    ],
    "output": "脚本与动画分镜",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/short-video-script/SKILL.md"
  },
  {
    "id": "script",
    "domain": "视频",
    "title": "爆款钩子脚本",
    "summary": "按常用公式写短视频开头。",
    "inputs": [
      "配音素材",
      "主题"
    ],
    "output": "脚本",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/script/SKILL.md"
  },
  {
    "id": "video-content-strategist",
    "domain": "视频",
    "title": "视频内容日历",
    "summary": "规划频道选题和脚本节奏。",
    "inputs": [
      "发布渠道"
    ],
    "output": "触达计划",
    "gate": null,
    "kind": "atomic",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/video-content-strategist/SKILL.md"
  },
  {
    "id": "video-copy-analyzer",
    "domain": "视频",
    "title": "视频文案拆解",
    "summary": "下载、转写并分析竞品文案。",
    "inputs": [
      "B站",
      "YouTube 内容",
      "抖音 URL"
    ],
    "output": "文案分析",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/video-copy-analyzer/SKILL.md"
  },
  {
    "id": "content-production",
    "domain": "视频",
    "title": "可发布内容稿",
    "summary": "从题目写成可发布的稿件。",
    "inputs": [
      "主题"
    ],
    "output": "可发布稿件",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/content-production/SKILL.md"
  },
  {
    "id": "social-content",
    "domain": "视频",
    "title": "社媒日历",
    "summary": "规划 LinkedIn 和 Twitter 更新。",
    "inputs": [
      "品牌名"
    ],
    "output": "社交内容",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/social-content/SKILL.md"
  },
  {
    "id": "clipify",
    "domain": "视频",
    "title": "趣味片段剪辑",
    "summary": "从长视频抽出竖屏片段。",
    "inputs": [
      "视频素材"
    ],
    "output": "竖屏片段",
    "gate": null,
    "kind": "tool",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/clipify/SKILL.md"
  },
  {
    "id": "shorts",
    "domain": "视频",
    "title": "长视频切短",
    "summary": "把长内容切成短视频。",
    "inputs": [
      "长视频素材"
    ],
    "output": "短视频",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/shorts/SKILL.md"
  },
  {
    "id": "youtube-clipper",
    "domain": "视频",
    "title": "YouTube 切片",
    "summary": "下载、分章并烧录字幕。",
    "inputs": [
      "YouTube 链接",
      "研究标的"
    ],
    "output": "视频片段",
    "gate": "user picks segments",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/youtube-clipper/SKILL.md"
  },
  {
    "id": "youtube-full",
    "domain": "视频",
    "title": "YouTube 文稿",
    "summary": "抽取字幕、列表和检索。",
    "inputs": [
      "YouTube 内容"
    ],
    "output": "提取的文字",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/youtube-full/SKILL.md"
  },
  {
    "id": "jianying-editor",
    "domain": "视频",
    "title": "剪映工程",
    "summary": "自动生成剪映工程。",
    "inputs": [
      "素材"
    ],
    "output": "剪映工程",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/jianying-editor/SKILL.md"
  },
  {
    "id": "qiaomu-cut",
    "domain": "视频",
    "title": "一句话出视频工程",
    "summary": "从一句话生成可验收的剪辑方案。",
    "inputs": [
      "提示与要求"
    ],
    "output": "剪辑方案与工程",
    "gate": "可验收",
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 14,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/qiaomu-cut/SKILL.md"
  },
  {
    "id": "narrator-ai-cli",
    "domain": "视频",
    "title": "影视解说二创",
    "summary": "生成解说和配音，注意版权。",
    "inputs": [
      "影视素材"
    ],
    "output": "解说视频",
    "gate": "IP-sensitive",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/narrator-ai-cli/SKILL.md"
  },
  {
    "id": "seedance",
    "domain": "视频",
    "title": "即梦视频提示词",
    "summary": "把故事编译成视频生成提示。",
    "inputs": [
      "故事资料"
    ],
    "output": "视频生成提示词",
    "gate": null,
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 28,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/seedance/SKILL.md"
  },
  {
    "id": "seedance-20",
    "domain": "视频",
    "title": "即梦 2.0 提示词",
    "summary": "按 Seedance 2.0 编译视频提示。",
    "inputs": [
      "故事资料"
    ],
    "output": "视频生成提示词",
    "gate": null,
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 28,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/seedance-20/SKILL.md"
  },
  {
    "id": "vox-director",
    "domain": "视频",
    "title": "解说动画短片",
    "summary": "做成纸片拼贴风格的解说视频。",
    "inputs": [
      "主题"
    ],
    "output": "视频内容",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/vox-director/SKILL.md"
  },
  {
    "id": "whiteboard-video",
    "domain": "视频",
    "title": "手绘白板视频",
    "summary": "把脚本画成白板讲解。",
    "inputs": [
      "脚本"
    ],
    "output": "视频内容",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/whiteboard-video/SKILL.md"
  },
  {
    "id": "demo-video",
    "domain": "视频",
    "title": "产品演示片",
    "summary": "生成功能演示解说。",
    "inputs": [
      "产品资料"
    ],
    "output": "产品演示片",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "视频.zip :: ΦºåΘóæ/demo-video/SKILL.md"
  },
  {
    "id": "image-router",
    "domain": "图文",
    "title": "多模型出图",
    "summary": "按提示调用多种生图模型。",
    "inputs": [
      "提示与要求",
      "服务接口凭证"
    ],
    "output": "图片",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/image-router/SKILL.md"
  },
  {
    "id": "comfyui-agent-skill",
    "domain": "图文",
    "title": "ComfyUI 出图",
    "summary": "用工作流生成图、视频或音频。",
    "inputs": [
      "工作流"
    ],
    "output": "图像、视频或音频",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/comfyui-agent-skill/SKILL.md"
  },
  {
    "id": "ComfyUI_Skills_OpenClaw",
    "domain": "图文",
    "title": "ComfyUI 代理调用",
    "summary": "让智能体通过命令行走工作流。",
    "inputs": [
      "工作流配置"
    ],
    "output": "媒体素材",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/ComfyUI_Skills_OpenClaw/SKILL.md"
  },
  {
    "id": "gpt-image2-ecommerce",
    "domain": "图文",
    "title": "电商主图",
    "summary": "生成商品主图。",
    "inputs": [
      "产品资料"
    ],
    "output": "商品视觉素材",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/gpt-image2-ecommerce/SKILL.md"
  },
  {
    "id": "dreamina-cli-skill",
    "domain": "图文",
    "title": "即梦出图",
    "summary": "用即梦命令行生成图片。",
    "inputs": [
      "提示与要求"
    ],
    "output": "即梦图",
    "gate": "login/session",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/dreamina-cli-skill/SKILL.md"
  },
  {
    "id": "jimeng-cli-free",
    "domain": "图文",
    "title": "即梦浏览器出图",
    "summary": "通过浏览器驱动即梦出图。",
    "inputs": [
      "提示与要求"
    ],
    "output": "即梦图",
    "gate": "login/session",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/jimeng-cli-free/SKILL.md"
  },
  {
    "id": "logo-generator-skill",
    "domain": "图文",
    "title": "标志生成",
    "summary": "生成 SVG 标志和展示页。",
    "inputs": [
      "客户简报"
    ],
    "output": "标志文件",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/logo-generator-skill/SKILL.md"
  },
  {
    "id": "Document-illustrator-skill",
    "domain": "图文",
    "title": "文章配图",
    "summary": "按文档结构配插画。",
    "inputs": [
      "Markdown 文档",
      "文章"
    ],
    "output": "文章配图",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/Document-illustrator-skill/SKILL.md"
  },
  {
    "id": "ai-visual-director",
    "domain": "图文",
    "title": "视觉导演",
    "summary": "从故事到角色卡、分镜和海报。",
    "inputs": [
      "故事资料"
    ],
    "output": "角色卡和分镜",
    "gate": null,
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 8,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/ai-visual-director/SKILL.md"
  },
  {
    "id": "gimi-illustration-skill",
    "domain": "图文",
    "title": "中文插画",
    "summary": "给中文文章配多风格插画。",
    "inputs": [
      "文章",
      "知识产权资料"
    ],
    "output": "配图",
    "gate": "Step0 confirm before freeform",
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/gimi-illustration-skill/SKILL.md"
  },
  {
    "id": "guizang-social-card-skill",
    "domain": "图文",
    "title": "社交卡片",
    "summary": "做成归藏风格的社交卡片。",
    "inputs": [
      "产品描述"
    ],
    "output": "社交卡片",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/guizang-social-card-skill/SKILL.md"
  },
  {
    "id": "xhs-imagen",
    "domain": "图文",
    "title": "小红书图文",
    "summary": "从选题生成完整图文。",
    "inputs": [
      "主题",
      "文档"
    ],
    "output": "内容稿",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/xhs-imagen/SKILL.md"
  },
  {
    "id": "xhs-cover-skill",
    "domain": "图文",
    "title": "小红书封面",
    "summary": "按标题生成封面。",
    "inputs": [
      "标题"
    ],
    "output": "封面",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/xhs-cover-skill/SKILL.md"
  },
  {
    "id": "ppt-image-first",
    "domain": "图文",
    "title": "先图后页 PPT",
    "summary": "先规划配图再生成演示页。",
    "inputs": [
      "客户简报"
    ],
    "output": "演示页配图方案",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/ppt-image-first/SKILL.md"
  },
  {
    "id": "chatgpt-imagegen",
    "domain": "图文",
    "title": "本地对话出图",
    "summary": "通过对话接口生成图片。",
    "inputs": [
      "提示与要求"
    ],
    "output": "图片或动图",
    "gate": "ChatGPT login",
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/chatgpt-imagegen/SKILL.md"
  },
  {
    "id": "draw-ui",
    "domain": "图文",
    "title": "界面草图转代码",
    "summary": "把草图变成 HTML 或小程序界面。",
    "inputs": [
      "提示与要求",
      "参考截图"
    ],
    "output": "界面代码",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/draw-ui/SKILL.md"
  },
  {
    "id": "taste-skill",
    "domain": "图文",
    "title": "非套模板界面",
    "summary": "按设计系统生成不落俗套的界面。",
    "inputs": [
      "客户简报"
    ],
    "output": "界面设计",
    "gate": null,
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 13,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/taste-skill/skills/taste-skill/SKILL.md"
  },
  {
    "id": "nano-image-generator-skill",
    "domain": "图文",
    "title": "Nano 出图",
    "summary": "用 Gemini 图像模型出图。",
    "inputs": [
      "提示与要求"
    ],
    "output": "图片",
    "gate": null,
    "kind": "tool",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/nano-image-generator-skill/SKILL.md"
  },
  {
    "id": "poster-design-skill",
    "domain": "图文",
    "title": "教育职业海报",
    "summary": "生成成套海报。",
    "inputs": [
      "客户简报"
    ],
    "output": "海报设计",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/poster-design-skill/SKILL.md"
  },
  {
    "id": "lingzao-skill",
    "domain": "图文",
    "title": "公域创作者研究",
    "summary": "研究小红书、抖音和公众号上的表达。",
    "inputs": [
      "创作者研究需求"
    ],
    "output": "调研信息",
    "gate": null,
    "kind": "pack",
    "status": "third_party",
    "nestedCount": 11,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/lingzao-skill/SKILL.md"
  },
  {
    "id": "oil-icon",
    "domain": "图文",
    "title": "统一图标组",
    "summary": "生成风格一致的透明图标。",
    "inputs": [
      "风格要求",
      "清单"
    ],
    "output": "图标组",
    "gate": null,
    "kind": "atomic",
    "status": "third_party",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "图文.zip :: σ¢╛µûç/oil-icon/SKILL.md"
  },
  {
    "id": "geo-effect-validator",
    "domain": "交付",
    "title": "品牌生成式曝光校验",
    "summary": "看各 AI 引擎是否提到你的品牌，需人工粘贴结果。",
    "inputs": [
      "品牌名",
      "卖点",
      "竞品名"
    ],
    "output": "各引擎提及对照表",
    "gate": "user-paste: human must run prompts on 文心/豆包/通义/元宝/DeepSeek/ChatGPT/Claude/Gemini and download HTML",
    "kind": "tool",
    "status": "walkthrough",
    "nestedCount": 0,
    "videoUrl": null,
    "posterUrl": null,
    "sourceRef": "skill-inventory.md :: geo-effect-validator"
  }
] satisfies SkillRecord[];
