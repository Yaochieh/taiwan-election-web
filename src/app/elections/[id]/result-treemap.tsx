"use client";

import { useEffect, useState } from "react";
import { Treemap, ResponsiveContainer } from "recharts";
import type { ElectionResult } from "@/lib/types";
import { partyColor, formatVotes } from "@/lib/format";

type Pair = {
  primary: ElectionResult;
  running?: ElectionResult;
};

interface Props {
  items: Pair[];
  total: number;
  isPresident: boolean;
}

interface Node {
  name: string;
  size: number;
  fill: string;
  pct: number;
  votes: number;
  subName?: string;
  elected: boolean;
  [k: string]: string | number | boolean | undefined;
}

interface TreemapPayload extends Node {
  x: number;
  y: number;
  width: number;
  height: number;
}

function TreemapCell(props: unknown) {
  const p = props as TreemapPayload;
  if (!p.width || p.width < 1 || !p.height || p.height < 1) return null;

  const showFull = p.width > 90 && p.height > 60;
  const showCompact = p.width > 50 && p.height > 38;
  const showMicro = p.width > 28 && p.height > 18;

  return (
    <g>
      <rect
        x={p.x}
        y={p.y}
        width={p.width}
        height={p.height}
        fill={p.fill}
        stroke="#fff"
        strokeWidth={2}
        opacity={p.elected ? 1 : 0.78}
      />
      {p.elected && (
        <rect
          x={p.x + 2}
          y={p.y + 2}
          width={p.width - 4}
          height={p.height - 4}
          fill="none"
          stroke="#fff"
          strokeWidth={1.5}
          strokeDasharray="3 2"
        />
      )}
      {showFull ? (
        <>
          <text
            x={p.x + 10}
            y={p.y + 22}
            fill="#fff"
            fontSize={15}
            fontWeight={700}
            style={{ fontFamily: "var(--font-serif, serif)" }}
          >
            {p.name}
            {p.elected && " ★"}
          </text>
          {p.subName && (
            <text
              x={p.x + 10}
              y={p.y + 40}
              fill="#fff"
              fontSize={11}
              opacity={0.85}
            >
              ／{p.subName}
            </text>
          )}
          <text
            x={p.x + 10}
            y={p.y + p.height - 22}
            fill="#fff"
            fontSize={20}
            fontWeight={800}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {p.pct.toFixed(2)}%
          </text>
          <text
            x={p.x + 10}
            y={p.y + p.height - 8}
            fill="#fff"
            fontSize={10}
            opacity={0.85}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatVotes(p.votes)} 票
          </text>
        </>
      ) : showCompact ? (
        <>
          <text
            x={p.x + 6}
            y={p.y + 18}
            fill="#fff"
            fontSize={12}
            fontWeight={700}
          >
            {p.name}
            {p.elected && " ★"}
          </text>
          <text
            x={p.x + 6}
            y={p.y + p.height - 6}
            fill="#fff"
            fontSize={13}
            fontWeight={700}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {p.pct.toFixed(1)}%
          </text>
        </>
      ) : showMicro ? (
        <text
          x={p.x + p.width / 2}
          y={p.y + p.height / 2 + 3}
          fill="#fff"
          fontSize={10}
          fontWeight={700}
          textAnchor="middle"
        >
          {p.pct.toFixed(0)}%
        </text>
      ) : null}
    </g>
  );
}

export function ResultTreemap({ items, total, isPresident }: Props) {
  // mount guard：避免 SSR 渲染 recharts，因為 ResponsiveContainer 在 server
  // 拿不到尺寸（width=-1）會導致水合不一致而報錯。
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data: Node[] = items.map((it) => {
    const r = it.primary;
    const pct = total > 0 ? (r.votes / total) * 100 : 0;
    return {
      name: r.candidate_name,
      subName: it.running?.candidate_name,
      size: r.votes,
      fill: partyColor(r.party_name, r.color_hex),
      pct,
      votes: r.votes,
      elected: r.elected === 1,
    };
  });

  if (data.length === 0) return null;

  const height = isPresident ? 320 : 260;

  if (!mounted) {
    return (
      <div
        className="border border-rule flex items-center justify-center text-ink-soft text-sm"
        style={{ height }}
      >
        圖表載入中…
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          isAnimationActive={false}
          content={<TreemapCell />}
        />
      </ResponsiveContainer>
    </div>
  );
}
