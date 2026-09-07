export const metadata = { title: "關於 · 正至" };

function Stat({ label, value, desc }: { label: string; value: string; desc: string }) {
  return (
    <div className="border border-rule p-3">
      <div className="text-[10px] tracking-widest uppercase text-ink-soft mb-1">
        {label}
      </div>
      <div className="font-serif text-xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-ink-soft">{desc}</div>
    </div>
  );
}

type Stage = "stable" | "preview" | "planned";

const STAGE_STYLE: Record<Stage, { label: string; cls: string }> = {
  stable: { label: "可用", cls: "border-ink text-ink" },
  preview: { label: "PREVIEW", cls: "border-accent-red text-accent-red" },
  planned: { label: "未開始", cls: "border-rule text-ink-soft" },
};

function StageTag({ stage }: { stage: Stage }) {
  const s = STAGE_STYLE[stage];
  return (
    <span
      className={`shrink-0 text-[10px] tracking-widest px-1.5 py-0.5 border ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function FeatureRow({
  stage,
  name,
  note,
}: {
  stage: Stage;
  name: string;
  note: string;
}) {
  return (
    <li className="flex items-baseline gap-3 py-2.5 border-b border-rule last:border-0">
      <StageTag stage={stage} />
      <div className="min-w-0">
        <span className="font-medium">{name}</span>
        <span className="text-ink-soft"> — {note}</span>
      </div>
    </li>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          ABOUT
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight">
          關於正至
        </h1>
      </header>

      <div className="space-y-12 max-w-3xl">
        <section>
          <h2 className="font-serif text-2xl font-bold mb-3">緣起</h2>
          <p className="leading-[1.85]">
            這是一個獨立、開源的台灣資訊整合平台，目前以「政治」為第一個主題。
            起因是每次想找個資料 — 某位立委的政見、某縣市的政黨變遷、某主題被誰提過 — 都要翻好幾個網站，
            索性自己做一個整合的入口，讓大家更容易了解台灣。
          </p>
          <p className="leading-[1.85] mt-3 text-ink-soft">
            這個網站還在建設中。下面誠實列出哪些部分已經可用、哪些還是半成品、
            哪些根本還沒開始 — 歡迎針對任何一項給意見或直接送 PR。
          </p>
        </section>

        <section id="status" className="scroll-mt-24">
          <h2 className="font-serif text-2xl font-bold mb-1">目前完成度</h2>
          <p className="text-sm text-ink-soft mb-4">
            標示 <StageTag stage="preview" /> 的功能可以用，但資料還不完整或方法還在調整，
            請不要當成定論引用。
          </p>

          <h3 className="text-xs tracking-widest uppercase text-ink-soft mt-6 mb-1">
            選舉結果
          </h3>
          <ul className="text-sm">
            <FeatureRow
              stage="stable"
              name="歷屆選舉結果"
              note="1994 年起 80 場已舉行選舉，總統／立委／縣市長／議員的候選人與得票"
            />
            <FeatureRow
              stage="stable"
              name="總統選舉鄉鎮層級"
              note="1996–2024，18,418 筆鄉鎮市區得票"
            />
            <FeatureRow
              stage="stable"
              name="投票率、政黨席次趨勢、縣市政治版圖"
              note="含縣市合併升格的歷史名稱對照"
            />
            <FeatureRow
              stage="stable"
              name="2025 大罷免"
              note="33 案審定結果，含同意票門檻與中選會來源"
            />
          </ul>

          <h3 className="text-xs tracking-widest uppercase text-ink-soft mt-6 mb-1">
            政見
          </h3>
          <ul className="text-sm">
            <FeatureRow
              stage="preview"
              name="政見全文"
              note="883 條，全部來自選舉公報原檔。但覆蓋率還低（見下方表格），尤其議員完全沒有"
            />
            <FeatureRow
              stage="preview"
              name="主題分類"
              note="15 個主題、4,965 個標籤，由關鍵字自動標註，準確度尚未系統性驗證"
            />
            <FeatureRow
              stage="preview"
              name="量化承諾抽取"
              note="1,692 筆，由 AI 從政見全文抽出數字目標，可能漏抽或誤判"
            />
            <FeatureRow
              stage="preview"
              name="跨屆政見對照"
              note="同一人前後兩屆政見並列，標出延續／新增／不再提"
            />
          </ul>

          <h3 className="text-xs tracking-widest uppercase text-ink-soft mt-6 mb-1">
            兌現追蹤
          </h3>
          <ul className="text-sm">
            <FeatureRow
              stage="preview"
              name="旗艦承諾追蹤"
              note="20 條人工查證、附官方統計來源的承諾。這是精選示範，不是全面追蹤"
            />
            <FeatureRow
              stage="preview"
              name="政見 × 立院提案對照"
              note="65 位立委、1,317 筆關鍵詞比對。相關提案不等於已兌現"
            />
            <FeatureRow
              stage="preview"
              name="議題缺口分析"
              note="政治關注度只採計 759 位有政見的候選人，樣本偏差大，趨勢僅供參考"
            />
          </ul>

          <h3 className="text-xs tracking-widest uppercase text-ink-soft mt-6 mb-1">
            還沒開始
          </h3>
          <ul className="text-sm">
            <FeatureRow
              stage="planned"
              name="議員政見"
              note="4,924 位議員候選人，公報多為影像版，需大量 OCR"
            />
            <FeatureRow
              stage="planned"
              name="2026 縣市長選舉"
              note="11/28 投票。登記名單與公報出來後會第一時間收錄"
            />
            <FeatureRow
              stage="planned"
              name="2016 / 2012 立委政見"
              note="公報量大且多為影像版"
            />
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold mb-3">政見覆蓋率</h2>
          <p className="text-sm text-ink-soft mb-4">
            這是目前最大的缺口，也最需要時間補。政見一律從公報原檔抽取，
            寧可留白也不用其他來源腦補。
          </p>
          <div className="border border-rule">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-rule text-xs tracking-widest uppercase text-ink-soft">
                  <th className="text-left font-normal p-2.5">選舉類型</th>
                  <th className="text-right font-normal p-2.5">候選人</th>
                  <th className="text-right font-normal p-2.5">有政見</th>
                  <th className="text-right font-normal p-2.5">覆蓋率</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                <tr className="border-b border-rule">
                  <td className="p-2.5">縣市長</td>
                  <td className="text-right p-2.5">620</td>
                  <td className="text-right p-2.5">240</td>
                  <td className="text-right p-2.5">38.7%</td>
                </tr>
                <tr className="border-b border-rule">
                  <td className="p-2.5">立法委員</td>
                  <td className="text-right p-2.5">3,451</td>
                  <td className="text-right p-2.5">513</td>
                  <td className="text-right p-2.5">14.9%</td>
                </tr>
                <tr className="border-b border-rule">
                  <td className="p-2.5">總統／副總統</td>
                  <td className="text-right p-2.5">50</td>
                  <td className="text-right p-2.5">6</td>
                  <td className="text-right p-2.5">12.0%</td>
                </tr>
                <tr>
                  <td className="p-2.5">縣市議員</td>
                  <td className="text-right p-2.5">4,924</td>
                  <td className="text-right p-2.5">0</td>
                  <td className="text-right p-2.5">0%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-ink-soft mt-3 leading-relaxed">
            總統政見偏低是法規造成的：2024 年以前的總統副總統選舉公報，
            依選罷法第 44 條僅刊登個人資料、不含政見，2023 年修法後 2024 年才首度刊登。
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold mb-3">已知限制</h2>
          <ul className="space-y-2.5 text-sm leading-relaxed">
            <li>
              · <strong>政見來自 OCR</strong>，公報多為掃描影像，辨識可能有錯字或斷行問題。
              每條政見都保留原始 OCR 文字可對照，發現錯誤歡迎回報。
            </li>
            <li>
              · <strong>主題分類與量化承諾由 AI 自動產生</strong>，會漏會錯。
              分類只要政見出現關鍵字就會被歸類，不代表候選人真的著墨該議題。
            </li>
            <li>
              · <strong>兌現追蹤只有 20 條</strong>，是逐條人工查證的示範，不是全面盤點。
              沒被追蹤的承諾不代表沒兌現，只代表還沒做到那條。
            </li>
            <li>
              · <strong>承諾兌現的功勞歸屬很複雜</strong>。有些目標由中央政策達成、
              有些跨越多任期、有些查核單位有爭議 — 這類情況都在頁面上標註說明，請一併閱讀。
            </li>
            <li>
              · <strong>後端跑在免費方案上</strong>，深夜第一次造訪可能要等約一分鐘喚醒。
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold mb-3">目前資料覆蓋</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <Stat label="收錄選舉" value="91 場" desc="1994 年起，含 2026 待辦" />
            <Stat label="候選人" value="9,045 位" desc="跨選舉聚合" />
            <Stat label="得票紀錄" value="9,077 筆" desc="含縣市/選區層級" />
            <Stat label="鄉鎮級得票" value="18,418 筆" desc="總統 1996–2024" />
            <Stat label="政見全文" value="883 條" desc="OCR + PDF 解析" />
            <Stat label="量化承諾" value="1,692 筆" desc="AI 自動抽取" />
            <Stat label="罷免案" value="33 案" desc="2025 大罷免" />
            <Stat label="政黨" value="410 個" desc="含歷史小黨" />
          </div>
          <p className="text-xs text-ink-soft mt-3">
            數字隨資料補入會持續成長；最新狀態以 GitHub commit 紀錄為準。
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold mb-3">資料來源</h2>
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              ·{" "}
              <a
                href="https://db.cec.gov.tw"
                className="underline underline-offset-2 hover:text-accent-red"
                target="_blank"
                rel="noreferrer"
              >
                中央選舉委員會選舉資料庫
              </a>{" "}
              — 選舉結果、候選人名單
            </li>
            <li>
              ·{" "}
              <a
                href="https://bulletin.cec.gov.tw"
                className="underline underline-offset-2 hover:text-accent-red"
                target="_blank"
                rel="noreferrer"
              >
                中選會選舉公報
              </a>{" "}
              — 候選人政見原始 PDF
            </li>
            <li>
              ·{" "}
              <a
                href="https://ly.govapi.tw"
                className="underline underline-offset-2 hover:text-accent-red"
                target="_blank"
                rel="noreferrer"
              >
                立法院開放資料
              </a>{" "}
              — 立委學經歷、提案紀錄
            </li>
            <li>
              · 各部會與地方政府公開統計 — 承諾兌現進度，逐筆標註來源與擷取日期
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold mb-3">關於資料正確性</h2>
          <p className="leading-[1.85]">
            這個網站的程式主要由 AI 協作完成，作者負責出題、審核與把關。
            開發過程中曾發生 AI 用自身知識「腦補」政見內容的事故 —
            後來把所有無法對照公報原檔的資料全部刪除重建，並建立了防止再犯的機制：
          </p>
          <ul className="space-y-2 text-sm leading-relaxed mt-4">
            <li>· 政見一律從公報原檔抽取，保留原始 OCR 文字供對照，寧可留白也不補寫</li>
            <li>· AI 整理過的內容要與原文比對達八成重疊才採用，未達標就刪除</li>
            <li>· 每筆資料都記錄來源（公報檔名、官方網址、擷取日期）</li>
            <li>· 資料庫更新前必須通過真實性稽核腳本與 42 項自動測試，CI 會擋</li>
          </ul>
          <p className="leading-[1.85] mt-4 text-ink-soft">
            即便如此仍難免有錯。看到任何可疑的數字或內容，請直接開 issue 或送 PR —
            所有原始資料與處理腳本都在 GitHub 上，歡迎查核。
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold mb-3">開源專案</h2>
          <p className="leading-[1.85]">
            「正至」採用 MIT 授權，資料處理腳本、資料庫與前後端程式全部公開。
            歡迎指正錯誤、提供建議或貢獻程式碼。
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a
              href="https://github.com/Yaochieh/taiwan-election-web"
              className="inline-block px-4 py-2 border border-ink hover:bg-ink hover:text-paper transition"
              target="_blank"
              rel="noreferrer"
            >
              前端 GitHub →
            </a>
            <a
              href="https://github.com/Yaochieh/taiwan-election"
              className="inline-block px-4 py-2 border border-ink hover:bg-ink hover:text-paper transition"
              target="_blank"
              rel="noreferrer"
            >
              後端 GitHub →
            </a>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold mb-3">技術架構</h2>
          <ul className="space-y-1 text-sm">
            <li>· 前端：Next.js 16 + TypeScript + Tailwind CSS，部署於 Vercel</li>
            <li>· 後端：FastAPI + SQLite，部署於 Render</li>
            <li>· 資料處理：PaddleOCR 解析公報影像，LLM 分段與標註</li>
            <li>· 視覺化：Recharts + 自製 SVG 半圓席次圖、台灣地圖</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
