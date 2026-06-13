import Link from "next/link";
import { PersonLink } from "@/components/entity-links";
import { partyColor } from "@/lib/format";

export const metadata = { title: "搜尋政治人物 · 正至" };

interface Featured {
  name: string;
  role: string;
  party: string;
}

const FEATURED: { group: string; items: Featured[] }[] = [
  {
    group: "現任政府首長",
    items: [
      { name: "賴清德", role: "總統", party: "民主進步黨" },
      { name: "蕭美琴", role: "副總統", party: "民主進步黨" },
      { name: "卓榮泰", role: "行政院長", party: "民主進步黨" },
      { name: "韓國瑜", role: "立法院長", party: "中國國民黨" },
      { name: "陳菊", role: "監察院長", party: "無黨籍" },
    ],
  },
  {
    group: "現任六都市長",
    items: [
      { name: "蔣萬安", role: "臺北市長", party: "中國國民黨" },
      { name: "侯友宜", role: "新北市長", party: "中國國民黨" },
      { name: "張善政", role: "桃園市長", party: "中國國民黨" },
      { name: "盧秀燕", role: "臺中市長", party: "中國國民黨" },
      { name: "黃偉哲", role: "臺南市長", party: "民主進步黨" },
      { name: "陳其邁", role: "高雄市長", party: "民主進步黨" },
    ],
  },
  {
    group: "近期總統候選人",
    items: [
      { name: "蔡英文", role: "前總統 (2016–2024)", party: "民主進步黨" },
      { name: "馬英九", role: "前總統 (2008–2016)", party: "中國國民黨" },
      { name: "陳水扁", role: "前總統 (2000–2008)", party: "民主進步黨" },
      { name: "柯文哲", role: "2024 總統候選人", party: "台灣民眾黨" },
      { name: "宋楚瑜", role: "5 次總統候選人", party: "親民黨" },
    ],
  },
];

export default function PeopleSearchPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <div className="text-sm text-ink-soft mb-3">
          <Link href="/people" className="hover:text-ink">
            ← 政治人物
          </Link>
        </div>
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          PEOPLE · SEARCH
        </p>
        <h1 className="article-title font-serif text-3xl sm:text-4xl font-bold leading-tight mb-3">
          搜尋政治人物
        </h1>
        <p className="text-ink-soft leading-relaxed max-w-3xl">
          用上方搜尋列輸入姓名，或從下方常見人物快速進入個人頁面。
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/search"
            className="inline-block px-4 py-2 bg-ink text-paper text-sm hover:opacity-85 transition"
          >
            前往全站搜尋 →
          </Link>
        </div>
      </header>

      <div className="space-y-12">
        {FEATURED.map((group) => (
          <section key={group.group}>
            <h2 className="font-serif text-2xl font-bold mb-4 border-b border-ink pb-2">
              {group.group}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {group.items.map((p) => {
                const color = partyColor(p.party);
                return (
                  <div
                    key={p.name}
                    className="border border-rule p-3 hover:border-ink transition"
                    style={{ borderLeftColor: color, borderLeftWidth: 4 }}
                  >
                    <PersonLink
                      name={p.name}
                      color={color}
                      className="font-serif text-lg font-bold"
                    />
                    <div className="text-xs text-ink-soft mt-0.5">
                      {p.role}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color }}>
                      {p.party}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
