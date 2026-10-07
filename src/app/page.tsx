import type { Metadata } from "next";
import SystemHome from "@/components/system-home/SystemHome";

export const metadata: Metadata = {
  title: "AutoMage",
  description: "组织信息流协作与执行基座。让分散信息变成有人负责、能够推进、可以追踪结果的工作。",
};

export default function Page() {
  return <SystemHome />;
}
