import Link from "next/link";
import type { Candidate } from "@/lib/types";
import { partyColor, COUNTY_ORDER } from "@/lib/format";

/** 村里長：沒有選舉公報，名單取自中選會候選人登記名冊。人數多，按縣市分頁。 */

// 先找「區」（避免「平鎮區」在「鎮」被切開），沒有才找鄉鎮市
const SPLITS = [/^(.{2}[市縣])(.+?區)(.+[村里])$/, /^(.{2}[市縣])(.+?[鄉鎮市])(.+[村里])$/];
const splitDistrict = (d: string) => SPLITS.map((r) => d.match(r)).find(Boolean) ?? null;

export function VillageRoster({
  electionId,
  county,
  counts,
  candidates,
}: {
  electionId: number;
  county?: string;
  counts: { county: string; n: number }[];
  candidates: Candidate[];
}) {
  const total = counts.reduce((s, c) => s + c.n, 0);
  const sorted = counts.slice().sort((a, b) => {
    const ia = COUNTY_ORDER.indexOf(a.county);
    const ib = COUNTY_ORDER.indexOf(b.county);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  // 鄉鎮市區 → 村里 → 候選人
  const byTown = new Map<string, Map<string, Candidate[]>>();
  for (const c of candidates) {
    const m = splitDistrict(c.district || "");
    const town = m ? m[2] : "（未分類）";
    const village = m ? m[3] : c.district || "";
    if (!byTown.has(town)) byTown.set(town, new Map());
    const v = byTown.get(town)!;
    if (!v.has(village)) v.set(village, []);
    v.get(village)!.push(c);
  }

  return (
    <section className="space-y-6">
      <p className="text-sm text-ink-soft leading-relaxed">
        共 {total.toLocaleString()} 位登記參選人。村里長選舉沒有選舉公報，名單取自
        <a href="https://web.cec.gov.tw/central/article/64709" className="underline mx-1">
          中選會候選人登記名冊
        </a>
        （115 年 8/31–9/4 登記），之後的退選或審定結果未反映；開票後以中選會得票資料為準。
        同名者多，暫不連到個人頁。
      </p>
      <nav className="flex flex-wrap gap-2">
        {sorted.map((c) => (
          <Link
            key={c.county}
            href={`/elections/${electionId}?county=${encodeURIComponent(c.county)}`}
            className={`px-3 py-1 border text-sm ${
              c.county === county ? "bg-ink text-paper border-ink" : "border-rule hover:bg-ink/5"
            }`}
          >
            {c.county} <span className="tabular-nums opacity-70">{c.n}</span>
          </Link>
        ))}
      </nav>
      {!county ? (
        <p className="text-ink-soft">請選擇縣市。</p>
      ) : candidates.length === 0 ? (
        <p className="text-ink-soft">{county}沒有資料。</p>
      ) : (
        Array.from(byTown.entries()).map(([town, villages], i) => (
          <details key={town} open={i === 0} className="border-t border-rule pt-3">
            <summary className="cursor-pointer font-serif text-xl font-bold mb-3">
              {town}{" "}
              <span className="text-sm font-normal text-ink-soft">
                {villages.size} 村里 · {Array.from(villages.values()).reduce((s, l) => s + l.length, 0)} 人
              </span>
            </summary>
            <table className="w-full text-sm">
              <tbody>
                {Array.from(villages.entries()).map(([village, list]) => (
                  <tr key={village} className="border-b border-rule/50 align-top">
                    <td className="py-1.5 pr-4 whitespace-nowrap text-ink-soft w-28">{village}</td>
                    <td className="py-1.5">
                      <ul className="flex flex-wrap gap-x-4 gap-y-1">
                        {list.map((c) => (
                          <li key={c.candidate_id} className="flex items-center gap-1.5">
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: partyColor(c.party_name || "無黨籍", c.color_hex) }}
                            />
                            <span className="font-medium">{c.name}</span>
                            {c.party_name && (
                              <span className="text-xs text-ink-soft">{c.party_name}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        ))
      )}
    </section>
  );
}
