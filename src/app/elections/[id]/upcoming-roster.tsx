import Link from "next/link";
import type { Candidate } from "@/lib/types";
import { candidatePhotoUrl } from "@/lib/api";
import { partyColor, COUNTY_ORDER } from "@/lib/format";

/** 尚未投票的選舉：依選舉公報列出候選人（號次、照片、政黨）。 */

const REG_MARK = "[登記中未經審定]";

function countyOf(district: string): string {
  const m = district.match(/^(.{2}[市縣])/);
  return m ? m[1] : district;
}

function districtNum(district: string): number {
  const m = district.match(/第(\d+)選舉區/);
  if (m) return Number(m[1]);
  if (district.includes("平地原住民")) return 900;
  if (district.includes("山地原住民")) return 901;
  return 0;
}

export function UpcomingRoster({ candidates }: { candidates: Candidate[] }) {
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
  const singleSeat = counties.every((c) => byCounty.get(c)!.length === 1 && byCounty.get(c)![0] === c);

  return (
    <section className="space-y-6">
      <p className="text-sm text-ink-soft">
        共 {candidates.length} 位候選人、{byDistrict.size} 個選舉區。號次、照片與學經歷取自中選會選舉公報。
        {pending > 0 && (
          <span className="text-accent-red">（{pending} 位仍為登記名冊資料，公報未刊登，待確認）</span>
        )}
      </p>
      {counties.map((county, ci) => {
        const districts = byCounty.get(county)!.sort((a, b) => districtNum(a) - districtNum(b));
        const n = districts.reduce((s, d) => s + byDistrict.get(d)!.length, 0);
        const body = districts.map((d) => {
          const list = byDistrict.get(d)!.slice().sort(
            (a, b) => (a.ballot_no ?? 999) - (b.ballot_no ?? 999),
          );
          return (
            <div key={d} className="mb-6">
              {!singleSeat && (
                <h3 className="text-sm font-bold mb-2 text-ink-soft">{d}</h3>
              )}
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {list.map((c) => {
                  const photo = candidatePhotoUrl(c.photo_path);
                  const color = partyColor(c.party_name || "無黨籍", c.color_hex);
                  return (
                    <li key={c.candidate_id} className="border border-rule">
                      <Link href={`/people/${encodeURIComponent(c.name)}`} className="block hover:bg-ink/5">
                        <div className="relative aspect-[4/5] bg-ink/5">
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photo} alt={`${c.name} 公報照片`} loading="lazy"
                              className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-serif text-4xl text-ink-soft">
                              {c.name.slice(0, 1)}
                            </div>
                          )}
                          {c.ballot_no != null && (
                            <span className="absolute top-0 left-0 px-2 py-0.5 text-paper text-sm font-bold tabular-nums"
                              style={{ backgroundColor: color }}>
                              {c.ballot_no}
                            </span>
                          )}
                        </div>
                        <div className="p-2 border-t-4" style={{ borderTopColor: color }}>
                          <p className="font-bold leading-tight">{c.name}</p>
                          <p className="text-xs text-ink-soft truncate">{c.party_name || "無黨籍"}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        });
        return (
          <details key={county} open={ci === 0 || singleSeat} className="border-t border-rule pt-3">
            <summary className="cursor-pointer font-serif text-xl font-bold mb-3">
              {county} <span className="text-sm font-normal text-ink-soft">{n} 人</span>
            </summary>
            {body}
          </details>
        );
      })}
    </section>
  );
}
