"use client";

import { useState } from "react";
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
import type { PlatformTarget, ProgressSource } from "@/lib/types";

const CATEGORY_COLOR: Record<string, string> = {
  住宅: "#1F77B4",
  都市更新: "#FF7F0E",
  幼兒托育: "#2CA02C",
  長照: "#D62728",
  交通: "#9467BD",
  社福: "#E377C2",
  經濟: "#8C564B",
  環境: "#17BECF",
  教育: "#BCBD22",
};

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  in_progress: { text: "進行中", cls: "border border-rule text-ink-soft" },
  achieved: { text: "★ 已達成", cls: "bg-accent-red text-paper" },
  failed: { text: "✗ 未達成", cls: "bg-ink text-paper" },
  unknown: { text: "資料不足", cls: "border border-rule text-ink-soft" },
};

const AUTH_LABEL: Record<number, { label: string; cls: string }> = {
  1: { label: "官方", cls: "bg-accent-red text-paper" },
  2: { label: "監督", cls: "border border-accent-red text-accent-red" },
  3: { label: "媒體", cls: "border border-rule text-ink-soft" },
  4: { label: "評論", cls: "border border-rule text-ink-soft" },
  5: { label: "個人", cls: "border border-rule text-ink-soft" },
};

function formatNumber(n: number | null, unit: string | null): string {
  if (n == null) return "—";
  if (unit === "%") return `${n}%`;
  return new Intl.NumberFormat("zh-TW").format(n) + " " + (unit || "");
}

export function TargetCard({ target }: { target: PlatformTarget }) {
  const color = (target.category && CATEGORY_COLOR[target.category]) || "#444";
  const status = STATUS_LABEL[target.status] || STATUS_LABEL.in_progress;
  const hasChildren = target.children && target.children.length > 0;

  return (
    <article className="border border-rule bg-paper">
      {/* Header */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
          {target.category && (
            <span
              className="text-xs font-medium px-2 py-0.5 border"
              style={{ color, borderColor: color }}
            >
              {target.category}
            </span>
          )}
          {/* tense chip */}
          {target.tense === "past" && (
            <span className="text-xs px-2 py-0.5 bg-rule/40 text-ink">
              📜 政績
            </span>
          )}
          {target.tense === "future" && (
            <span className="text-xs px-2 py-0.5 bg-accent-red/15 text-accent-red border border-accent-red/30">
              🎯 承諾
            </span>
          )}
          {/* verification chip */}
          {target.verification_status === "pending" && (
            <span className="text-xs px-2 py-0.5 bg-paper border border-rule text-ink-soft">
              ❓ 待考證
            </span>
          )}
          {target.verification_status === "verified" && (
            <span className="text-xs px-2 py-0.5 bg-paper border border-green-600 text-green-700">
              ✓ 已查證
            </span>
          )}
          {target.verification_status === "disputed" && (
            <span className="text-xs px-2 py-0.5 bg-paper border border-amber-600 text-amber-700">
              ⚠ 與公開資料矛盾
            </span>
          )}
          {target.verification_status === "not_executed" && (
            <span className="text-xs px-2 py-0.5 bg-paper border border-ink-soft/40 text-ink-soft">
              ✗ 未當選·未執行
            </span>
          )}
          {target.verification_status === "in_office" && (
            <span className="text-xs px-2 py-0.5 bg-paper border border-accent-red/40 text-accent-red">
              ● 當選·可追蹤
            </span>
          )}
          {target.verification_status === "self_claim" && (
            <span className="text-xs px-2 py-0.5 bg-paper border border-ink-soft/40 text-ink-soft">
              ⚐ 自我宣稱·未查證
            </span>
          )}
          <h3 className="font-serif text-xl font-bold flex-1">
            {target.title}
          </h3>
          <span className={"text-xs px-2 py-0.5 " + status.cls}>
            {status.text}
          </span>
        </div>
        {target.description && (
          <p className="text-sm text-ink-soft mb-4 leading-relaxed">
            {target.description}
          </p>
        )}
      </div>

      {/* 子目標（細分指標）*/}
      {hasChildren && (
        <div className="border-t border-rule bg-rule/20 p-4 sm:p-6 space-y-5">
          <h4 className="text-xs uppercase tracking-widest text-ink-soft">
            細分指標
          </h4>
          {target.children.map((c) => (
            <SubMetric key={c.target_id} target={c} color={color} />
          ))}
        </div>
      )}

      {/* 自己有進度資料時也顯示 */}
      {!hasChildren && target.progress.length > 0 && (
        <div className="border-t border-rule p-4 sm:p-6">
          <SubMetric target={target} color={color} compact />
        </div>
      )}

      {/* 政見原文連結 */}
      {target.source_url && (
        <div className="border-t border-rule px-5 sm:px-6 py-3 text-xs text-ink-soft">
          📎 政見原文：
          <a
            href={target.source_url}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-accent-red break-all"
          >
            {target.source_url}
          </a>
        </div>
      )}

      {/* 考證資訊 */}
      {target.tense === "past" && target.verification_status === "verified" && target.verification_source && (
        <div className="border-t border-rule px-5 sm:px-6 py-3 text-xs text-green-700 bg-green-50/40">
          ✓ 查證來源：
          <a
            href={target.verification_source}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-green-800 break-all"
          >
            {target.verification_source}
          </a>
          {target.verification_note && (
            <p className="mt-1 text-ink">{target.verification_note}</p>
          )}
        </div>
      )}
      {/* 其他狀態的說明文字 */}
      {target.verification_note &&
        target.verification_status !== "verified" && (
          <div className="border-t border-rule px-5 sm:px-6 py-3 text-xs text-ink-soft">
            {target.verification_status === "not_executed" && "✗ "}
            {target.verification_status === "in_office" && "● "}
            {target.verification_status === "self_claim" && "⚐ "}
            {target.verification_status === "pending" && "❓ "}
            {target.verification_note}
          </div>
        )}
    </article>
  );
}

function SubMetric({
  target,
  color,
  compact,
}: {
  target: PlatformTarget;
  color: string;
  compact?: boolean;
}) {
  const pct = target.progress_pct ?? 0;
  const subStatus = STATUS_LABEL[target.status] || STATUS_LABEL.in_progress;
  const hasProgress = target.progress.length > 0;
  const chartData = [
    target.baseline_value !== null && target.baseline_date
      ? {
          date: target.baseline_date,
          value: target.baseline_value,
          label: "基準",
        }
      : null,
    ...target.progress.map((p) => ({
      date: p.recorded_at,
      value: p.current_value,
      label: p.note || "",
    })),
  ].filter(Boolean) as { date: string; value: number | null; label: string }[];

  return (
    <div className={compact ? "" : "border border-rule bg-paper p-4"}>
      {!compact && (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-2">
          <h5 className="font-medium">{target.title}</h5>
          {target.status !== "in_progress" && (
            <span className={"text-xs px-2 py-0.5 " + subStatus.cls}>
              {subStatus.text}
            </span>
          )}
        </div>
      )}

      {/* 進度條 */}
      <div className="mb-3">
        <div className="flex justify-between items-baseline mb-1 text-sm">
          <span className="font-medium">
            最新：{formatNumber(target.latest_value, target.metric_unit)}
            <span className="text-ink-soft ml-2 text-xs">
              ({pct.toFixed(1)}%)
            </span>
          </span>
          <span className="text-ink-soft text-xs">
            目標 {formatNumber(target.target_value, target.metric_unit)}
          </span>
        </div>
        <div className="w-full bg-rule h-2 overflow-hidden">
          <div
            className="h-2 transition-all"
            style={{
              width: `${Math.min(100, pct)}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <div className="flex justify-between items-baseline mt-1 text-[10px] text-ink-soft">
          <span>
            基準 {formatNumber(target.baseline_value, target.metric_unit)}（
            {target.baseline_date}）
          </span>
          <span>截止 {target.target_date}</span>
        </div>
      </div>

      {/* 折線圖 */}
      {chartData.length > 2 && (
        <div className="h-32 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#444", fontSize: 10 }}
                stroke="#888"
                tickFormatter={(d: string) => (d ? d.slice(2, 7) : "")}
              />
              <YAxis tick={{ fill: "#444", fontSize: 10 }} stroke="#888" />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: 0,
                  fontSize: 11,
                }}
                formatter={(v) =>
                  typeof v === "number"
                    ? formatNumber(v, target.metric_unit)
                    : v
                }
              />
              {target.target_value !== null && (
                <ReferenceLine
                  y={target.target_value}
                  stroke={color}
                  strokeDasharray="3 3"
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3, fill: color }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 進度紀錄 (展開) */}
      {hasProgress && (
        <details className="text-xs group">
          <summary className="cursor-pointer hover:text-accent-red list-none flex items-baseline gap-2 text-ink-soft">
            <span className="transition-transform group-open:rotate-90">›</span>
            <span>展開進度紀錄與來源（{target.progress.length} 筆）</span>
          </summary>
          <ul className="mt-2 space-y-3 pl-3 border-l border-rule">
            {target.progress.map((p, i) => (
              <li key={i}>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="tabular-nums font-medium">
                    {p.recorded_at}
                  </span>
                  <span className="text-ink-soft">
                    {formatNumber(p.current_value, target.metric_unit)}
                  </span>
                </div>
                {p.note && (
                  <p className="mt-0.5 text-ink-soft leading-relaxed">
                    {p.note}
                  </p>
                )}
                {p.sources && p.sources.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {p.sources.map((s, j) => (
                      <SourceChip key={j} src={s} />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function SourceChip({ src }: { src: ProgressSource }) {
  const auth = AUTH_LABEL[src.authority_level ?? 5] || AUTH_LABEL[5];
  const content = (
    <>
      <span className={"text-[9px] px-1 mr-1 " + auth.cls}>{auth.label}</span>
      <span>{src.publisher || "未指定"}</span>
    </>
  );
  if (src.url) {
    return (
      <a
        href={src.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center px-2 py-0.5 border border-rule hover:border-ink transition text-[11px]"
        title={src.url}
      >
        {content}
      </a>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 border border-rule text-[11px]">
      {content}
    </span>
  );
}
