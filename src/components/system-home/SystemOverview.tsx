import { ArrowRight } from "lucide-react";
import styles from "./SystemHome.module.css";

const inputs = ["消息", "业务资料", "异常信号"];
const outputs = ["可判断的方案", "明确的责任", "结果与反馈"];

export default function SystemOverview() {
  return <div className={styles.systemOverview} aria-label="AutoMage 系统模型示意">
    <div className={styles.overviewBar}><span>AUTOMAGE / SYSTEM MODEL</span><span className={styles.overviewStatus}>PRODUCT OVERVIEW</span></div>
    <div className={styles.overviewBody}>
      <div className={styles.overviewColumn}><small>进入组织的信号</small>{inputs.map((item) => <div className={styles.overviewNode} key={item}>{item}</div>)}</div>
      <div className={styles.overviewCenter}><span className={styles.overviewLabel}>共同上下文</span><div className={styles.coreNode}><strong>AutoMage</strong><span>协作与执行层</span><i>Context · Decision</i></div><div className={styles.overviewFlow}><span>整理</span><ArrowRight size={14} /><span>判断</span><ArrowRight size={14} /><span>推进</span></div></div>
      <div className={styles.overviewColumn}><small>工作继续向前</small>{outputs.map((item) => <div className={styles.overviewNode} key={item}>{item}</div>)}</div>
    </div>
    <div className={styles.overviewFooter}><span>人在需要负责的地方出现</span><span className={styles.overviewLine} /><span>反馈回到下一次判断</span></div>
    <p className={styles.overviewNote}>系统模型 · 解释 AutoMage 的工作方式，不代表某个客户已接入的配置</p>
  </div>;
}
