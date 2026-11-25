"use client";

import Link from "next/link";
import type { Candidate } from "@/lib/types";
import { candidatePhotoUrl, type DistrictInfo } from "@/lib/api";
import { partyColor, COUNTY_ORDER } from "@/lib/format";
import { PickerBox, PickerRow, PickerChip, PickerHint, ClientLink, queryString, useQueryParams } from "./picker";

/** 尚未投票的選舉：依選舉公報列出候選人（號次、照片、政黨）。
 *  上方方框先選縣市、再選選舉區，選定後才列出候選人；
 *  選舉區列出範圍與應選名額（中選會選舉公告）。 */

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
    <li className="group border border-rule bg-paper transition hover:-translate-y-0.5 hover:shadow-sm">
      <Link prefetch={false} href={`/people/${encodeURIComponent(c.name)}`} className="block">
        <div className="relative aspect-[4/5] bg-paper overflow-hidden">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={`${c.name} 公報照片`} loading="lazy" className="bulletin-photo w-full h-full object-cover object-top transition duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-serif text-4xl text-ink-soft">
              {c.name.slice(0, 1)}
            </div>
          )}
          {c.prev_win_year && (
            <span
              className="absolute bottom-0 right-0 px-1.5 py-0.5 text-[11px] font-medium bg-ink text-paper"
              title={`${c.prev_win_year} 年同縣市同名候選人當選`}
            >
              {c.prev_win_year} 當選
            </span>
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

const KEYS = ["county", "district"] as const;

export function UpcomingRoster({
  candidates,
  districtInfo = [],
}: {
  candidates: Candidate[];
  districtInfo?: DistrictInfo[];
}) {
  const [{ county, district }, go] = useQueryParams(KEYS);
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
  for (const ds of byCounty.values()) ds.sort((a, b) => districtNum(a) - districtNum(b));
  const counties = Array.from(byCounty.keys()).sort((a, b) => {
    const ia = COUNTY_ORDER.indexOf(a);
    const ib = COUNTY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const countyN = (c: string) => byCounty.get(c)!.reduce((s, d) => s + byDistrict.get(d)!.length, 0);
  const pending = candidates.filter((c) => c.background === REG_MARK).length;
  const prevWins = candidates.filter((c) => c.prev_win_year).length;
  const prevYear = candidates.find((c) => c.prev_win_year)?.prev_win_year;
  // 縣市長、直轄市長：一縣市一選區，不需要第二層
  const singleSeat = counties.every((c) => byCounty.get(c)!.length === 1 && byCounty.get(c)![0] === c);
  const sourceUrl = districtInfo[0]?.source_url;
  const qs = (c?: string, d?: string) => queryString({ county: c, district: c ? d : undefined });
  const pick = (c?: string, d?: string) => () => go({ county: c, district: c ? d : undefined });

  const activeCounty = county && byCounty.has(county) ? county : undefined;
  const countyDistricts = activeCounty ? byCounty.get(activeCounty)! : [];
  const activeDistrict = district && countyDistricts.includes(district) ? district : undefined;
  const sortByBallot = (l: Candidate[]) => l.slice().sort((a, b) => (a.ballot_no ?? 999) - (b.ballot_no ?? 999));

  return (
    <section className="space-y-6">
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
        。
        {prevWins > 0 && `其中 ${prevWins} 位在 ${prevYear} 年同類選舉當選（照片右下角標示，依中選會得票資料比對同縣市同名者）。`}
        {pending > 0 && (
          <span className="text-accent-red">（{pending} 位仍為登記名冊資料，公報未刊登，待確認）</span>
        )}
      </p>

      <PickerBox>
        <PickerRow label="選縣市" onClear={activeCounty ? pick() : undefined}>
          {counties.map((c) => (
            <PickerChip key={c} query={qs(c)} onSelect={pick(c)} active={c === activeCounty} label={c} count={countyN(c)} />
          ))}
        </PickerRow>
        {activeCounty && !singleSeat && (
          <PickerRow label="選選舉區" onClear={activeDistrict ? pick(activeCounty) : undefined} clearQuery={qs(activeCounty)}>
            {countyDistricts.map((d) => (
              <PickerChip
                key={d}
                query={qs(activeCounty, d)}
                onSelect={pick(activeCounty, d)}
                active={d === activeDistrict}
                label={d.replace(activeCounty, "")}
                count={byDistrict.get(d)!.length}
              />
            ))}
          </PickerRow>
        )}
      </PickerBox>

      {singleSeat ? (
        // 市長／縣市長人數少：未選縣市時列出全部，選了只看該縣市
        <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
          {(activeCounty ? [activeCounty] : counties).map((c) => {
            const list = sortByBallot(byDistrict.get(byCounty.get(c)![0])!);
            return (
              <div key={c} className="border-t-2 border-ink pt-2 min-w-0">
                <h3 className="font-serif text-lg font-bold mb-2">
                  {c} <span className="text-sm font-normal text-ink-soft">{list.length} 人</span>
                </h3>
                <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                  {list.map((x) => (
                    <CandidateCard key={x.candidate_id} c={x} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : !activeCounty ? (
        <PickerHint>請先在上方選縣市，再選選舉區，就會列出該選舉區的候選人。</PickerHint>
      ) : !activeDistrict ? (
        <div className="border border-rule divide-y divide-rule">
          <p className="px-4 py-2 text-sm text-ink-soft bg-ink/5">
            {activeCounty}共 {countyDistricts.length} 個選舉區、{countyN(activeCounty)} 人參選
            {(() => {
              const seats = countyDistricts.reduce((s, d) => s + (info.get(d)?.seats ?? 0), 0);
              return seats > 0 ? `、應選 ${seats} 席` : "";
            })()}
            。點選舉區看候選人。
          </p>
          {countyDistricts.map((d) => {
            const di = info.get(d);
            return (
              <ClientLink
                key={d}
                query={qs(activeCounty, d)}
                onSelect={pick(activeCounty, d)}
                className="flex flex-col sm:flex-row sm:items-baseline gap-x-4 gap-y-0.5 px-4 py-3 hover:bg-ink/5"
              >
                <span className="font-bold shrink-0 sm:w-28">{d.replace(activeCounty, "")}</span>
                <span className="text-sm text-ink-soft shrink-0 sm:w-40">
                  {byDistrict.get(d)!.length} 人參選
                  {di?.seats != null && ` · 應選 ${di.seats} 席`}
                </span>
                {di && <span className="text-sm text-ink-soft min-w-0">範圍：{di.area}</span>}
              </ClientLink>
            );
          })}
        </div>
      ) : (
        (() => {
          const list = sortByBallot(byDistrict.get(activeDistrict)!);
          const di = info.get(activeDistrict);
          return (
            <div>
              <div className="border-t-2 border-ink pt-3 mb-4">
                <h3 className="font-serif text-xl font-bold">
                  {activeDistrict}
                  <span className="ml-3 text-sm font-normal text-ink-soft">
                    {list.length} 人參選
                    {di?.seats != null && (
                      <>
                        {" · "}應選 <strong className="text-ink">{di.seats}</strong> 席
                        {di.women_seats ? `（婦女保障 ${di.women_seats}）` : ""}
                      </>
                    )}
                  </span>
                </h3>
                {di && <p className="text-sm text-ink-soft mt-1 leading-relaxed">範圍：{di.area}</p>}
              </div>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {list.map((c) => (
                  <CandidateCard key={c.candidate_id} c={c} />
                ))}
              </ul>
            </div>
          );
        })()
      )}
    </section>
  );
}
