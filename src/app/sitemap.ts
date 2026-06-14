import type { MetadataRoute } from "next";
import { getElections } from "@/lib/api";

const BASE = "https://taiwan-election-web.vercel.app";

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
    "/parties",
    "/people",
    "/people/search",
    "/people/compare",
    "/platforms",
    "/search",
    "/timeline",
    "/trends",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const elections = await getElections().catch(() => []);
  const electionPages = elections.map((e) => ({
    url: `${BASE}/elections/${e.election_id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...electionPages];
}
