"use client";

import { useState } from "react";
import Link from "next/link";
import type { LegislatorMember, LegislaturePartyTotal } from "@/lib/types";
import { partyColor, cleanDistrict } from "@/lib/format";

// 2024 第 11 屆立委 election_id
const REGIONAL_ELECTION_ID = 51;
const LOWLAND_ELECTION_ID = 53;
const HIGHLAND_ELECTION_ID = 52;
const PARTY_LIST_ELECTION_ID = 50;

const KIND_LABELS: Record<string, string> = {
  regional: "區域",
  highland: "山地原住民",
  lowland: "平地原住民",
  party_list: "不分區",
};

const KIND_FILTERS = [
  { value: "all", label: "全部" },
  { value: "regional", label: "區域立委" },
  { value: "aboriginal", label: "原住民立委" },
  { value: "party_list", label: "不分區" },
];

export function LegislatorList({
  members,
  parties,
}: {
  members: LegislatorMember[];
  parties: LegislaturePartyTotal[];
}) {
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");

  const filtered = members.filter((m) => {
    if (partyFilter !== "all" && m.party !== partyFilter) return false;
    if (kindFilter === "regional" && m.kind !== "regional") return false;
    if (
      kindFilter === "aboriginal" &&
      m.kind !== "highland" &&
      m.kind !== "lowland"
    )
      return false;
    if (kindFilter === "party_list" && m.kind !== "party_list") return false;
    return true;
  });

  // 排序：政黨名為主、再選區
  filtered.sort((a, b) => {
    if (a.party !== b.party) return a.party.localeCompare(b.party);
    if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
    return a.district.localeCompare(b.district);
  });

  return (
    <div>
      {/* ── 篩選 ── */}
      <div className="grid sm:grid-cols-2 gap-6 pb-6 border-b border-rule mb-6">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
            類別
          </p>
          <div className="flex flex-wrap gap-2">
            {KIND_FILTERS.map((k) => (
              <button
                key={k.value}
                onClick={() => setKindFilter(k.value)}
                className={
                  "px-3 py-1.5 text-sm border transition " +
                  (k.value === kindFilter
                    ? "bg-ink text-paper border-ink"
                    : "border-rule text-ink-soft hover:border-ink hover:text-ink")
                }
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
            政黨
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPartyFilter("all")}
              className={
                "px-3 py-1.5 text-sm border transition " +
                ("all" === partyFilter
                  ? "bg-ink text-paper border-ink"
                  : "border-rule text-ink-soft hover:border-ink hover:text-ink")
              }
            >
              全部
            </button>
            {parties.map((p) => (
              <button
                key={p.name}
                onClick={() => setPartyFilter(p.name)}
                className={
                  "px-3 py-1.5 text-sm border transition " +
                  (p.name === partyFilter
                    ? "bg-ink text-paper border-ink"
                    : "border-rule text-ink-soft hover:border-ink hover:text-ink")
                }
              >
                {p.name}（{p.total}）
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 表 ── */}
      <p className="text-sm text-ink-soft mb-3">共 {filtered.length} 位</p>
      <div className="border-t-2 border-ink">
        {filtered.map((m, i) => {
          const districtLabel = cleanDistrict(m.district) || m.district;
          const color = m.color_hex || partyColor(m.party);
          const isPartyList = m.kind === "party_list";

          // 對應到政見頁面的連結
          let platformHref: string | null = null;
          if (m.kind === "regional") {
            platformHref = `/platforms?election=${REGIONAL_ELECTION_ID}&district=${encodeURIComponent(m.district)}`;
          } else if (m.kind === "highland") {
            platformHref = `/platforms?election=${HIGHLAND_ELECTION_ID}`;
          } else if (m.kind === "lowland") {
            platformHref = `/platforms?election=${LOWLAND_ELECTION_ID}`;
          } else if (m.kind === "party_list") {
            platformHref = `/platforms?election=${PARTY_LIST_ELECTION_ID}`;
          }

          const RowInner = (
            <>
              <div className="col-span-5 sm:col-span-4">
                <span className="font-medium" style={{ color }}>
                  {isPartyList ? m.party : m.candidate}
                </span>
                {isPartyList && (
                  <span className="ml-1 text-xs text-ink-soft">
                    {m.candidate}
                  </span>
                )}
              </div>
              <div className="col-span-3 sm:col-span-3 text-sm text-ink-soft">
                {m.party}
              </div>
              <div className="col-span-4 sm:col-span-3 text-sm text-ink-soft">
                {KIND_LABELS[m.kind] || m.kind}
              </div>
              <div className="col-span-12 sm:col-span-2 text-sm text-ink-soft sm:text-right">
                {!isPartyList && districtLabel}
              </div>
            </>
          );

          if (platformHref && !isPartyList) {
            return (
              <Link
                key={`${m.candidate}-${m.district}-${i}`}
                href={platformHref}
                className="grid grid-cols-12 gap-2 py-3 px-2 -mx-2 border-b border-rule items-baseline hover:bg-rule/30 transition"
                title={`點擊查看 ${m.candidate} 的政見`}
              >
                {RowInner}
              </Link>
            );
          }
          return (
            <article
              key={`${m.candidate}-${m.district}-${i}`}
              className="grid grid-cols-12 gap-2 py-3 border-b border-rule items-baseline"
            >
              {RowInner}
            </article>
          );
        })}
      </div>
    </div>
  );
}
