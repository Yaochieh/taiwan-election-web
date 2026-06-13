import Link from "next/link";

export const metadata = {
  title: "政府 · 正至",
  description: "立法院、縣市政府、中央政府的組成與現況",
};

const SECTIONS = [
  {
    href: "/government/legislature",
    title: "立法院",
    desc: "現任 113 位立法委員席次分佈、政黨組成、選區歸屬。",
    status: "✓",
  },
  {
    href: "/government/mayors",
    title: "縣市政府",
    desc: "歷屆縣市長當選結果、地理分佈、政黨輪替紀錄。",
    status: "✓",
  },
  {
    href: "/government/cabinet",
    title: "中央政府",
    desc: "總統府、行政院、五院首長與主要部會首長現況。",
    status: "✓",
  },
];

export default function GovernmentLanding() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          GOVERNMENT
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight">
          政府
        </h1>
        <p className="text-ink-soft mt-4 leading-relaxed max-w-3xl">
          台灣中央與地方政府的組成與現況。選舉只是起點，當選人在任期間做了什麼，
          才是公民監督的重點。
        </p>
      </header>

      <div className="grid sm:grid-cols-3 gap-10">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group block border-t-2 border-ink pt-6 hover:border-accent-red transition"
          >
            <p className="text-xs text-ink-soft mb-2">
              {s.status === "✓" ? "已上線" : "建置中"}
            </p>
            <h2 className="font-serif text-2xl font-bold mb-3 group-hover:text-accent-red transition">
              {s.title} →
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
