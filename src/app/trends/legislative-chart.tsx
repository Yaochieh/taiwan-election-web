"use client";

import { useMemo } from "react";
import type { LegislativeSeatTrend } from "@/lib/api";
import { partyColor } from "@/lib/format";

interface Props {
  data: LegislativeSeatTrend[];
}

// 區域+原住民共 79 席（73 區域 + 3 山地 + 3 平地）
const TOTAL_SEATS = 79;

export function LegislativeChart({ data }: Props) {
  const { years, partyMap } = useMemo(() => {
    const yearSet = new Set<string>();
    const map = new Map<string, Map<string, { seats: number; color: string }>>();
    for (const r of data) {
      yearSet.add(r.year);
      if (!map.has(r.party)) map.set(r.party, new Map());
      map
        .get(r.party)!
        .set(r.year, {
          seats: r.seats,
          color: partyColor(r.party, r.color_hex),
        });
    }
    const years = Array.from(yearSet).sort();
    return { years, partyMap: map };
  }, [data]);

  // 計算各黨總席次（排序用）
  const partyTotals = useMemo(() => {
    const arr: { party: string; total: number; color: string }[] = [];
    for (const [party, yearMap] of partyMap) {
      let total = 0;
      let color = "#888";
      for (const v of yearMap.values()) {
        total += v.seats;
        color = v.color;
      }
      arr.push({ party, total, color });
    }
    return arr.sort((a, b) => b.total - a.total);
  }, [partyMap]);

  if (years.length === 0) {
    return (
      <p className="text-sm text-ink-soft border border-rule p-6 text-center">
        無資料
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* 每年一條堆疊條 */}
      <div className="grid grid-cols-[60px_1fr_60px] sm:grid-cols-[80px_1fr_80px] gap-x-3 gap-y-2 items-center">
        {years.map((year) => {
          const yearTotal = partyTotals.reduce(
            (acc, p) => acc + (partyMap.get(p.party)?.get(year)?.seats ?? 0),
            0,
          );
          return (
            <div key={year} className="contents">
              <div className="font-serif text-lg tabular-nums">{year}</div>
              <div className="flex h-9 overflow-hidden border border-ink">
                {partyTotals.map((p) => {
                  const seats = partyMap.get(p.party)?.get(year)?.seats ?? 0;
                  if (seats === 0) return null;
                  const pct = (seats / TOTAL_SEATS) * 100;
                  return (
                    <div
                      key={p.party}
                      className="flex items-center justify-center text-paper text-xs font-bold"
                      style={{ width: `${pct}%`, backgroundColor: p.color }}
                      title={`${p.party} ${seats} 席`}
                    >
                      {pct >= 8 ? seats : ""}
                    </div>
                  );
                })}
                {yearTotal < TOTAL_SEATS && (
                  <div
                    className="flex items-center justify-center text-ink-soft text-xs"
                    style={{
                      width: `${((TOTAL_SEATS - yearTotal) / TOTAL_SEATS) * 100}%`,
                      backgroundColor: "#e5e5e5",
                    }}
                  >
                    無黨
                  </div>
                )}
              </div>
              <div className="text-xs text-ink-soft tabular-nums text-right">
                共 {yearTotal} 席
              </div>
            </div>
          );
        })}
      </div>

      {/* 圖例 */}
      <div className="flex flex-wrap gap-3 pt-3 border-t border-rule text-xs">
        {partyTotals.map((p) => (
          <div key={p.party} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3"
              style={{ backgroundColor: p.color }}
            />
            <span>{p.party}</span>
            <span className="text-ink-soft tabular-nums">({p.total})</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-ink-soft pt-2">
        資料含區域立委（73 席）+ 山地原住民（3 席）+ 平地原住民（3 席），不含不分區。
      </p>
    </div>
  );
}
