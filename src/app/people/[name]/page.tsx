import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPersonProfile,
  candidatePhotoUrl,
  getPersonTargets,
} from "@/lib/api";
import {
  cleanDistrict,
  formatElectionLabelShort,
  formatVotes,
  partyColor,
} from "@/lib/format";
import { TargetCard } from "@/components/target-card";
import { PartyLink } from "@/components/entity-links";

// 政見追蹤更新頻率較高，5 分鐘快取
export const revalidate = 300;

const TYPE_ZH: Record<string, string> = {
  presidential: "總統",
  legislative: "立委",
  mayoral: "縣市長",
  council: "議員",
};

export default async function PersonPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: encodedName } = await params;
  const name = decodeURIComponent(encodedName);

  const [profile, targets] = await Promise.all([
    getPersonProfile(name).catch(() => null),
    getPersonTargets(name).catch(() => []),
  ]);
  if (!profile) notFound();

  const photoUrl = candidatePhotoUrl(profile.photo_path);
  const latestRace = profile.races[0];
  const winRate = (profile.win_rate * 100).toFixed(0);

  // 現任政黨色作為強調色
  const latestParty = profile.party_history[profile.party_history.length - 1];
  const accent = latestParty
    ? partyColor(latestParty.party, latestParty.color_hex)
    : "#1a1a1a";
  const isCurrentlyElected = profile.races.some((r) => {
    if (r.elected !== 1) return false;
    const year = parseInt(r.election_date.slice(0, 4));
    if (r.election_type === "presidential")
      return year >= new Date().getFullYear() - 4;
    if (r.election_type === "mayoral")
      return year >= new Date().getFullYear() - 4;
    if (r.election_type === "legislative")
      return year >= new Date().getFullYear() - 4;
    return false;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <header
        className="border-t-4 pb-8 mb-10 pt-6"
        style={{ borderTopColor: accent }}
      >
        <div className="text-sm text-ink-soft mb-4">
          <Link href="/people" className="hover:text-ink">
            ← 政治人物
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={`${name} 大頭照`}
              className="w-32 h-40 object-cover border-2 shrink-0"
              style={{ borderColor: accent }}
            />
          ) : (
            <div
              className="w-32 h-40 border-2 flex items-center justify-center shrink-0"
              style={{
                borderColor: accent,
                backgroundColor: `${accent}10`,
              }}
            >
              <span
                className="font-serif text-6xl"
                style={{ color: accent }}
              >
                {name.slice(0, 1)}
              </span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-2 flex-wrap">
              <p className="text-xs tracking-[0.2em] uppercase text-ink-soft">
                PERSON
              </p>
              {isCurrentlyElected && (
                <span
                  className="text-[10px] px-2 py-0.5 text-paper font-bold tracking-wider"
                  style={{ backgroundColor: accent }}
                >
                  ★ 現任
                </span>
              )}
            </div>
            <h1
              className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight mb-3"
              style={{ color: accent }}
            >
              {name}
            </h1>
            {latestRace && (
              <p className="mb-4 text-sm text-ink-soft">
                最新身份：
                {formatElectionLabelShort(
                  latestRace.election_date,
                  latestRace.election_name,
                )}{" "}
                · {latestRace.party_name || "無黨籍"}
                {latestRace.elected === 1 && (
                  <span className="ml-2 text-accent-red font-bold">★</span>
                )}
              </p>
            )}
            <div className="grid grid-cols-3 gap-3 max-w-md">
              <Stat label="參選次數" value={profile.total_races} />
              <Stat
                label="當選次數"
                value={profile.total_wins}
                accent="text-accent-red"
              />
              <Stat label="勝選率" value={`${winRate}%`} />
            </div>
          </div>
        </div>
      </header>

      {/* ── 政黨歷程（時間軸）── */}
      {profile.party_history.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-4">政黨歷程</h2>
          <div className="relative ml-2">
            {/* 垂直線 */}
            <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-rule" />
            <ol className="space-y-4">
              {profile.party_history.map((p, i) => {
                const c = p.color_hex || partyColor(p.party);
                return (
                  <li key={i} className="relative pl-7">
                    <span
                      className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-paper"
                      style={{ backgroundColor: c }}
                    />
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-xs text-ink-soft tabular-nums w-12 shrink-0">
                        {p.from_date.slice(0, 4)}
                      </span>
                      <Link
                        href={`/parties/${encodeURIComponent(p.party)}`}
                        className="font-medium text-base hover:underline underline-offset-2"
                        style={{ color: c }}
                      >
                        {p.party}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* ── 政見追蹤 ── */}
      {targets.length > 0 && (
        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-4 gap-4">
            <h2 className="font-serif text-2xl font-bold">政見追蹤</h2>
            <span className="text-xs text-ink-soft px-2 py-1 border border-accent-red text-accent-red">
              BETA · 資料為示範性質
            </span>
          </div>
          <p className="text-sm text-ink-soft mb-6 leading-relaxed max-w-3xl">
            記錄候選人競選承諾的可量化指標、上任時數值、以及任期內的進度變化。
            <strong>本頁數據為示範用途，數值僅供參考</strong>；
            歡迎協助提供官方資料來源連結與校正。
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {targets.map((t) => (
              <TargetCard key={t.target_id} target={t} />
            ))}
          </div>
        </section>
      )}

      {/* ── 學經歷（分學歷 / 經歷顯示） ── */}
      {profile.background && (() => {
        // 解析 background：可能有「【學歷】...」「【經歷】...」結構
        const text = profile.background;
        let edu = "";
        let exp = "";
        const eduMatch = text.match(/【學歷】\s*([\s\S]*?)(?=【經歷】|$)/);
        const expMatch = text.match(/【經歷】\s*([\s\S]*?)$/);
        if (eduMatch) edu = eduMatch[1].trim();
        if (expMatch) exp = expMatch[1].trim();
        // 沒有【】tag → 全部視為「經歷」
        if (!edu && !exp) exp = text.trim();
        const Block = ({ label, content }: { label: string; content: string }) =>
          content ? (
            <div>
              <p className="text-xs tracking-widest uppercase text-ink-soft mb-1.5">
                {label}
              </p>
              <ul className="text-sm leading-relaxed space-y-1">
                {content
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-ink-soft shrink-0">·</span>
                      <span>{line}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null;
        return (
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-4">學歷與經歷</h2>
            <div className="border border-rule p-5 grid sm:grid-cols-2 gap-6">
              <Block label="學歷" content={edu} />
              <Block label="經歷" content={exp} />
            </div>
          </section>
        );
      })()}

      {/* ── 歷次參選紀錄 ── */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-bold mb-4">歷次參選紀錄</h2>
        <div className="border-t-2 border-ink">
          {profile.races.map((r, i) => {
            const districtLabel = cleanDistrict(r.district) || r.district || "";
            const color = partyColor(r.party_name, r.color_hex);
            const elected = r.elected === 1;
            return (
              <article
                key={`${r.election_id}-${i}`}
                className="grid grid-cols-12 gap-3 py-4 border-b border-rule items-baseline"
              >
                <div className="col-span-3 sm:col-span-2 font-serif text-xl tabular-nums">
                  {r.election_date.slice(0, 4)}
                </div>
                <div className="col-span-9 sm:col-span-5">
                  <Link
                    href={`/elections/${r.election_id}`}
                    className="hover:underline underline-offset-4 font-medium"
                  >
                    {TYPE_ZH[r.election_type] || r.election_type}
                    {r.election_description && (
                      <span className="ml-1 text-ink-soft text-xs">
                        ({r.election_description})
                      </span>
                    )}
                  </Link>
                  {districtLabel && (
                    <div className="text-sm text-ink-soft mt-0.5">
                      {districtLabel}
                    </div>
                  )}
                  {r.background &&
                    (r.background.includes("罷免") ||
                      r.background.includes("辭職") ||
                      r.background.includes("撤銷") ||
                      r.background.includes("解職") ||
                      r.background.includes("判刑")) && (
                      <div className="text-xs text-accent-red mt-1">
                        ⚠ {r.background}
                      </div>
                    )}
                  {r.election_type === "presidential" &&
                    r.counties_total &&
                    r.counties_total > 0 && (
                      <details className="text-xs text-ink-soft mt-1">
                        <summary
                          className="cursor-pointer hover:text-ink select-none"
                          style={{ color }}
                        >
                          勝選 {r.counties_won?.length ?? 0} / {r.counties_total}{" "}
                          縣市
                        </summary>
                        <div className="mt-1 leading-relaxed">
                          {(r.counties_won ?? []).join("、") || "—"}
                        </div>
                      </details>
                    )}
                </div>
                <div className="col-span-6 sm:col-span-3 text-sm">
                  <PartyLink name={r.party_name} color={color} />
                  {elected && (
                    <span className="ml-2 text-xs text-accent-red font-bold">
                      ★ 當選
                    </span>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-2 text-sm tabular-nums text-right">
                  {r.votes != null && r.votes > 0
                    ? `${formatVotes(r.votes)} 票`
                    : "—"}
                </div>
                {(r.platform_count > 0 || r.image_count > 0) && (
                  <div className="col-span-12">
                    <Link
                      href={`/platforms?election=${r.election_id}${
                        r.district
                          ? "&district=" + encodeURIComponent(r.district)
                          : ""
                      }`}
                      className="text-xs underline underline-offset-2 text-ink-soft hover:text-accent-red"
                    >
                      看政見（文字 {r.platform_count} 條 + 圖片 {r.image_count} 張）
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "text-ink",
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="border border-rule p-2">
      <p className="text-[10px] tracking-widest uppercase text-ink-soft mb-1">
        {label}
      </p>
      <p className={`font-serif text-2xl font-bold tabular-nums ${accent}`}>
        {value}
      </p>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: encodedName } = await params;
  const name = decodeURIComponent(encodedName);
  return { title: `${name} · 正至` };
}
