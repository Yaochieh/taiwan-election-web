import { Suspense } from "react";
import { getElectionsWithPlatforms } from "@/lib/api";
import { PlatformsView } from "./platforms-view";

export const metadata = {
  title: "候選人政見 · 正至",
  description:
    "候選人政見資料庫，資料來源為中選會選舉公報。標註是否提交、附原始 PDF 連結。",
};

export default async function PlatformsPage({
  searchParams,
}: {
  searchParams: Promise<{ election?: string; district?: string; type?: string }>;
}) {
  const params = await searchParams;
  const allElections = await getElectionsWithPlatforms().catch(() => []);
  const typeFilter = params.type || "all";
  const elections =
    typeFilter === "all"
      ? allElections
      : allElections.filter((e) => e.type === typeFilter);
  const electionId = params.election
    ? Number(params.election)
    : elections[0]?.election_id;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          POLITICAL PLATFORMS
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight mb-4">
          候選人政見
        </h1>
        <p className="text-ink-soft max-w-3xl leading-relaxed">
          資料來源為
          <a
            href="https://bulletin.cec.gov.tw"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-accent-red"
          >
            中央選舉委員會選舉公報
          </a>
          。每位候選人都附有原始 PDF 連結。
          若候選人未在公報刊登政見，將特別標註，民眾可至公報原檔自行查證。
        </p>
      </header>

      {/* 類型切換 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: "all", label: "全部" },
          { value: "presidential", label: "總統" },
          { value: "legislative", label: "立法委員" },
          { value: "mayoral", label: "縣市長" },
        ].map((t) => {
          const active = t.value === typeFilter;
          return (
            <a
              key={t.value}
              href={t.value === "all" ? "/platforms" : `/platforms?type=${t.value}`}
              className={
                "px-4 py-1.5 text-sm border transition " +
                (active
                  ? "bg-ink text-paper border-ink"
                  : "border-rule text-ink-soft hover:border-ink hover:text-ink")
              }
            >
              {t.label}
            </a>
          );
        })}
      </div>

      <Suspense fallback={<div className="text-ink-soft">載入中…</div>}>
        <PlatformsView
          elections={elections}
          electionId={electionId}
          districtParam={params.district}
        />
      </Suspense>
    </div>
  );
}
