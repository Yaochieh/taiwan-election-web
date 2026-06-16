import Link from "next/link";
import {
  getCandidatePlatformImages,
  getCandidatePlatformSources,
  bulletinImageUrl,
  candidatePhotoUrl,
} from "@/lib/api";
import type { CandidatePlatformStatus, Platform } from "@/lib/types";
import { partyColor, formatVotes, votePct } from "@/lib/format";
import { PartyLink } from "@/components/entity-links";

export async function CandidatePlatformCard({
  status,
  platforms,
  electionId,
  districtLabel,
  districtTotalVotes,
}: {
  status: CandidatePlatformStatus;
  platforms: Platform[];
  electionId: number;
  districtLabel: string;
  districtTotalVotes?: number;
}) {
  const [images, sources] = await Promise.all([
    status.image_count > 0
      ? getCandidatePlatformImages(status.candidate_id, electionId).catch(() => [])
      : Promise.resolve([]),
    getCandidatePlatformSources(status.candidate_id, electionId).catch(() => []),
  ]);

  const color = partyColor(status.party_name, status.color_hex);
  const elected = status.elected === 1;
  const hasText = status.platform_count > 0;
  const hasImage = status.image_count > 0;
  const noContent = !hasText && !hasImage;

  const photoUrl = candidatePhotoUrl(status.photo_path);

  return (
    <article className="border-t-2 border-ink pt-8 relative">
      {/* ── Header ── */}
      <header className="flex gap-4 mb-5">
        {/* 照片 */}
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={`${status.candidate_name} 大頭照`}
            className="w-20 h-24 sm:w-24 sm:h-28 object-cover border border-rule shrink-0 bg-rule/30"
            loading="lazy"
          />
        ) : (
          <div className="w-20 h-24 sm:w-24 sm:h-28 border border-rule shrink-0 bg-rule/30 flex items-center justify-center">
            <span className="font-serif text-3xl text-ink-soft">
              {status.candidate_name.slice(0, 1)}
            </span>
          </div>
        )}
        {/* 文字資訊 */}
        <div className="flex-1 flex flex-wrap items-baseline gap-x-4 gap-y-2 min-w-0">
          {elected && (
            <span className="text-accent-red font-serif text-sm font-bold">
              ★ 當選
            </span>
          )}
          <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
            <Link
              href={`/people/${encodeURIComponent(status.candidate_name)}`}
              className="hover:underline underline-offset-4"
              style={{ color }}
            >
              {status.candidate_name}
            </Link>
          </h2>
          <span className="text-sm">
            <PartyLink name={status.party_name} />
          </span>
          {districtLabel && (
            <span className="text-sm text-ink-soft">· {districtLabel}</span>
          )}
          {status.votes != null && status.votes > 0 && (
            <span className="text-sm text-ink-soft">
              · 得票 {formatVotes(status.votes)}
              {(() => {
                const pct = votePct(status.votes, districtTotalVotes);
                return pct ? (
                  <span className="ml-1 text-accent-red">（{pct}）</span>
                ) : null;
              })()}
            </span>
          )}
          {/* status pill */}
          <span className="ml-auto text-xs px-2 py-1 border border-rule">
            {hasText
              ? `文字政見 ${status.platform_count} 條`
              : hasImage
                ? `圖片政見 ${status.image_count} 張`
                : "未刊登政見"}
          </span>
        </div>
      </header>

      {/* ── 文字政見 ── */}
      {hasText && (
        <ol className="space-y-4 mb-6">
          {platforms.map((p) => {
            // 若內文本身已是「1. 2. 3.」條列，就不顯示外層 seq 避免重複
            const contentIsNumbered = /^\s*\d+[\.\)、]/.test(p.content || "");
            return (
            <li key={p.seq} className="flex gap-4">
              {!contentIsNumbered && (
                <span className="font-serif text-2xl text-ink-soft tabular-nums shrink-0 min-w-[2ch]">
                  {p.seq}.
                </span>
              )}
              <div className="flex-1">
                <p className="leading-[1.85] whitespace-pre-wrap">{p.content}</p>
                {(p.source_url || p.note) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-[11px] text-ink-soft">
                    {p.note && (
                      <span className="inline-block bg-rule/60 text-ink px-1.5 py-0.5">
                        {p.note}
                      </span>
                    )}
                    {p.source_url && (
                      <a
                        href={p.source_url}
                        target="_blank"
                        rel="noopener"
                        className="hover:text-accent-red underline-offset-4 hover:underline"
                      >
                        資料來源 →
                      </a>
                    )}
                  </div>
                )}
              </div>
            </li>
            );
          })}
        </ol>
      )}

      {/* ── 圖片政見 ── */}
      {hasImage && (
        <div className="space-y-4 mb-6">
          {!hasText && (
            <p className="text-sm text-ink-soft italic">
              此候選人提交的是<strong>圖片版</strong>政見（含設計排版），以下為公報原圖：
            </p>
          )}
          {images.map((img) => (
            <figure key={img.local_path} className="border border-rule bg-paper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bulletinImageUrl(img.local_path)}
                alt={`${status.candidate_name} 政見圖檔`}
                className="w-full h-auto p-2"
                loading="lazy"
              />
              {img.ocr_text && (
                <details className="border-t border-rule p-3 text-sm group">
                  <summary className="cursor-pointer hover:text-accent-red list-none flex items-baseline gap-2 text-ink-soft">
                    <span className="transition-transform group-open:rotate-90">›</span>
                    <span className="font-medium">展開政見文字</span>
                    <span className="text-xs">
                      （由 OCR 自動辨識，{img.ocr_text.length} 字）
                    </span>
                  </summary>
                  <div className="mt-3 whitespace-pre-wrap leading-[1.85] text-ink">
                    {img.ocr_text}
                  </div>
                  <p className="mt-3 text-xs text-ink-soft border-t border-rule pt-2">
                    ⚠️ 文字由電腦自動辨識，可能有誤。請以上方原圖為準。
                  </p>
                </details>
              )}
            </figure>
          ))}
        </div>
      )}

      {/* ── 完全未繳 ── */}
      {noContent && (
        <p className="mb-6 p-4 border-l-2 border-accent-red bg-paper text-ink-soft leading-relaxed">
          此候選人<strong>未於中選會選舉公報刊登任何政見內容</strong>。
          公報之政見刊登屬候選人自由意願，民眾可至選舉公報原檔查證。
        </p>
      )}

      {/* ── 資料來源 ── */}
      {sources.length > 0 && (
        <details className="group text-sm text-ink-soft">
          <summary className="cursor-pointer hover:text-ink list-none flex items-center gap-1">
            <span className="transition-transform group-open:rotate-90">›</span>
            資料來源（{sources.length}）
          </summary>
          <ul className="mt-3 space-y-2 pl-4 border-l border-rule">
            {sources.map((s, i) => (
              <li key={i}>
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:text-ink"
                  >
                    {s.description || s.source_type}
                  </a>
                ) : (
                  <span>{s.description || s.source_type}</span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}
