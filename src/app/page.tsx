import type { Metadata } from "next";
import Entry from "@/components/entry/Entry";

export const metadata: Metadata = {
  title: "AutoMage · 重塑组织管理的信息逻辑",
  description: "当 AI 接管信息处理，人回归判断本身。AutoMage 把散在群聊、日报和业务系统里的信息，汇成一件件看得清、带着出处的事，接着往下跟；碰到你们定的线，带着依据来找该定的人。",
};

export default function Page() {
  return <Entry />;
}
