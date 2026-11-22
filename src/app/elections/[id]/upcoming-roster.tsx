import Link from "next/link";
import type { Candidate } from "@/lib/types";
import { candidatePhotoUrl, type DistrictInfo } from "@/lib/api";
import { partyColor, COUNTY_ORDER } from "@/lib/format";

/** 尚未投票的選舉：依選舉公報列出候選人（號次、照片、政黨）。
 *  縣市 → 選舉區兩層皆可收合；選舉區標題列出範圍與應選名額（中選會選舉公告）。 */

const REG_MARK = "[登記中未經審定]";

function countyOf(district: string): string {
  const m = district.match(/^(.{2}[市縣])/);
  return m ? m[1] : district;
}

function districtNum(district: string): number {
  const m = district.match(/第(\d+)選舉區/);
  return m ? Number(m[1]) : 0;
}

function CandidateCard({ c, showCounty = false }: { c: Candidate; showCounty?: boolean }) {
  const photo = candidatePhotoUrl(c.photo_path);
  const color = partyColor(c.party_name || "無黨籍", c.color_hex);
  const pending = c.background === REG_MARK;
  return (
    <li className="border border-rule bg-paper transition hover:-translate-y-0.5 hover:shadow-sm">
      <Link href={`/people/${encodeURIComponent(c.name)}`} className="block">
        <div className="relative aspect-[4/5] bg-ink/5 overflow-hidden">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={`${c.name} 公報照片`} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-serif text-4xl text-ink-soft">
              {c.name.slice(0, 1)}
            </div>
          )}
          {c.ballot_no != null && (
            <span
              className="absolute top-0 left-0 min-w-8 px-2 py-0.5 text-center text-paper text-base font-bold tabular-nums"
              style={{ backgroundColor: color }}
              title="號次"
            >
              {c.ballot_no}
            </span>
          )}
        </div>
        <div className="p-2 border-t-4" style={{ borderTopColor: color }}>
          <p className="font-bold leading-tight truncate" title={c.name}>{c.name}</p>
          <p className="text-xs text-ink-soft truncate">
            {showCounty && c.district ? `${c.district} · ` : ""}
            {c.party_name || "無黨籍"}
          </p>
          {pending && <p className="text-[11px] text-accent-red mt-0.5">公報未刊登，待確認</p>}
        </div>
      </Link>
    </li>
  );
}

export function UpcomingRoster({
  candidates,
  districtInfo = [],
}: {
  candidates: Candidate[];
  districtInfo?: DistrictInfo[];
}) {
  if (candidates.length === 0) {
    return (
      <section className="border border-rule p-8 text-center">
        <p className="font-serif text-2xl mb-3">候選人名單尚未收錄</p>
        <p className="text-ink-soft max-w-xl mx-auto leading-relaxed">
          名單以中選會選舉公報為準，公報上架後收錄。
        </p>
      </section>
    );
  }

  const info = new Map(districtInfo.map((d) => [d.district, d]));
  const byDistrict = new Map<string, Candidate[]>();
  for (const c of candidates) {
    const d = c.district || "（選區未定）";
    if (!byDistrict.has(d)) byDistrict.set(d, []);
    byDistrict.get(d)!.push(c);
  }
  const byCounty = new Map<string, string[]>();
  for (const d of byDistrict.keys()) {
    const c = countyOf(d);
    if (!byCounty.has(c)) byCounty.set(c, []);
    byCounty.get(c)!.push(d);
  }
  const counties = Array.from(byCounty.keys()).sort((a, b) => {
    const ia = COUNTY_ORDER.indexOf(a);
    const ib = COUNTY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const pending = candidates.filter((c) => c.background === REG_MARK).length;
  // 縣市長、直轄市長：一縣市一選區，不需要第二層
  const singleSeat = counties.every((c) => byCounty.get(c)!.length === 1 && byCounty.get(c)![0] === c);
  const sourceUrl = districtInfo[0]?.source_url;

  return (
    <section className="space-y-4">
      <p className="text-sm text-ink-soft leading-relaxed">
        共 {candidates.length} 位候選人、{byDistrict.size} 個選舉區。號次、照片與學經歷取自中選會選舉公報
        {sourceUrl && (
          <>
            ；選舉區範圍與應選名額取自
            <a href={sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 mx-1 hover:text-ink">
              中選會選舉公告
            </a>
          </>
        )}
        。{!singleSeat && "點縣市、選舉區標題可展開或收合。"}
        {pending > 0 && (
          <span className="text-accent-red">（{pending} 位仍為登記名冊資料，公報未刊登，待確認）</span>
        )}
      </p>

      {singleSeat ? (
        <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
          {counties.map((county) => {
            const list = byDistrict.get(byCounty.get(county)![0])!.slice().sort(
              (a, b) => (a.ballot_no ?? 999) - (b.ballot_no ?? 999),
            );
            return (
              <div key={county} className="border-t-2 border-ink pt-2">
                <h3 className="font-serif text-lg font-bold mb-2">
                  {county} <span className="text-sm font-normal text-ink-soft">{list.length} 人</span>
                </h3>
                <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                  {list.map((c) => (
                    <CandidateCard key={c.candidate_id} c={c} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        counties.map((county, ci) => {
          const districts = byCounty.get(county)!.sort((a, b) => districtNum(a) - districtNum(b));
          const n = districts.reduce((s, d) => s + byDistrict.get(d)!.length, 0);
          const seats = districts.reduce((s, d) => s + (info.get(d)?.seats ?? 0), 0);
          return (
            <details key={county} open={ci === 0} className="group/county border border-rule bg-paper">
              <summary className="cursor-pointer list-none flex items-baseline gap-3 px-4 py-3 hover:bg-ink/5">
                <span className="text-ink-soft transition-transform group-open/county:rotate-90">›</span>
                <span className="font-serif text-xl font-bold">{county}</span>
                <span className="text-sm text-ink-soft">
                  {districts.length} 個選舉區 · {n} 人參選{seats > 0 && ` · 應選 ${seats} 席`}
                </span>
              </summary>
              <div className="px-4 pb-4 space-y-3">
                {districts.map((d) => {
                  const list = byDistrict.get(d)!.slice().sort(
                    (a, b) => (a.ballot_no ?? 999) - (b.ballot_no ?? 999),
                  );
                  const di = info.get(d);
                  return (
                    <details key={d} open className="group/d border-t border-rule pt-3">
                      <summary className="cursor-pointer list-none">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-ink-soft text-sm transition-transform group-open/d:rotate-90">›</span>
                          <span className="font-bold">{d.replace(county, "")}</span>
                          <span className="text-sm text-ink-soft">
                            {list.length} 人參選
                            {di?.seats != null && (
                              <>
                                {" · "}應選 <strong className="text-ink">{di.seats}</strong> 席
                                {di.women_seats ? `（婦女保障 ${di.women_seats}）` : ""}
                              </>
                            )}
                          </span>
                        </div>
                        {di && (
                          <p className="text-sm text-ink-soft mt-1 ml-5 line-clamp-2 group-open/d:line-clamp-none">
                            範圍：{di.area}
                          </p>
                        )}
                      </summary>
                      <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {list.map((c) => (
                          <CandidateCard key={c.candidate_id} c={c} />
                        ))}
                      </ul>
                    </details>
                  );
                })}
              </div>
            </details>
          );
        })
      )}
    </section>
  );
}
