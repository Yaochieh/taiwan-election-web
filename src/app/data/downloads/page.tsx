import Link from "next/link";

export const metadata = { title: "資料來源與方法 · 正至" };

interface Step {
  n: string;
  title: string;
  desc: string;
}

const PIPELINE: Step[] = [
  {
    n: "01",
    title: "取得原始資料",
    desc: "從中選會選舉資料庫下載歷屆選舉結果與候選人名單，從選舉公報網站下載各選區公報 PDF。立委的學經歷與提案紀錄來自立法院開放資料。",
  },
  {
    n: "02",
    title: "解析公報",
    desc: "公報多為掃描影像，用 PaddleOCR 逐頁辨識。多欄式版面會依座標重新分欄，避免不同候選人的政見混在一起。版面太密的會提高解析度重跑。",
  },
  {
    n: "03",
    title: "切分與整理",
    desc: "OCR 出來是整頁連續文字，用 LLM 切分成各候選人的政見條目並整理斷行。整理後必須與原始 OCR 文字比對達八成重疊才採用，未達標的直接刪除而非保留。",
  },
  {
    n: "04",
    title: "標註與抽取",
    desc: "政見依關鍵字歸入 15 個主題；再由 LLM 從政見全文抽出可量化的承諾（數字、期限、單位）。這兩步都是自動產生的，會漏會錯。",
  },
  {
    n: "05",
    title: "追蹤兌現",
    desc: "挑出有明確數字、對得上政府公開統計的承諾，逐條人工查證進度並記錄來源與擷取日期。部分來源每日自動更新。",
  },
  {
    n: "06",
    title: "稽核與發布",
    desc: "資料庫更新前必須通過真實性稽核腳本與 42 項自動測試，CI 未通過不予發布。",
  },
];

const SOURCES = [
  {
    name: "中央選舉委員會選舉資料庫",
    url: "https://db.cec.gov.tw",
    desc: "選舉結果、候選人名單、得票數",
  },
  {
    name: "中選會選舉公報",
    url: "https://bulletin.cec.gov.tw",
    desc: "候選人政見與學經歷的原始 PDF",
  },
  {
    name: "立法院開放資料",
    url: "https://ly.govapi.tw",
    desc: "立委學經歷、提案、質詢、表決紀錄",
  },
  {
    name: "各部會與地方政府公開統計",
    url: null,
    desc: "承諾兌現進度（社宅戶數、托育名額、再生能源占比等），逐筆標註機關與擷取日期",
  },
];

export default function DataMethodPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <div className="text-sm text-ink-soft mb-3">
          <Link href="/data" className="hover:text-ink">
            ← 數據資料
          </Link>
        </div>
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          SOURCES &amp; METHOD
        </p>
        <h1 className="article-title font-serif text-3xl sm:text-4xl font-bold leading-tight mb-3">
          資料來源與方法
        </h1>
        <p className="text-ink-soft leading-relaxed max-w-3xl">
          這個網站的每一筆政見都引自選舉公報原檔，每一筆兌現進度都附官方統計來源。
          這頁說明資料從哪裡來、怎麼處理、以及哪些地方需要保留懷疑。
        </p>
        <div className="mt-4">
          <a
            href="https://github.com/Yaochieh/taiwan-election"
            target="_blank"
            rel="noreferrer"
            className="inline-block px-4 py-2 border border-ink text-sm hover:bg-ink hover:text-paper transition"
          >
            資料處理腳本與資料庫 (GitHub) →
          </a>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="font-serif text-2xl font-bold mb-4 border-b border-ink pb-2">
          資料來源
        </h2>
        <div className="space-y-3">
          {SOURCES.map((s) => (
            <div key={s.name} className="border border-rule p-3">
              <div className="font-medium">
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:text-accent-red"
                  >
                    {s.name}
                  </a>
                ) : (
                  s.name
                )}
              </div>
              <div className="text-xs text-ink-soft mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-serif text-2xl font-bold mb-4 border-b border-ink pb-2">
          處理流程
        </h2>
        <div className="space-y-4">
          {PIPELINE.map((s) => (
            <div key={s.n} className="grid sm:grid-cols-[auto_1fr] gap-4">
              <div className="font-serif text-2xl font-bold text-ink-soft tabular-nums">
                {s.n}
              </div>
              <div>
                <div className="font-medium mb-1">{s.title}</div>
                <p className="text-sm text-ink-soft leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-serif text-2xl font-bold mb-4 border-b border-ink pb-2">
          怎麼確保沒有捏造
        </h2>
        <p className="text-sm leading-relaxed mb-4">
          開發過程中曾發生 AI 用自身知識「腦補」政見內容的事故。所有無法對照公報原檔的資料
          已全部刪除重建，並建立了以下機制防止再犯：
        </p>
        <ul className="space-y-2.5 text-sm leading-relaxed">
          <li>
            · <strong>寧可留白，不補寫</strong> — 查不到公報來源的政見就是空的，
            不用其他管道的記憶或推測填補。
          </li>
          <li>
            · <strong>保留原文可對照</strong> — 每條政見都存著原始 OCR 文字，
            整理後的版本必須與原文比對達八成重疊才採用。
          </li>
          <li>
            · <strong>一切標來源</strong> — 政見標公報檔名、學經歷標出處、
            兌現進度標機關網址與擷取日期。人工潤稿過的內容會另外註記。
          </li>
          <li>
            · <strong>自動稽核擋關</strong> — 資料庫更新前必須通過真實性稽核腳本
            與 42 項測試，CI 未過不予發布。
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="font-serif text-2xl font-bold mb-4 border-b border-ink pb-2">
          需要保留懷疑的地方
        </h2>
        <ul className="space-y-2.5 text-sm leading-relaxed">
          <li>
            · <strong>OCR 會有錯字</strong>。公報是掃描影像，辨識難免出錯，
            尤其密集排版的多欄版面。
          </li>
          <li>
            · <strong>主題分類是關鍵字比對</strong>。政見裡出現「社宅、租屋」就會被歸到住宅主題，
            不代表候選人真的著墨該議題。
          </li>
          <li>
            · <strong>量化承諾由 AI 抽取</strong>，可能漏抽、誤判單位或抓錯期限。
          </li>
          <li>
            · <strong>兌現追蹤只有 20 條</strong>，是逐條人工查證的示範，不是全面盤點。
            沒被追蹤不代表沒兌現。
          </li>
          <li>
            · <strong>功勞歸屬很複雜</strong>。有些目標由中央政策達成、有些跨越多任期、
            有些查核單位有爭議 — 這些都在頁面上標註，請一併閱讀。
          </li>
        </ul>
        <p className="text-sm text-ink-soft mt-4 leading-relaxed">
          看到任何可疑的數字或內容，請到 GitHub 開 issue 或直接送 PR。
          原始資料與所有處理腳本都是公開的，歡迎查核。
        </p>
      </section>

      <section className="border-t border-rule pt-6">
        <h2 className="font-serif text-xl font-bold mb-3">資料授權</h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          本平台彙整的選舉結果、候選人、政見資料皆引自中央選舉委員會公開資料，
          重新整理的 schema 與程式採 MIT 授權。引用請註明資料來源「正至 ·
          台灣選舉資訊平台」並連結回 GitHub。
        </p>
      </section>
    </div>
  );
}
