import {
  getCandidatePlatformImages,
  getCandidatePlatformSources,
  bulletinImageUrl,
} from "@/lib/api";
import type { CandidatePlatformStatus, Platform } from "@/lib/types";
import { partyColor, formatVotes, votePct } from "@/lib/format";

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

  return (
    <article className="border-t-2 border-ink pt-8 relative">
      {/* ── Header ── */}
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-5">
        {elected && (
          <span className="text-accent-red font-serif text-sm font-bold">
            ★ 當選
          </span>
        )}
        <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
          <span style={{ color }}>{status.candidate_name}</span>
        </h2>
        <span className="text-sm text-ink-soft">
          {status.party_name || "無黨籍"}
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
      </header>

      {/* ── 文字政見 ── */}
      {hasText && (
        <ol className="space-y-4 mb-6">
          {platforms.map((p) => (
            <li key={p.seq} className="flex gap-4">
              <span className="font-serif text-2xl text-ink-soft tabular-nums shrink-0 min-w-[2ch]">
                {p.seq}.
              </span>
              <p className="leading-[1.85] whitespace-pre-wrap">{p.content}</p>
            </li>
          ))}
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
            <figure
              key={img.local_path}
              className="border border-rule bg-paper p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bulletinImageUrl(img.local_path)}
                alt={`${status.candidate_name} 政見圖檔`}
                className="w-full h-auto"
                loading="lazy"
              />
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
