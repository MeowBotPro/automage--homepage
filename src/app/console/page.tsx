import type { Metadata } from "next";
import ConsolePrototype from "@/components/prototype/ConsolePrototype";

export const metadata: Metadata = {
  title: "Console · AutoMage Prototype",
  description: "AutoMage 企业控制台概念原型",
};

export default function ConsolePage() {
  return <ConsolePrototype />;
}
