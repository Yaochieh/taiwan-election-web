import Link from "next/link";

export const metadata = { title: "更新紀錄 · 正至" };

interface Entry {
  date: string;
  title: string;
  items: string[];
}

const CHANGELOG: Entry[] = [
  {
    date: "2026-09-08",
    title: "對外收官：把「哪些能用、哪些是半成品」講清楚",
    items: [
      "全站加上 PREVIEW 標示：政見、主題分類、兌現追蹤、議題缺口等仍在建設中的功能都標記出來，點擊可看完成度說明",
      "「關於」頁新增完成度總表（可用／PREVIEW／未開始）與政見覆蓋率表——誠實列出縣市議員政見目前是 0%",
      "「關於」頁新增已知限制與「關於資料正確性」：說明曾發生 AI 腦補政見的事故，以及後來建立的四道防線",
      "「開放資料 API」頁改為「資料來源與方法」：說明資料從哪來、六步處理流程、哪些地方需要保留懷疑",
      "關閉對外的 API 說明書介面（/docs、/redoc、/openapi.json）",
    ],
  },
  {
    date: "2026-09-07",
    title: "後端搬家（Railway → Render）",
    items: [
      "Railway 免費試用期到期、所有部署被回收，網站後端一度全數離線；已搬到 Render 免費層恢復",
      "部署依賴從 14 個套件精簡到 4 個（API 實際只用得到這些），記憶體用量降到 99MB",
      "加上白天時段自動喚醒，減少免費方案閒置休眠造成的等待",
    ],
  },
  {
    date: "2026-07-06",
    title: "大罷免結果、跨屆政見對照",
    items: [
      "2025 大罷免 33 案完整結果入庫：審定票數、同意門檻、中選會來源",
      "選舉頁加罷免開票條（同意／不同意＋門檻刻度）、人物頁加罷免紀錄區塊",
      "跨屆政見對照：同一人前後兩屆政見雙欄並列，標出延續／新增／不再提",
      "2018 縣市長政見補齊：當選者 22/22 全數到位，整體覆蓋 75/93",
      "政見卡標示「含 N 條可驗證承諾」，未抽取的選舉不誤標",
      "292 筆學經歷來源回填歸零（270 筆公報＋22 筆結構註記）",
      "查證確認：2024 以前的總統公報依選罷法不刊政見，總統政見覆蓋率低是法規造成的",
    ],
  },
  {
    date: "2026-07-05",
    title: "兌現追蹤上線——從「政見清單」變成「說到做到了嗎」",
    items: [
      "首頁「說到，做到了嗎？」開票式看板 + /tracker 完整頁上線",
      "旗艦承諾逐條對照政府公開統計，每筆都附來源網址與擷取日期",
      "進度以「上任後新增」計算，不把前任的成績算到現任頭上",
      "揭露歸屬爭議：由中央政策達成、跨越多任期、查核單位有爭議的都標註說明",
      "政見 × 立院提案對照上線（65 位立委、1,118 筆），並標注「零相關提案」",
      "選舉日曆：中選會選務時程時間軸（登記→抽籤→名單→政見發表會→投票）",
      "每日自動抓取官方統計更新進度（內政部社宅、能源署再生能源、台中社宅）",
      "量化承諾支援中文數字（三分之一、翻倍），tense 標注區分「政績」與「承諾」",
      "2020 立委政見潤稿收官 199/199、立法院官方學經歷 374 位",
    ],
  },
  {
    date: "2026-07-04",
    title: "資料真實性總清查 + 發現總統票數膨脹",
    items: [
      "清除所有無法對照公報原檔的政見，全庫政見 100% 保留原始 OCR 可回溯查證",
      "重大修正：總統選舉的縣市／鄉鎮票數曾 4 倍／3 倍膨脹，共修正 17,216 筆——因為百分比與排名不受影響，這個錯誤長期沒被發現",
      "建立真實性稽核腳本 + 42 項自動測試 + CI 把關，資料庫更新前必須全過",
      "政見頁的總統選舉改為正副總統合併顯示為一組",
    ],
  },
  {
    date: "2026-06-18",
    title: "政見 LLM 整理 + 承諾問責查證",
    items: [
      "用 Claude API 把 OCR 政見結構化整理（去雜訊、去重、抽量化目標），97 組碎片合併",
      "量化目標標註「政績」(已完成) vs「承諾」(競選新提) tense 分類",
      "承諾問責查證：用選舉結果判定 — 落選者承諾標「未當選·未執行」、當選者標「當選·可追蹤」",
      "政績標「待考證」或「自我宣稱·未查證」（落選者競選時自述）",
      "政見追蹤改版：有量化數字用卡片、無數字用精簡列，分政績/承諾兩區",
      "/people/compare 加政見主題對照長條圖（比較誰更重視各議題）",
      "首頁現任執政者卡片加大頭照 + 政績/承諾計數",
      "2016/2020 立委公報 OCR 補完中（166 位歷史立委政見）",
    ],
  },
  {
    date: "2026-06-17",
    title: "夜間自動補強：政見人工潤稿 + 維基百科背景",
    items: [
      "113 屆 73 位區域立委政見全部潤稿（含黃捷/王世堅/賴瑞隆/羅智強/徐巧芯等）",
      "2024 不分區 16 政黨 + 9 位個別立委（沈伯洋/范雲/黃國昌/黃珊珊）政見補完",
      "2008–2024 歷屆總統正副 22 位 + 1996/2000/2004 22 位政見潤稿（含李登輝/陳水扁/馬英九/蔡英文）",
      "縣市長 2010/2014/2018/2022 大選 60 位政見潤稿；1997/2001/2005 77 位按區域類型 template 補完",
      "1997/2001/2005/2009 舊縣市長 district 從 votedata.zip 重 import（298 筆，含臺北縣→新北市等）",
      "升格前舊縣（高雄縣等）熱力圖合併到升格後直轄市，方便跨年比較",
      "總統選舉 vote-map 「focus 單一候選人」百分比計算修正副統 row 折半 bug",
      "platforms 加 content_raw 欄位 + DB trigger 自動保留 OCR 原文",
      "platform 卡片支援「顯示原始 OCR」摺疊區 + 人工潤稿/OCR 清理/自動拆條 chip 標示",
      "OCR 二次清理 154 條 + 長 OCR 自動拆條 79 → 1045 條 platforms",
      "/topics 主題列表加柱狀進度條 + 排序；19 個政府開放資料來源 seed 進主題頁",
      "/people/[name] 加最新政見預覽 section + 維基百科簡介 section（含原文連結）",
      "/parties/[name] 加縣市政治版圖（依六都/縣市/外島分組，深淺顯示勝場次數）",
      "/search 加主題篩選 chip；空查詢時顯示所有主題入口",
      "About 緣起改寫（AI 開發 + 政治優先 + 歡迎貢獻）",
      "維基百科自動補 471 位政治人物簡介（含 zh.wikipedia.org URL 來源連結）",
      "CLAUDE.md / MEMORY.md 加上：地名變遷對照表、總統副統 row 陷阱、來源必標規則",
    ],
  },
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
      "2024 區域立委 219/309 候選人完成 OCR + 11 個單一選區縣市補完",
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
