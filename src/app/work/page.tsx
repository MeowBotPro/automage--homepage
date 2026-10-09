import type { Metadata } from "next";
import Home from "@/components/home/Home";

export const metadata: Metadata = {
  title: "AI for Work · 新公司运行模式 · AutoMage",
  description: "同一家公司的一周，过两遍：没有 AutoMage 时，进展靠人一层层问；有了它，进展记在工作上，要人定的事带着依据找到该定的人。",
};

export default function Page() {
  return <Home />;
}
