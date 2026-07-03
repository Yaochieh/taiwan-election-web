import Link from "next/link";
import { API_URL } from "@/lib/api";

export const metadata = { title: "開放資料 · 正至" };

interface Endpoint {
  group: string;
  items: { label: string; path: string; desc: string }[];
}

const ENDPOINTS: Endpoint[] = [
  {
    group: "選舉",
    items: [
      { label: "歷屆選舉清單", path: "/elections", desc: "所有選舉的日期、類型、名稱" },
      { label: "選舉結果", path: "/elections/{id}/results", desc: "某選舉所有候選人得票與當選旗標" },
      { label: "鄉鎮市區得票", path: "/elections/{id}/townships", desc: "總統選舉鄉鎮層級結果（1996–2024）" },
      { label: "投票區清單", path: "/elections/{id}/districts", desc: "某選舉的所有選區" },
    ],
  },
  {
    group: "候選人 / 政見",
    items: [
      { label: "候選人詳情", path: "/candidates/{id}", desc: "含學經歷、政黨、當選紀錄" },
      { label: "政見列表", path: "/platforms/elections", desc: "有政見資料的選舉清單" },
      { label: "全文檢索", path: "/search?q=...", desc: "跨候選人/政黨/選舉搜尋" },
      { label: "政見公報 OCR", path: "/static/bulletin_images/...", desc: "原始公報圖檔" },
    ],
  },
  {
    group: "政黨 / 立法院",
    items: [
      { label: "政黨清單", path: "/parties", desc: "所有政黨及代表色" },
      { label: "立法院組成", path: "/legislature/{year}", desc: "某年 113 立委分類與政黨組成" },
      { label: "歷屆立委席次趨勢", path: "/legislature/trend/seats", desc: "2008–2024 各黨席次" },
    ],
  },
  {
    group: "政治人物",
    items: [
      { label: "個人檔案", path: "/people/{name}", desc: "歷年參選紀錄、政黨變遷、勝率" },
      { label: "政見追蹤目標", path: "/people/{name}/targets", desc: "首長任期內政見執行進度（多源攻擊）" },
    ],
  },
];

export default function DownloadsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <div className="text-sm text-ink-soft mb-3">
          <Link href="/data" className="hover:text-ink">
            ← 數據資料
          </Link>
        </div>
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          OPEN DATA
        </p>
        <h1 className="article-title font-serif text-3xl sm:text-4xl font-bold leading-tight mb-3">
          開放資料 API
        </h1>
        <p className="text-ink-soft leading-relaxed max-w-3xl">
          整個平台的資料來自公開 API。歡迎研究者、媒體、開發者直接呼叫使用。
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={`${API_URL}/docs`}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-4 py-2 bg-ink text-paper text-sm hover:opacity-85 transition"
          >
            完整 API 文件 (Swagger UI) →
          </a>
          <a
            href="https://github.com/Yaochieh/taiwan-election"
            target="_blank"
            rel="noreferrer"
            className="inline-block px-4 py-2 border border-ink text-sm hover:bg-ink hover:text-paper transition"
          >
            原始碼 (GitHub) →
          </a>
        </div>
      </header>

      <div className="space-y-10">
        {ENDPOINTS.map((g) => (
          <section key={g.group}>
            <h2 className="font-serif text-2xl font-bold mb-4 border-b border-ink pb-2">
              {g.group}
            </h2>
            <div className="space-y-3">
              {g.items.map((e) => (
                <div
                  key={e.path}
                  className="border border-rule p-3 grid sm:grid-cols-[1fr_auto] gap-3 items-baseline"
                >
                  <div>
                    <div className="font-medium">{e.label}</div>
                    <div className="text-xs text-ink-soft mt-0.5">{e.desc}</div>
                  </div>
                  <code className="text-xs bg-rule px-2 py-1 font-mono break-all">
                    GET {e.path}
                  </code>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-12 border-t border-rule pt-6">
        <h2 className="font-serif text-xl font-bold mb-3">資料授權</h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          本平台彙整的選舉結果、候選人、政見資料皆引自中央選舉委員會公開資料，
          重新整理的 schema 與 API 採 MIT 授權。請註明資料來源「正至 ·
          台灣選舉資訊平台」並連結回 GitHub。
        </p>
      </section>
    </div>
  );
}
