"use client";

import { useEffect, useState, useMemo } from "react";
import type { ElectionResult } from "@/lib/types";
import { partyColor, formatVotes } from "@/lib/format";
import { getTownshipResults, type TownshipResult } from "@/lib/api";

// GeoJSON 縣名 → DB 縣名 (DB 中是 "臺北市"/"高雄市" 等)
const GEO_NAME_MAP: Record<string, string> = {
  桃園縣: "桃園市",
  臺北市: "臺北市",
  // 兩種寫法都映射
  台北市: "臺北市",
  台中市: "臺中市",
  台南市: "臺南市",
  // GeoJSON 使用「台」字（傳統），DB 用「臺」字
};

interface GeoFeature {
  type: string;
  properties: {
    name_traditional_chinese: string;
    [key: string]: unknown;
  };
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

interface GeoJSON {
  type: string;
  features: GeoFeature[];
}

interface MapPath {
  name: string;
  d: string;
}

function extractRings(geom: {
  type: string;
  coordinates: unknown;
}): number[][][] {
  if (geom.type === "Polygon") return geom.coordinates as number[][][];
  if (geom.type === "MultiPolygon") {
    const rings: number[][][] = [];
    for (const poly of geom.coordinates as number[][][][]) {
      for (const ring of poly) rings.push(ring);
    }
    return rings;
  }
  return [];
}

interface Pair {
  primary: ElectionResult;
  running?: ElectionResult;
}

function TownshipPanel({
  townships,
  loading,
  isPresident,
}: {
  townships: TownshipResult[];
  loading: boolean;
  isPresident: boolean;
}) {
  // 按 township 分組
  const byTwn = useMemo(() => {
    const m = new Map<string, TownshipResult[]>();
    for (const t of townships) {
      if (!m.has(t.township)) m.set(t.township, []);
      m.get(t.township)!.push(t);
    }
    // 對每個鄉鎮：去除同票數副總統重複
    const out: { township: string; winner: TownshipResult; total: number; rows: TownshipResult[] }[] = [];
    for (const [twn, rows] of m) {
      const sorted = rows.slice().sort((a, b) => b.votes - a.votes);
      const unique: TownshipResult[] = [];
      const seen = new Set<number>();
      for (let i = 0; i < sorted.length; i++) {
        if (seen.has(i)) continue;
        seen.add(i);
        unique.push(sorted[i]);
        if (isPresident) {
          for (let j = i + 1; j < sorted.length; j++) {
            if (
              !seen.has(j) &&
              sorted[j].votes === sorted[i].votes &&
              sorted[j].party_name === sorted[i].party_name
            ) {
              seen.add(j);
              break;
            }
          }
        }
      }
      const total = unique.reduce((a, b) => a + b.votes, 0);
      out.push({ township: twn, winner: unique[0], total, rows: unique });
    }
    return out.sort((a, b) => b.total - a.total);
  }, [townships, isPresident]);

  if (loading) {
    return (
      <p className="text-xs text-ink-soft mt-4 pt-4 border-t border-rule">
        鄉鎮市區資料載入中…
      </p>
    );
  }
  if (byTwn.length === 0) {
    return (
      <p className="text-xs text-ink-soft mt-4 pt-4 border-t border-rule">
        此縣市無鄉鎮市區資料
      </p>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-rule">
      <p className="text-xs font-bold mb-2 tracking-wider uppercase text-ink-soft">
        鄉鎮市區（{byTwn.length}）· 各鄉鎮勝出者
      </p>
      <div className="max-h-72 overflow-y-auto pr-1 space-y-1">
        {byTwn.map((r) => {
          const wPct = r.total > 0 ? (r.winner.votes / r.total) * 100 : 0;
          return (
            <div
              key={r.township}
              className="flex items-center gap-2 text-xs py-1 border-b border-rule/50"
            >
              <span
                className="w-2 h-4 shrink-0"
                style={{
                  backgroundColor: partyColor(
                    r.winner.party_name,
                    r.winner.color_hex,
                  ),
                }}
              />
              <span className="w-16 shrink-0">{r.township}</span>
              <span
                className="font-medium truncate"
                style={{
                  color: partyColor(r.winner.party_name, r.winner.color_hex),
                }}
              >
                {r.winner.candidate_name}
              </span>
              <span className="ml-auto tabular-nums text-ink-soft">
                {wPct.toFixed(1)}%
              </span>
              <span className="tabular-nums text-ink-soft w-16 text-right">
                {formatVotes(r.total)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VoteMap({
  results,
  isPresident,
  electionId,
}: {
  results: ElectionResult[];
  isPresident: boolean;
  electionId: number;
}) {
  const [geo, setGeo] = useState<GeoJSON | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [townships, setTownships] = useState<TownshipResult[]>([]);
  const [townshipLoading, setTownshipLoading] = useState(false);

  useEffect(() => {
    if (!selected) {
      setTownships([]);
      return;
    }
    setTownshipLoading(true);
    getTownshipResults(electionId, selected)
      .then(setTownships)
      .catch(() => setTownships([]))
      .finally(() => setTownshipLoading(false));
  }, [selected, electionId]);

  useEffect(() => {
    fetch("/taiwan.geojson")
      .then((r) => r.json())
      .then(setGeo)
      .catch(() => setGeo(null));
  }, []);

  // 按縣市分組（presidential 只有縣市層級資料）
  const byCounty = useMemo(() => {
    const map = new Map<string, ElectionResult[]>();
    for (const r of results) {
      if (!r.district) continue;
      // Skip summary
      if (r.district === "全國" || r.district === "地區(0, 0, 0)") continue;
      const county = r.district.replace(/^臺/, "臺"); // normalize
      if (!map.has(county)) map.set(county, []);
      map.get(county)!.push(r);
    }
    return map;
  }, [results]);

  // 每縣市的贏家
  const winnerByCounty = useMemo(() => {
    const map = new Map<string, { winner: ElectionResult; total: number }>();
    for (const [county, rows] of byCounty) {
      // 對 presidential：把同票數的正副合併視為一組
      let candidates: ElectionResult[];
      if (isPresident) {
        const sorted = rows.slice().sort((a, b) => b.votes - a.votes);
        const seen = new Set<number>();
        const groups: ElectionResult[] = [];
        for (let i = 0; i < sorted.length; i++) {
          if (seen.has(i)) continue;
          seen.add(i);
          groups.push(sorted[i]);
          for (let j = i + 1; j < sorted.length; j++) {
            if (
              !seen.has(j) &&
              sorted[j].votes === sorted[i].votes &&
              sorted[j].party_name === sorted[i].party_name
            ) {
              seen.add(j);
              break;
            }
          }
        }
        candidates = groups;
      } else {
        candidates = rows.slice().sort((a, b) => b.votes - a.votes);
      }
      const winner = candidates[0];
      const total = candidates.reduce((a, b) => a + b.votes, 0);
      map.set(county, { winner, total });
    }
    return map;
  }, [byCounty, isPresident]);

  const { paths } = useMemo(() => {
    if (!geo) return { paths: [] as MapPath[] };
    const minLonMain = 119.5;
    const maxLonMain = 122.5;
    const minLatMain = 21.5;
    const maxLatMain = 25.5;

    const paths: MapPath[] = [];
    for (const f of geo.features) {
      const rawName = f.properties.name_traditional_chinese;
      // 將 "台北市" → "臺北市" 來對應 DB
      const name = (
        GEO_NAME_MAP[rawName] ?? rawName.replace(/^台/, "臺")
      );
      const polys = extractRings(f.geometry);
      const d = polys
        .map((ring) =>
          ring
            .map((coord, idx) => {
              const [lon, lat] = coord;
              const x = ((lon - minLonMain) / (maxLonMain - minLonMain)) * 100;
              const y =
                ((maxLatMain - lat) / (maxLatMain - minLatMain)) * 140;
              return `${idx === 0 ? "M" : "L"}${x.toFixed(3)},${y.toFixed(3)}`;
            })
            .join(" ") + " Z",
        )
        .join(" ");
      paths.push({ name, d });
    }
    return { paths };
  }, [geo]);

  if (!geo) {
    return (
      <div className="border border-rule p-12 text-center text-ink-soft">
        地圖載入中…
      </div>
    );
  }

  const selectedCounty = selected || hover;
  const selectedData = selectedCounty
    ? { rows: byCounty.get(selectedCounty), info: winnerByCounty.get(selectedCounty) }
    : null;

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {/* 左：詳細統計 */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold">
          {selectedCounty || "點選縣市查看詳情"}
        </h3>
        {selectedData?.rows && selectedData.info ? (
          <>
            <p className="text-xs text-ink-soft">
              該縣市總有效票：{formatVotes(selectedData.info.total)} 票
            </p>
            <ol className="space-y-2">
              {selectedData.rows
                .slice()
                .sort((a, b) => b.votes - a.votes)
                .filter(
                  // 過濾掉同票數副總統重複行
                  (r, idx, arr) =>
                    !isPresident ||
                    idx === arr.findIndex(
                      (x) => x.votes === r.votes && x.party_name === r.party_name,
                    ),
                )
                .map((r, idx) => {
                  const pct = (r.votes / selectedData.info!.total) * 100;
                  return (
                    <li
                      key={`${r.candidate_name}-${idx}`}
                      className="border-l-2 pl-3 py-1"
                      style={{
                        borderColor: partyColor(r.party_name, r.color_hex),
                      }}
                    >
                      <div className="flex items-baseline justify-between text-sm">
                        <span
                          className="font-medium"
                          style={{ color: partyColor(r.party_name, r.color_hex) }}
                        >
                          {r.candidate_name}
                        </span>
                        <span className="font-bold tabular-nums">
                          {pct.toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-xs text-ink-soft tabular-nums">
                        {formatVotes(r.votes)} 票
                      </div>
                    </li>
                  );
                })}
            </ol>
            {selected && (
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-ink-soft underline hover:text-ink"
              >
                取消選取
              </button>
            )}
            {selected && (
              <TownshipPanel
                townships={townships}
                loading={townshipLoading}
                isPresident={isPresident}
              />
            )}
          </>
        ) : (
          <p className="text-sm text-ink-soft">
            滑鼠移到地圖上的縣市，或點擊以鎖定查看。
          </p>
        )}
      </div>

      {/* 右：地圖 */}
      <div className="border border-rule p-2 bg-paper">
        <svg
          viewBox="-1 -1 102 142"
          className="w-full max-w-md mx-auto"
          role="img"
          aria-label="選票分佈地圖"
        >
          {paths.map((p) => {
            const data = winnerByCounty.get(p.name);
            const isSelected = selected === p.name;
            const isHover = hover === p.name;
            const fill = data
              ? partyColor(data.winner.party_name, data.winner.color_hex)
              : "#e5e5e5";
            return (
              <path
                key={p.name}
                d={p.d}
                fill={fill}
                fillOpacity={isSelected ? 1 : isHover ? 0.95 : 0.85}
                stroke={isSelected ? "#222" : "#fff"}
                strokeWidth={isSelected ? 0.4 : 0.15}
                onMouseEnter={() => setHover(p.name)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSelected(selected === p.name ? null : p.name)}
                style={{ cursor: data ? "pointer" : "default" }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
