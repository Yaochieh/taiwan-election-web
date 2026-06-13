"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { PlatformTarget } from "@/lib/types";

const CATEGORY_COLOR: Record<string, string> = {
  住宅: "#1F77B4",
  都市更新: "#FF7F0E",
  幼兒托育: "#2CA02C",
  交通: "#9467BD",
  社福: "#E377C2",
  經濟: "#8C564B",
  環境: "#17BECF",
  教育: "#BCBD22",
};

export function TargetCard({ target }: { target: PlatformTarget }) {
  const color = (target.category && CATEGORY_COLOR[target.category]) || "#444";
  const pct = target.progress_pct ?? 0;
  const isAchieved = target.status === "achieved" || pct >= 100;

  // 製作折線圖資料
  const chartData = [
    {
      date: target.baseline_date,
      value: target.baseline_value,
      label: "基準",
    },
    ...target.progress.map((p) => ({
      date: p.recorded_at,
      value: p.current_value,
      label: p.note || "",
    })),
  ];

  const formatNumber = (n: number | null) => {
    if (n == null) return "—";
    if (target.metric_unit === "%") return `${n}%`;
    return new Intl.NumberFormat("zh-TW").format(n) + " " + (target.metric_unit || "");
  };

  return (
    <article className="border border-rule p-5 sm:p-6 bg-paper">
      {/* Header */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
        <span
          className="text-xs font-medium px-2 py-0.5 border"
          style={{ color, borderColor: color }}
        >
          {target.category}
        </span>
        <h3 className="font-serif text-xl font-bold flex-1">{target.title}</h3>
        {isAchieved && (
          <span className="text-xs px-2 py-0.5 bg-accent-red text-paper">
            ★ 已達成
          </span>
        )}
      </div>
      {target.description && (
        <p className="text-sm text-ink-soft mb-4 leading-relaxed">
          {target.description}
        </p>
      )}

      {/* 進度條 */}
      <div className="mb-5">
        <div className="flex justify-between items-baseline mb-1.5 text-sm">
          <span className="font-medium">
            最新：{formatNumber(target.latest_value)}
            <span className="text-ink-soft ml-2">
              ({pct.toFixed(1)}%)
            </span>
          </span>
          <span className="text-ink-soft">
            目標 {formatNumber(target.target_value)}
          </span>
        </div>
        <div className="w-full bg-rule h-3 overflow-hidden">
          <div
            className="h-3 transition-all"
            style={{
              width: `${Math.min(100, pct)}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <div className="flex justify-between items-baseline mt-1 text-xs text-ink-soft">
          <span>
            基準 {formatNumber(target.baseline_value)} ({target.baseline_date})
          </span>
          <span>截止 {target.target_date}</span>
        </div>
      </div>

      {/* 趨勢圖 */}
      {chartData.length > 2 && (
        <div className="h-40 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#444", fontSize: 11 }}
                stroke="#888"
                tickFormatter={(d: string) => (d ? d.slice(2, 7) : "")}
              />
              <YAxis tick={{ fill: "#444", fontSize: 11 }} stroke="#888" />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: 0,
                  fontSize: 12,
                }}
                formatter={(v) => (typeof v === "number" ? formatNumber(v) : v)}
              />
              {target.target_value !== null && (
                <ReferenceLine
                  y={target.target_value}
                  stroke={color}
                  strokeDasharray="3 3"
                  label={{
                    value: "目標",
                    position: "right",
                    fill: color,
                    fontSize: 10,
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 4, fill: color }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 來源與進度紀錄 */}
      <details className="text-sm group">
        <summary className="cursor-pointer hover:text-accent-red list-none flex items-baseline gap-2 text-ink-soft">
          <span className="transition-transform group-open:rotate-90">›</span>
          <span>進度紀錄（{target.progress.length} 筆）與資料來源</span>
        </summary>
        <ul className="mt-3 space-y-2 pl-4 border-l border-rule text-xs">
          {target.progress.map((p, i) => (
            <li key={i}>
              <span className="tabular-nums">{p.recorded_at}</span>：
              {formatNumber(p.current_value)}
              {p.note && (
                <span className="ml-1 text-ink-soft">— {p.note}</span>
              )}
              {p.source_url && (
                <a
                  href={p.source_url}
                  className="ml-1 underline underline-offset-2 hover:text-accent-red"
                  target="_blank"
                  rel="noreferrer"
                >
                  來源
                </a>
              )}
            </li>
          ))}
          {target.source_url && (
            <li className="pt-2 border-t border-rule">
              📎 政見原文：
              <a
                href={target.source_url}
                className="underline underline-offset-2 hover:text-accent-red"
                target="_blank"
                rel="noreferrer"
              >
                {target.source_url}
              </a>
            </li>
          )}
        </ul>
      </details>
    </article>
  );
}
