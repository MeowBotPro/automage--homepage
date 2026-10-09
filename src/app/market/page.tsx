import type { Metadata } from "next";
import MarketCatalog from "@/components/market/MarketCatalog";
import { normalizeCatalogQuery } from "@/lib/market-navigation";

export const metadata: Metadata = {
  title: "AI 自动化能力库 · AutoMage",
  description: "从你要完成的工作开始：看每项能力交付什么、需要你提供什么、到哪一步回来找你，以及同类能力怎么选。",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <MarketCatalog params={normalizeCatalogQuery(params)} />;
}
