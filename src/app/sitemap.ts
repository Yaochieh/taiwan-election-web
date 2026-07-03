import type { MetadataRoute } from "next";
import {
  getElections,
  getParties,
  getTopics,
  getLegislatureComposition,
} from "@/lib/api";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages = [
    "",
    "/about",
    "/changelog",
    "/data",
    "/data/turnout",
    "/data/downloads",
    "/elections",
    "/government",
    "/government/cabinet",
    "/government/legislature",
    "/government/mayors",
    "/issues",
    "/parties",
    "/people",
    "/people/search",
    "/people/compare",
    "/platforms",
    "/search",
    "/timeline",
    "/topics",
    "/trends",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const [elections, parties, topics, legislature] = await Promise.all([
    getElections().catch(() => []),
    getParties().catch(() => []),
    getTopics().catch(() => []),
    getLegislatureComposition("2024").catch(() => null),
  ]);

  const electionPages = elections.map((e) => ({
    url: `${SITE_URL}/elections/${e.election_id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // 只收有席次/得票紀錄的主要政黨頁（全部 410 黨會稀釋 crawl budget）
  const partyPages = parties
    .filter((p) => p.color_hex)
    .map((p) => ({
      url: `${SITE_URL}/parties/${encodeURIComponent(p.name)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const topicPages = topics.map((t) => ({
    url: `${SITE_URL}/topics/${encodeURIComponent(t.name)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // 現任 113 位立委的個人頁（人物頁最有 SEO 價值的子集）
  const memberNames = new Set(
    (legislature?.members ?? []).map((m) => m.candidate)
  );
  const peoplePages = [...memberNames].map((name) => ({
    url: `${SITE_URL}/people/${encodeURIComponent(name)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...electionPages,
    ...partyPages,
    ...topicPages,
    ...peoplePages,
  ];
}
