import type { Metadata } from "next";
import Home from "@/components/home/Home";

export const metadata: Metadata = {
  title: "AutoMage",
  description: "把工作交给 AutoMage，规矩由你们定。它拼齐事实、跟进到底；哪些事能自己办、哪些必须回来找人，按企业定的规矩。",
};

export default function Page() {
  return <Home />;
}
