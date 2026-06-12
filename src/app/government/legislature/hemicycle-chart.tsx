"use client";

import { useMemo, useState } from "react";
import type { LegislaturePartyTotal } from "@/lib/types";
import { partyColor } from "@/lib/format";

interface Props {
  parties: LegislaturePartyTotal[]; // 已按左右排序
  totalSeats: number;
}

interface SeatPos {
  x: number;
  y: number;
  party: string;
  color: string;
}

/**
 * 半圓席次圖（hemicycle / parliament chart）
 *
 * 113 席分成 N 列（圈），每列從外到內席次數遞減，
 * 整體排成半圓。從左到右按政黨順序依序填入。
 */
export function HemicycleChart({ parties, totalSeats }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  const seats = useMemo<SeatPos[]>(() => {
    return computeSeatPositions(parties, totalSeats);
  }, [parties, totalSeats]);

  return (
    <div>
      <svg
        viewBox="-1.05 -1.05 2.1 1.2"
        className="w-full max-w-3xl mx-auto"
        role="img"
        aria-label="立法院半圓席次圖"
      >
        {seats.map((s, i) => {
          const isHover = hover === s.party;
          return (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={0.028}
              fill={s.color}
              opacity={hover && !isHover ? 0.25 : 1}
              stroke="#fff"
              strokeWidth={0.004}
              onMouseEnter={() => setHover(s.party)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer", transition: "opacity 200ms" }}
            />
          );
        })}
        {/* 中央 - 議長位置標記 */}
        <text
          x="0"
          y="-0.05"
          textAnchor="middle"
          fontSize="0.08"
          className="font-serif"
          fill="#333"
        >
          {totalSeats} 席
        </text>
      </svg>

      {/* Legend / 互動 hover 標示 */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        {parties.map((p) => {
          const isHover = hover === p.name;
          const color = p.color_hex || partyColor(p.name);
          return (
            <button
              key={p.name}
              onMouseEnter={() => setHover(p.name)}
              onMouseLeave={() => setHover(null)}
              className="flex items-baseline gap-2 hover:opacity-100"
              style={{ opacity: hover && !isHover ? 0.4 : 1, transition: "opacity 200ms" }}
            >
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ background: color }}
              />
              <span className="font-medium">{p.name}</span>
              <span className="text-ink-soft tabular-nums">{p.total} 席</span>
            </button>
          );
        })}
      </div>
      {hover && (
        <p className="mt-3 text-center text-sm text-ink-soft">
          滑鼠移開可看全部
        </p>
      )}
    </div>
  );
}

/**
 * 計算 hemicycle 中每個座位的 (x, y) 座標。
 *
 * 策略：
 * 1. 半圓由多個同心半弧組成（從內到外）
 * 2. 每弧分配的席次數大致正比於弧長
 * 3. 從左 (180°) 到右 (0°) 依政黨順序填入席次
 */
function computeSeatPositions(
  parties: LegislaturePartyTotal[],
  totalSeats: number,
): SeatPos[] {
  // 1) 決定列數
  const rows = chooseRowCount(totalSeats);

  // 2) 各列半徑（內到外）
  const innerR = 0.4;
  const outerR = 1.0;
  const radii: number[] = [];
  for (let i = 0; i < rows; i++) {
    const t = rows === 1 ? 0.5 : i / (rows - 1);
    radii.push(innerR + (outerR - innerR) * t);
  }

  // 3) 各列分配席次（半圓周長正比）
  const totalArc = radii.reduce((a, b) => a + b * Math.PI, 0);
  const rowSeats: number[] = radii.map((r) =>
    Math.max(1, Math.round((r * Math.PI * totalSeats) / totalArc)),
  );

  // 修正使總和 = totalSeats
  let diff = totalSeats - rowSeats.reduce((a, b) => a + b, 0);
  let idx = rowSeats.length - 1;
  while (diff !== 0) {
    rowSeats[idx] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
    idx = (idx - 1 + rowSeats.length) % rowSeats.length;
  }

  // 4) 計算所有座位 (x, y)，按角度從 π (左) 到 0 (右) 排序
  const allPositions: { x: number; y: number; angle: number; row: number }[] = [];
  for (let r = 0; r < rows; r++) {
    const seatsInRow = rowSeats[r];
    const radius = radii[r];
    for (let s = 0; s < seatsInRow; s++) {
      // π 到 0
      const angle = Math.PI - (s + 0.5) * (Math.PI / seatsInRow);
      const x = Math.cos(angle) * radius;
      const y = -Math.sin(angle) * radius;
      allPositions.push({ x, y, angle, row: r });
    }
  }

  // 按角度排序（從左 π → 右 0），同角度按 row（外→內）
  allPositions.sort((a, b) => {
    if (Math.abs(a.angle - b.angle) > 0.001) return b.angle - a.angle;
    return a.row - b.row;
  });

  // 5) 依政黨順序填入
  const seats: SeatPos[] = [];
  let i = 0;
  for (const party of parties) {
    const color = party.color_hex || partyColor(party.name);
    for (let j = 0; j < party.total && i < allPositions.length; j++, i++) {
      seats.push({
        x: allPositions[i].x,
        y: allPositions[i].y,
        party: party.name,
        color,
      });
    }
  }
  return seats;
}

function chooseRowCount(totalSeats: number): number {
  if (totalSeats <= 30) return 3;
  if (totalSeats <= 60) return 4;
  if (totalSeats <= 80) return 5;
  if (totalSeats <= 113) return 7;
  return 8;
}
