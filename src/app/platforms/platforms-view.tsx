import Link from "next/link";
import {
  getCandidatesStatus,
  getElectionDistricts,
  getElectionPlatforms,
  getElectionResults,
} from "@/lib/api";
import type { Election } from "@/lib/types";
import { cleanDistrict, formatElectionLabelShort } from "@/lib/format";
import { CandidatePlatformCard } from "@/components/candidate-platform-card";

export async function PlatformsView({
  elections,
  electionId,
  districtParam,
}: {
  elections: Election[];
  electionId: number | undefined;
  districtParam: string | undefined;
}) {
  if (!electionId) {
    return <p className="text-ink-soft">目前尚無政見資料。</p>;
  }

  const [districts, candidates, allPlatforms, results] = await Promise.all([
    getElectionDistricts(electionId),
    getCandidatesStatus(electionId, districtParam),
    getElectionPlatforms(electionId),
    getElectionResults(electionId, districtParam).catch(() => []),
  ]);

  // 計算「該選區總得票」用於百分比
  const districtTotalVotes = new Map<string, number>();
  for (const r of results) {
    const key = r.district || "";
    districtTotalVotes.set(key, (districtTotalVotes.get(key) || 0) + r.votes);
  }

  const total = candidates.length;
  const withText = candidates.filter((c) => c.platform_count > 0).length;
  const withImageOnly = candidates.filter(
    (c) => c.platform_count === 0 && c.image_count > 0,
  ).length;
  const withoutAny = total - withText - withImageOnly;

  return (
    <div className="space-y-12">
      {/* ── 切換器 ── */}
      <div className="grid sm:grid-cols-2 gap-6 pb-8 border-b border-rule">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
            選舉
          </p>
          <div className="flex flex-wrap gap-2">
            {elections.map((e) => (
              <Link
                key={e.election_id}
                href={`/platforms?election=${e.election_id}`}
                scroll={false}
                className={
                  "px-3 py-1.5 text-sm border transition " +
                  (e.election_id === electionId
                    ? "bg-ink text-paper border-ink"
                    : "border-rule text-ink-soft hover:border-ink hover:text-ink")
                }
              >
                {formatElectionLabelShort(e.date, e.name)}
                {e.description && (
                  <span className="ml-1 text-xs opacity-75">({e.description})</span>
                )}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
            選區
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/platforms?election=${electionId}`}
              scroll={false}
              className={
                "px-3 py-1.5 text-sm border transition " +
                (!districtParam
                  ? "bg-ink text-paper border-ink"
                  : "border-rule text-ink-soft hover:border-ink hover:text-ink")
              }
            >
              全部
            </Link>
            {districts.map((d) => {
              const label = cleanDistrict(d.district) || d.district;
              return (
                <Link
                  key={d.district}
                  href={`/platforms?election=${electionId}&district=${encodeURIComponent(d.district)}`}
                  scroll={false}
                  className={
                    "px-3 py-1.5 text-sm border transition " +
                    (districtParam === d.district
                      ? "bg-ink text-paper border-ink"
                      : "border-rule text-ink-soft hover:border-ink hover:text-ink")
                  }
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 統計 ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-rule border border-rule">
        <Stat label="候選人" value={total} />
        <Stat label="文字政見" value={withText} accent="text-ink" />
        <Stat label="圖片政見" value={withImageOnly} accent="text-ink" />
        <Stat label="完全未繳" value={withoutAny} accent="text-accent-red" />
      </div>

      {/* ── 潤稿說明 ── */}
      {(() => {
        const polished = allPlatforms.filter((p) => p.note && p.note.includes("人工潤稿")).length;
        const cleaned = allPlatforms.filter((p) => p.note && p.note.includes("OCR")).length;
        if (polished === 0 && cleaned === 0) return null;
        return (
          <div className="border-l-4 border-accent-red/60 bg-rule/20 px-4 py-3 text-sm leading-relaxed">
            <p className="text-ink-soft">
              本場 <strong className="text-ink">{polished}</strong> 條政見已經人工潤稿、
              <strong className="text-ink">{cleaned}</strong> 條程式自動清理過。
              卡片下方 chip 會顯示「人工潤稿」/「OCR 清理」/「自動拆條」等標記。
              點「顯示原始 OCR」可以對照公報原文。
            </p>
          </div>
        );
      })()}

      {/* ── 提示：候選人多 + 未選選區 ── */}
      {!districtParam && candidates.length > 30 && (
        <div className="border border-rule p-6 bg-rule/30 text-center">
          <p className="font-serif text-lg mb-2">
            本場選舉有 {candidates.length} 位候選人
          </p>
          <p className="text-sm text-ink-soft">
            請先從上方「選區」選一個區，避免頁面過大
          </p>
        </div>
      )}

      {/* ── 候選人清單 ── */}
      <div className="space-y-8">
        {(!districtParam && candidates.length > 30
          ? []
          : candidates
        ).map((c) => {
          const cPlatforms = allPlatforms.filter(
            (p) => p.candidate_id === c.candidate_id,
          );
          const districtTotal = c.district
            ? districtTotalVotes.get(c.district)
            : undefined;
          return (
            <CandidatePlatformCard
              key={c.candidate_id}
              status={c}
              platforms={cPlatforms}
              electionId={electionId}
              districtLabel={cleanDistrict(c.district) || c.district || ""}
              districtTotalVotes={districtTotal}
            />
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "text-ink",
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="bg-paper p-5">
      <p className="text-xs tracking-widest uppercase text-ink-soft mb-2">
        {label}
      </p>
      <p className={`font-serif text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
