import type { Metadata } from "next";
import MarketCatalog from "@/components/market/MarketCatalog";
import { normalizeCatalogQuery } from "@/lib/market-navigation";

export const metadata: Metadata = {
  title: "AutoMage 能力库 · 当前公开能力",
  description: "从你想完成的工作开始，查看 Skill 的实际产出、适用条件与同类比较。",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <MarketCatalog params={normalizeCatalogQuery(params)} />;
}
