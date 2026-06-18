import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPersonProfile,
  candidatePhotoUrl,
  getPersonTargets,
  getPersonTopicDistribution,
} from "@/lib/api";
import { TopicRadar } from "@/components/topic-radar";
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

  const [profile, targets, topicDist] = await Promise.all([
    getPersonProfile(name).catch(() => null),
    getPersonTargets(name).catch(() => []),
    getPersonTopicDistribution(name).catch(() => []),
  ]);
  if (!profile) notFound();

  // 最新一場有政見的參選
  const raceWithPlatform = profile.races.find(
    (r) => (r.platform_count || 0) > 0,
  );
  const latestPlatforms = raceWithPlatform
    ? await (async () => {
        const { getCandidatePlatforms } = await import("@/lib/api");
        return getCandidatePlatforms(
          raceWithPlatform.candidate_id,
          raceWithPlatform.election_id,
        ).catch(() => []);
      })()
    : [];

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
      {targets.length > 0 && (() => {
        // 「可追蹤」= 有量化數字、或有進度/子目標的（舊手工資料）
        const trackable = targets.filter(
          (t) =>
            t.target_value != null ||
            (t.children && t.children.length > 0) ||
            t.progress.length > 0,
        );
        // 其餘 = 空泛政見方向（無數字，等同政見原文重述）
        const vague = targets.filter((t) => !trackable.includes(t));

        // trackable 分三類
        const promiseWon = trackable.filter(
          (t) =>
            t.tense !== "past" &&
            t.verification_status !== "not_executed",
        );
        const promiseLost = trackable.filter(
          (t) => t.tense !== "past" && t.verification_status === "not_executed",
        );
        const records = trackable.filter((t) => t.tense === "past");

        const cardGrid = (list: typeof targets) => (
          <div className="grid sm:grid-cols-2 gap-6 mb-3">
            {list.map((t) => (
              <TargetCard key={t.target_id} target={t} />
            ))}
          </div>
        );

        return (
          <section className="mb-12">
            <div className="flex items-baseline justify-between mb-3 gap-4">
              <h2 className="font-serif text-2xl font-bold">政見追蹤</h2>
              <span className="text-xs text-ink-soft px-2 py-1 border border-rule">
                自動抽取 · BETA
              </span>
            </div>
            <p className="text-sm text-ink-soft mb-6 leading-relaxed max-w-3xl">
              聚焦<strong>有量化數字、可追蹤</strong>的承諾與政績。
              承諾依該場選舉是否當選，分「可追蹤」與「未當選未執行」；政績待公開資料查證。
            </p>

            {trackable.length === 0 && (
              <p className="text-sm text-ink-soft border border-rule p-4 mb-6">
                此人政見目前未抽取到具體量化指標（多為原則性主張），詳見下方政見原文。
              </p>
            )}

            {promiseWon.length > 0 && (
              <div className="mb-8">
                <h3 className="font-serif text-lg font-bold mb-3 flex items-baseline gap-3">
                  <span className="text-accent-red">🎯 可追蹤承諾</span>
                  <span className="text-sm text-ink-soft">{promiseWon.length} 項</span>
                </h3>
                {cardGrid(promiseWon)}
              </div>
            )}

            {records.length > 0 && (
              <div className="mb-8">
                <h3 className="font-serif text-lg font-bold mb-3 flex items-baseline gap-3">
                  <span>📜 政績</span>
                  <span className="text-sm text-ink-soft">{records.length} 項</span>
                </h3>
                {cardGrid(records)}
              </div>
            )}

            {promiseLost.length > 0 && (
              <details className="mb-6">
                <summary className="cursor-pointer font-serif text-lg font-bold text-ink-soft hover:text-ink">
                  ✗ 未當選未執行的承諾（{promiseLost.length} 項）
                </summary>
                <div className="mt-3">{cardGrid(promiseLost)}</div>
              </details>
            )}

            {/* 空泛政見方向：收摺、精簡列 */}
            {vague.length > 0 && (
              <details className="mb-2">
                <summary className="cursor-pointer text-sm text-ink-soft hover:text-ink">
                  其他政見方向（{vague.length} 項，無量化數字）
                </summary>
                <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1">
                  {vague.map((t) => (
                    <li
                      key={t.target_id}
                      className="text-sm text-ink-soft border-l-2 border-rule pl-3 py-0.5"
                    >
                      {t.election_date && (
                        <span className="text-[10px] tabular-nums mr-1.5">
                          {t.election_date.slice(0, 4)}
                        </span>
                      )}
                      {t.title}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>
        );
      })()}

      {/* ── 學經歷（官方立法院資料優先，否則解析公報） ── */}
      {(profile.edu_official || profile.career_official || profile.background) && (() => {
        const hasOfficial = !!(profile.edu_official || profile.career_official);
        let edu = "";
        let exp = "";
        let source = "中選會公報";
        if (hasOfficial) {
          // 立法院官方資料：學歷/經歷已乾淨分開
          edu = profile.edu_official || "";
          exp = profile.career_official || "";
          source = profile.official_source || "立法院";
        } else if (profile.background) {
          // fallback：解析亂的公報 OCR
          const text = profile.background
            .replace(/^【.*?】\s*/g, "\n")
            .replace(/^[•．\-]\s*/gm, "");
          const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
          const EDU = /(大學|碩士|博士|學系|學院|高中|中學|小學|科系|系所|學位|EMBA|MBA|專科)/;
          const EXP = /(委員|主任|秘書|律師|醫師|部長|署長|局長|長|議員|市長|縣長|理事|董事|顧問|主席|代表|處長|科長|執行長)/;
          for (const line of lines) {
            if (EDU.test(line) && !EXP.test(line)) edu += (edu ? "\n" : "") + line;
            else exp += (exp ? "\n" : "") + line;
          }
          if (!edu && !exp) exp = profile.background.trim();
        }
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
            <h2 className="font-serif text-2xl font-bold mb-4">
              學歷與經歷
              {hasOfficial && (
                <span className="ml-3 text-xs font-normal text-green-700 border border-green-600 px-2 py-0.5 align-middle">
                  ✓ 立法院官方
                </span>
              )}
            </h2>
            <div className="border border-rule p-5 grid sm:grid-cols-2 gap-6">
              <Block label="學歷" content={edu} />
              <Block label="經歷" content={exp} />
            </div>
            {profile.committees_official && (
              <div className="mt-3 text-xs text-ink-soft">
                <span className="font-medium">所屬委員會：</span>
                {profile.committees_official.split("\n").slice(-2).join("；")}
              </div>
            )}
            <p className="text-xs text-ink-soft mt-2">資料來源：{source}</p>
          </section>
        );
      })()}

      {/* ── 立委問政紀錄 ── */}
      {(profile.proposals_count != null ||
        profile.interpellations_count != null ||
        profile.votes_count != null) && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-4">
            立委問政紀錄
            <span className="ml-3 text-xs font-normal text-green-700 border border-green-600 px-2 py-0.5 align-middle">
              ✓ 立法院官方
            </span>
          </h2>
          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            {[
              { label: "提案數", value: profile.proposals_count },
              { label: "質詢數", value: profile.interpellations_count },
              { label: "記名表決參與", value: profile.votes_count },
            ].map((s) => (
              <div key={s.label} className="border border-rule p-4">
                <p className="text-xs tracking-widest uppercase text-ink-soft mb-1">
                  {s.label}
                </p>
                <p className="font-serif text-3xl font-bold tabular-nums">
                  {s.value ?? "—"}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-soft mt-2 leading-relaxed">
            本屆任內主導/連署議案、院會質詢、記名表決參與次數。資料來源：立法院開放資料 ly.govapi.tw。
            數量高不代表品質，僅供參考。
          </p>
        </section>
      )}

      {/* ── 維基百科簡介 ── */}
      {profile.background_source && (() => {
        const text = profile.background_source;
        const urlMatch = text.match(/https?:\/\/\S+/);
        const url = urlMatch ? urlMatch[0].replace(/\)$/, "") : null;
        const bodyText = text
          .replace(/（資料來源：[^）]*）/, "")
          .trim();
        return (
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-4">維基百科簡介</h2>
            <div className="border border-rule p-5">
              <p className="leading-[1.85] whitespace-pre-wrap text-sm">
                {bodyText}
              </p>
              {url && (
                <p className="mt-3 text-xs text-ink-soft">
                  資料來源：
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener"
                    className="ml-1 hover:text-accent-red underline-offset-2 hover:underline"
                  >
                    中文維基百科 →
                  </a>
                </p>
              )}
            </div>
          </section>
        );
      })()}

      {/* ── 最新政見預覽 ── */}
      {latestPlatforms.length > 0 && raceWithPlatform && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-3">
            最新政見
            <span className="ml-3 text-sm text-ink-soft font-normal">
              {raceWithPlatform.election_date.slice(0, 4)}{" "}
              {raceWithPlatform.election_name}
            </span>
          </h2>
          <div className="border border-rule p-5 space-y-3 bg-rule/10">
            {latestPlatforms.slice(0, 3).map((p) => (
              <div key={p.seq} className="border-l-2 border-rule pl-3">
                <p className="whitespace-pre-wrap leading-[1.85] text-sm">
                  {(p.content || "").slice(0, 500)}
                  {(p.content || "").length > 500 ? "…" : ""}
                </p>
                {p.note?.includes("人工潤稿") && (
                  <span className="mt-1.5 inline-block bg-accent-red/15 text-accent-red border border-accent-red/30 px-1.5 py-0.5 text-[10px]">
                    人工潤稿
                  </span>
                )}
              </div>
            ))}
            <Link
              href={`/platforms?election=${raceWithPlatform.election_id}${raceWithPlatform.district ? `&district=${encodeURIComponent(raceWithPlatform.district)}` : ""}`}
              className="inline-block text-sm hover:text-accent-red underline-offset-2 hover:underline mt-1"
              style={{ color: accent }}
            >
              查看完整政見 →
            </Link>
          </div>
        </section>
      )}

      {/* ── 政見主題分布（雷達圖） ── */}
      {topicDist.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-4">
            政見主題分布
            <span className="ml-3 text-sm text-ink-soft font-normal">
              {topicDist.length} 個主題
            </span>
          </h2>
          <div className="border border-rule p-5">
            <TopicRadar data={topicDist} accent={accent} />
          </div>
        </section>
      )}

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
