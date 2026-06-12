import Link from "next/link";
import {
  getCandidatesStatus,
  getElectionDistricts,
  getElectionPlatforms,
} from "@/lib/api";
import type { Election } from "@/lib/types";
import { cleanDistrict, formatVotes } from "@/lib/format";
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

  const [districts, candidates, allPlatforms] = await Promise.all([
    getElectionDistricts(electionId),
    getCandidatesStatus(electionId, districtParam),
    getElectionPlatforms(electionId),
  ]);

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
                {e.date.slice(0, 4)} {e.name}
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

      {/* ── 候選人清單 ── */}
      <div className="space-y-8">
        {candidates.map((c) => {
          const cPlatforms = allPlatforms.filter(
            (p) => p.candidate_id === c.candidate_id,
          );
          return (
            <CandidatePlatformCard
              key={c.candidate_id}
              status={c}
              platforms={cPlatforms}
              electionId={electionId}
              districtLabel={cleanDistrict(c.district) || c.district || ""}
              votesLabel={formatVotes(c.votes)}
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
