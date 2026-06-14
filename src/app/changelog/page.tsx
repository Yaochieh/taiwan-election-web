import Link from "next/link";

export const metadata = { title: "更新紀錄 · 正至" };

interface Entry {
  date: string;
  title: string;
  items: string[];
}

const CHANGELOG: Entry[] = [
  {
    date: "2026-06",
    title: "資料 / 視覺化大幅補強",
    items: [
      "縣市長選舉得票重新匯入（2010/2014/2018/2022 共 280 筆 4x 膨脹修正）",
      "區域立委得票重新匯入（2008/2012/2020/2024 共 1269 筆修正）",
      "總統選舉鄉鎮市區層級得票（1996–2024 共 7 屆 + 2016 由 CEC Excel 補入）",
      "2024 不分區立委 34 人完整名單（民進 13、國民 13、民眾 8）",
      "/trends 立委席次圖加入不分區（總數 113 席）",
      "/elections/[id] 總統頁：全國得票 Treemap + 縣市勝出政黨地圖 + 點縣市下鑽鄉鎮",
      "/people/[name] 總統選舉行顯示勝選縣市 X/22",
      "/government/cabinet 完成：總統府/行政院/五院/14 部會首長現況",
      "/timeline 民主大事記（1996–2024 共 17 事件）",
      "/people/search、/people/compare、/data/turnout、/data/downloads 上線",
      "2016/2020/2012 正副總統 background 對調 + 統一「全國」摘要 district",
      "2024 不分區立委 34 人實名 + 連結到 /people 個人頁",
      "2024 總統 + 不分區/原住民立委 公報 OCR 政見入庫（80+ 條）",
      "2024 區域立委公報 OCR 持續入庫中",
      "選舉 detail 加候選人選擇器：點各候選人查看其各縣市得票率",
      "個人頁總統選舉勝選縣市 X/22 可摺疊顯示 + 罷免註記紅標",
      "立委趨勢圖加不分區（總數 113 席，Hare quota）",
      "嘉義市 2022 重行選舉 / 2020 高雄市長補選 補入並含 KMT/PFP 候選人",
      "議員選舉直轄市 district 從 code 改為縣市名稱",
    ],
  },
  {
    date: "2026-05",
    title: "政見追蹤 v2 + 公開資料 API 整合",
    items: [
      "政見追蹤升級到 parent/child 子目標結構 + 多源信譽分級",
      "蔣萬安 4 父目標 + 6 子目標完整化（社宅 / 長照 / 都更）",
      "整合 data.taipei 社宅 / 長照 / 都更 3 個公開資料 API",
      "/people/[name] 個人政見追蹤頁面",
      "/government/mayors 矩陣 + 互動地圖",
      "蔣萬安政黨歷程修正（2016 起 KMT，非 2022）",
    ],
  },
  {
    date: "2026-04",
    title: "立法院席次圖 + 候選人搜尋",
    items: [
      "立法院半圓席次圖 (HemicycleChart) + 113 立委名單",
      "/parties/[name] 政黨資訊頁",
      "候選人姓名 → PersonLink 全網一致連結",
      "首頁加入下一場選舉倒數帶",
    ],
  },
  {
    date: "2026-03",
    title: "選舉公報政見 OCR 入庫",
    items: [
      "2022 縣市長公報 OCR 入庫（12 候選人）",
      "2024 立委公報 OCR 入庫（122 候選人）",
      "政見原文加上 PDF anchor 連結",
      "圖片型政見：截圖 + PaddleOCR 文字轉換",
    ],
  },
  {
    date: "2026-02",
    title: "基礎平台啟動",
    items: [
      "中選會公開資料庫 → SQLite 整合",
      "Next.js 16 + FastAPI 雙倉庫專案結構",
      "歷屆選舉清單 + 結果頁",
      "/parties 政黨列表",
      "Vercel + Railway 部署",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          CHANGELOG
        </p>
        <h1 className="article-title font-serif text-3xl sm:text-4xl font-bold leading-tight mb-3">
          更新紀錄
        </h1>
        <p className="text-ink-soft leading-relaxed">
          平台主要功能與資料補強的時間軸。詳細 commit 紀錄請見{" "}
          <a
            href="https://github.com/Yaochieh/taiwan-election-web"
            className="underline underline-offset-2 hover:text-accent-red"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          。
        </p>
      </header>

      <div className="space-y-10">
        {CHANGELOG.map((e) => (
          <section key={e.date} className="border-l-2 border-rule pl-6 relative">
            <div className="absolute -left-[7px] top-1 w-3 h-3 bg-ink rounded-full" />
            <p className="text-xs tracking-wider text-ink-soft mb-1">
              {e.date}
            </p>
            <h2 className="font-serif text-xl font-bold mb-3">{e.title}</h2>
            <ul className="space-y-1.5 text-sm leading-relaxed">
              {e.items.map((it, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-ink-soft shrink-0">·</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="text-xs text-ink-soft border-t border-rule pt-6 mt-12">
        歡迎回報問題或建議：{" "}
        <Link href="/about" className="underline underline-offset-2">
          關於本站
        </Link>
      </p>
    </div>
  );
}
