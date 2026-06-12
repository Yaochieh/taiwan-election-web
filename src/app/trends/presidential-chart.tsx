"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PresidentialTrend } from "@/lib/types";
import { partyColor, formatVotes } from "@/lib/format";

interface ChartRow {
  year: string;
  [party: string]: string | number;
}

export function PresidentialChart({ data }: { data: PresidentialTrend[] }) {
  // 按年份計算各黨得票率
  const byYear = new Map<string, ChartRow>();
  const yearTotals = new Map<string, number>();

  for (const r of data) {
    const year = r.date.slice(0, 4);
    yearTotals.set(year, (yearTotals.get(year) || 0) + r.votes);
  }

  for (const r of data) {
    const year = r.date.slice(0, 4);
    const total = yearTotals.get(year) || 1;
    const party = r.party_name || "其他";
    if (!byYear.has(year)) byYear.set(year, { year });
    const row = byYear.get(year)!;
    row[party] = ((r.votes / total) * 100);
  }

  const chartData = Array.from(byYear.values()).sort((a, b) =>
    a.year.localeCompare(b.year),
  );

  // 找有出現過的政黨（並過濾 < 1% 總出現的）
  const parties = Array.from(
    new Set(data.map((r) => r.party_name || "其他")),
  ).filter((p) => p !== "其他");

  return (
    <div className="border border-rule p-4 sm:p-6 bg-paper">
      <div className="h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis
              dataKey="year"
              tick={{ fill: "#444", fontSize: 12 }}
              stroke="#888"
            />
            <YAxis
              tick={{ fill: "#444", fontSize: 12 }}
              stroke="#888"
              unit="%"
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: 0,
                fontSize: 13,
              }}
              formatter={(value) =>
                typeof value === "number" ? `${value.toFixed(2)}%` : String(value)
              }
            />
            <Legend
              wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
              iconType="line"
            />
            {parties.map((party) => (
              <Line
                key={party}
                type="monotone"
                dataKey={party}
                name={party}
                stroke={partyColor(party)}
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-ink-soft mt-3 text-center">
        各年份各正總統候選人得票率（不含副總統重複計）
      </p>
    </div>
  );
}
