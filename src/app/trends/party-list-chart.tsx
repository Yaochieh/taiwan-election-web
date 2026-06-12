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
import type { PartyListTrend } from "@/lib/types";
import { partyColor } from "@/lib/format";

interface ChartRow {
  year: string;
  [party: string]: string | number;
}

export function PartyListChart({ data }: { data: PartyListTrend[] }) {
  // 計算每年總票數
  const yearTotals = new Map<string, number>();
  for (const r of data) {
    const year = r.date.slice(0, 4);
    yearTotals.set(year, (yearTotals.get(year) || 0) + r.votes);
  }

  // 篩選政黨：只取曾過門檻（elected=1）的政黨
  const qualifiedParties = new Set(
    data.filter((r) => r.elected === 1).map((r) => r.party_name),
  );

  const byYear = new Map<string, ChartRow>();
  for (const r of data) {
    if (!qualifiedParties.has(r.party_name)) continue;
    const year = r.date.slice(0, 4);
    const total = yearTotals.get(year) || 1;
    if (!byYear.has(year)) byYear.set(year, { year });
    const row = byYear.get(year)!;
    row[r.party_name] = (r.votes / total) * 100;
  }

  const chartData = Array.from(byYear.values()).sort((a, b) =>
    a.year.localeCompare(b.year),
  );

  const parties = Array.from(qualifiedParties).sort((a, b) => {
    // DPP/KMT 排前面
    const major = ["民主進步黨", "中國國民黨"];
    const ai = major.indexOf(a);
    const bi = major.indexOf(b);
    if (ai !== -1 && bi === -1) return -1;
    if (bi !== -1 && ai === -1) return 1;
    if (ai !== -1 && bi !== -1) return ai - bi;
    return 0;
  });

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
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-ink-soft mt-3 text-center">
        歷屆有達門檻或當選政黨之政黨票得票率
      </p>
    </div>
  );
}
