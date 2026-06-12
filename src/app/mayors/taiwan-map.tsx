"use client";

import { useEffect, useState, useMemo } from "react";
import { partyColor } from "@/lib/format";

// GeoJSON 中縣市名稱 → DB 中縣市名稱對應（部分舊縣名要轉新）
const GEO_NAME_MAP: Record<string, string> = {
  桃園縣: "桃園市",
};

interface MapData {
  [county: string]: { party: string | null; candidate: string };
}

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

export function TaiwanMap({ data }: { data: MapData }) {
  const [geo, setGeo] = useState<GeoJSON | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    fetch("/taiwan.geojson")
      .then((r) => r.json())
      .then(setGeo)
      .catch(() => setGeo(null));
  }, []);

  const { paths, bbox } = useMemo(() => {
    if (!geo) return { paths: [] as MapPath[], bbox: null };
    const features = geo.features;

    // 算範圍
    let minLon = Infinity;
    let maxLon = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;
    for (const f of features) {
      const polys = extractRings(f.geometry);
      for (const ring of polys) {
        for (const [lon, lat] of ring) {
          if (lon < minLon) minLon = lon;
          if (lon > maxLon) maxLon = lon;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
      }
    }
    // 排除離島，使主島放大顯示（金門/連江/澎湖等可能極遠）
    // 限制主島大致範圍
    const minLonMain = 119.5;
    const maxLonMain = 122.5;
    const minLatMain = 21.5;
    const maxLatMain = 25.5;

    const paths: MapPath[] = [];
    for (const f of features) {
      const rawName = f.properties.name_traditional_chinese;
      const name = GEO_NAME_MAP[rawName] || rawName;
      const polys = extractRings(f.geometry);
      const d = polys
        .map((ring) =>
          ring
            .map((coord, idx) => {
              const [lon, lat] = coord;
              // SVG 0-100 → lon/lat mapping with viewBox below
              const x = ((lon - minLonMain) / (maxLonMain - minLonMain)) * 100;
              const y =
                ((maxLatMain - lat) / (maxLatMain - minLatMain)) * 140; // 縱長一些
              return `${idx === 0 ? "M" : "L"}${x.toFixed(3)},${y.toFixed(3)}`;
            })
            .join(" ") + " Z",
        )
        .join(" ");
      paths.push({ name, d });
    }
    return { paths, bbox: { minLonMain, maxLonMain, minLatMain, maxLatMain } };
  }, [geo]);

  if (!geo) {
    return (
      <div className="border border-rule p-12 text-center text-ink-soft">
        地圖載入中…
      </div>
    );
  }

  return (
    <div className="border border-rule p-4 sm:p-8 bg-paper relative">
      <svg
        viewBox="0 0 100 140"
        className="w-full max-w-2xl mx-auto"
        style={{ maxHeight: "70vh" }}
        role="img"
        aria-label="台灣縣市地圖"
      >
        {paths.map((p) => {
          const cellData = data[p.name];
          const fill = cellData
            ? partyColor(cellData.party)
            : "#e5e5e5";
          const isHover = hover === p.name;
          return (
            <path
              key={p.name}
              d={p.d}
              fill={fill}
              fillOpacity={isHover ? 1 : 0.85}
              stroke="#fff"
              strokeWidth={0.15}
              onMouseEnter={() => setHover(p.name)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: cellData ? "pointer" : "default" }}
            />
          );
        })}
      </svg>

      {/* hover tooltip */}
      {hover && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-ink text-paper px-3 py-2 text-sm pointer-events-none">
          <div className="font-medium">{hover}</div>
          {data[hover] ? (
            <div className="text-xs opacity-90">
              {data[hover].candidate} · {data[hover].party || "無黨籍"}
            </div>
          ) : (
            <div className="text-xs opacity-70">無資料</div>
          )}
        </div>
      )}
    </div>
  );
}

interface MapPath {
  name: string;
  d: string;
}

// GeoJSON geometry → 環陣列
function extractRings(geom: {
  type: string;
  coordinates: unknown;
}): number[][][] {
  if (geom.type === "Polygon") {
    return geom.coordinates as number[][][];
  }
  if (geom.type === "MultiPolygon") {
    const rings: number[][][] = [];
    for (const poly of geom.coordinates as number[][][][]) {
      for (const ring of poly) {
        rings.push(ring);
      }
    }
    return rings;
  }
  return [];
}
