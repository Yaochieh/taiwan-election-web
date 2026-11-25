"use client";

import { useEffect, useState } from "react";
import type { Candidate } from "@/lib/types";
import { getCandidates } from "@/lib/api";
import { partyColor, COUNTY_ORDER } from "@/lib/format";
import { PickerBox, PickerRow, PickerChip, PickerHint, queryString, useQueryParams } from "./picker";

/** 村里長：名單取自中選會候選人登記名冊。人數多：先選縣市、再選鄉鎮市區，才列出各村里候選人。 */

// 先找「區」（避免「平鎮區」在「鎮」被切開），沒有才找鄉鎮市
const SPLITS = [/^(.{2}[市縣])(.+?區)(.+[村里])$/, /^(.{2}[市縣])(.+?[鄉鎮市])(.+[村里])$/];
const splitDistrict = (d: string) => SPLITS.map((r) => d.match(r)).find(Boolean) ?? null;

const KEYS = ["county", "town"] as const;

export function VillageRoster({
  electionId,
  counts,
}: {
  electionId: number;
  counts: { county: string; n: number }[];
}) {
  const [{ county, town }, go] = useQueryParams(KEYS);
  // 1.4 萬人全塞進頁面太重：選了縣市才在瀏覽器向 API 要該縣市名單，同縣市只抓一次
  const [cache, setCache] = useState<Record<string, Candidate[] | "error">>({});
  useEffect(() => {
    if (!county || cache[county]) return;
    let alive = true;
    getCandidates(electionId, county)
      .then((list) => alive && setCache((m) => ({ ...m, [county]: list })))
      .catch(() => alive && setCache((m) => ({ ...m, [county]: "error" })));
    return () => {
      alive = false;
    };
  }, [county, electionId, cache]);
  const loaded = county ? cache[county] : undefined;
  const candidates = Array.isArray(loaded) ? loaded : [];
  const total = counts.reduce((s, c) => s + c.n, 0);
  const sorted = counts.slice().sort((a, b) => {
    const ia = COUNTY_ORDER.indexOf(a.county);
    const ib = COUNTY_ORDER.indexOf(b.county);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  // 鄉鎮市區 → 村里 → 候選人；依中選會名冊順序（匯入時 candidate_id 遞增），不要用字串排序
  const byTown = new Map<string, Map<string, Candidate[]>>();
  const ordered = candidates.slice().sort((a, b) => a.candidate_id - b.candidate_id);
  for (const c of ordered) {
    const m = splitDistrict(c.district || "");
    const t = m ? m[2] : "（未分類）";
    const village = m ? m[3] : c.district || "";
    if (!byTown.has(t)) byTown.set(t, new Map());
    const v = byTown.get(t)!;
    if (!v.has(village)) v.set(village, []);
    v.get(village)!.push(c);
  }
  const townN = (t: string) => Array.from(byTown.get(t)!.values()).reduce((s, l) => s + l.length, 0);
  const qs = (c?: string, t?: string) => queryString({ county: c, town: c ? t : undefined });
  const pick = (c?: string, t?: string) => () => go({ county: c, town: c ? t : undefined });
  const activeTown = town && byTown.has(town) ? town : undefined;
  const villages = activeTown ? byTown.get(activeTown)! : null;

  return (
    <section className="space-y-6">
      <p className="text-sm text-ink-soft leading-relaxed">
        共 {total.toLocaleString()} 位登記參選人，名單取自
        <a
          href="https://web.cec.gov.tw/central/article/64709"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 mx-1 hover:text-ink"
        >
          中選會候選人登記名冊
        </a>
        （115 年 8/31–9/4 登記），之後的退選或審定結果未反映；開票後以中選會得票資料為準。
        村里長也有選舉公報（每個村里一份），但中選會電子公報網站 2026 年的檔案還沒上架，上架後會補上學經歷與政見；目前只有姓名與政黨，同名者多，暫不連到個人頁。
      </p>

      <PickerBox>
        <PickerRow label="選縣市" onClear={county ? pick() : undefined}>
          {sorted.map((c) => (
            <PickerChip key={c.county} query={qs(c.county)} onSelect={pick(c.county)} active={c.county === county} label={c.county} count={c.n} />
          ))}
        </PickerRow>
        {county && byTown.size > 0 && (
          <PickerRow label="選鄉鎮市區" onClear={activeTown ? pick(county) : undefined} clearQuery={qs(county)}>
            {Array.from(byTown.keys()).map((t) => (
              <PickerChip
                key={t}
                query={qs(county, t)}
                onSelect={pick(county, t)}
                active={t === activeTown}
                label={t}
                count={townN(t)}
              />
            ))}
          </PickerRow>
        )}
      </PickerBox>

      {!county ? (
        <PickerHint>請先在上方選縣市，再選鄉鎮市區，就會列出各村里的登記參選人。</PickerHint>
      ) : loaded === undefined ? (
        <PickerHint>載入{county}名單中…（資料庫休眠時第一次約需半分鐘）</PickerHint>
      ) : loaded === "error" ? (
        <PickerHint>{county}名單載入失敗，請重新整理再試一次。</PickerHint>
      ) : candidates.length === 0 ? (
        <PickerHint>{county}沒有資料。</PickerHint>
      ) : !villages ? (
        <PickerHint>請選{county}的鄉鎮市區。</PickerHint>
      ) : (
        <div className="border-t-2 border-ink pt-3">
          <h3 className="font-serif text-xl font-bold mb-3">
            {county}
            {activeTown}
            <span className="ml-3 text-sm font-normal text-ink-soft">
              {villages.size} 村里 · {townN(activeTown!)} 人
            </span>
          </h3>
          <table className="w-full text-sm">
            <tbody>
              {Array.from(villages.entries()).map(([village, list]) => (
                <tr key={village} className="border-b border-rule/50 align-top">
                  <td className="py-1.5 pr-3 whitespace-nowrap text-ink-soft w-24">{village}</td>
                  <td className="py-1.5">
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                      {list.map((c) => (
                        <li key={c.candidate_id} className="flex items-center gap-1.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: partyColor(c.party_name || "無黨籍", c.color_hex) }}
                          />
                          <span className="font-medium">{c.name}</span>
                          {c.party_name && <span className="text-xs text-ink-soft">{c.party_name}</span>}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
