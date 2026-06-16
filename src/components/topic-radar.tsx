import Link from "next/link";
import type { TopicDistribution } from "@/lib/api";

interface Props {
  data: TopicDistribution[];
  accent: string;
}

export function TopicRadar({ data, accent }: Props) {
  if (data.length === 0) return null;

  // 至少 5 個軸（topic 不足 5 個就補空）
  const items = data.slice(0, 8);
  const max = Math.max(...items.map((d) => d.n), 1);
  const N = Math.max(items.length, 5);
  const cx = 100;
  const cy = 100;
  const R = 80;

  // 計算每個 topic 在圓上的點
  const points = items.map((d, i) => {
    const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
    const r = (d.n / max) * R;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      labelX: cx + Math.cos(angle) * (R + 18),
      labelY: cy + Math.sin(angle) * (R + 18),
      axisX: cx + Math.cos(angle) * R,
      axisY: cy + Math.sin(angle) * R,
      topic: d,
      angle,
    };
  });

  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="grid sm:grid-cols-[200px_1fr] gap-6 items-center">
      {/* SVG 雷達圖 */}
      <svg
        viewBox="-40 -10 280 220"
        className="w-full max-w-[240px] mx-auto"
        style={{ overflow: "visible" }}
      >
        {/* 同心圓刻度 */}
        {[0.33, 0.66, 1].map((k) => (
          <circle
            key={k}
            cx={cx}
            cy={cy}
            r={R * k}
            fill="none"
            stroke="#ddd"
            strokeWidth="0.5"
          />
        ))}
        {/* 軸線 */}
        {points.map((p, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.axisX}
            y2={p.axisY}
            stroke="#ddd"
            strokeWidth="0.5"
          />
        ))}
        {/* 雷達多邊形 */}
        <polygon
          points={polygon}
          fill={accent}
          fillOpacity="0.18"
          stroke={accent}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* 各點 */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={accent} />
        ))}
        {/* Label */}
        {points.map((p, i) => {
          const anchor =
            p.labelX < cx - 5 ? "end" : p.labelX > cx + 5 ? "start" : "middle";
          return (
            <text
              key={i}
              x={p.labelX}
              y={p.labelY}
              fontSize="9"
              textAnchor={anchor}
              dominantBaseline="middle"
              fill="#333"
            >
              {p.topic.icon} {p.topic.topic}
            </text>
          );
        })}
      </svg>

      {/* 文字 ranking */}
      <ol className="space-y-1 text-sm">
        {items.map((d, i) => (
          <li
            key={d.topic}
            className="flex items-baseline gap-2 border-b border-rule/40 py-1"
          >
            <span className="text-ink-soft w-4 tabular-nums">#{i + 1}</span>
            <span>{d.icon}</span>
            <Link
              href={`/topics/${encodeURIComponent(d.topic)}`}
              className="hover:underline underline-offset-2"
            >
              {d.topic}
            </Link>
            <span className="ml-auto tabular-nums text-ink-soft">
              {d.n} 條政見
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
