# 正至 — 前端

台灣選舉資訊平台的前端。把選舉資料整合在一起：誰選上、當初說了什麼、後來做到了沒。

**線上**：[taiwan-election-web.vercel.app](https://taiwan-election-web.vercel.app)
**後端 repo**：[Yaochieh/taiwan-election](https://github.com/Yaochieh/taiwan-election)（FastAPI + SQLite，含資料處理管線與資料庫）

---

## 技術

Next.js 16（App Router）／TypeScript／Tailwind CSS／Recharts + 自製 SVG（半圓席次圖、台灣地圖），部署於 Vercel。

資料全部來自後端 API，前端不直接接觸資料庫。

## 開發

```bash
npm install
cp .env.example .env.local     # 設定 NEXT_PUBLIC_API_URL
npm run dev                    # http://localhost:3000
```

預設指向線上 API。要接本機後端就把 `.env.local` 改成 `http://localhost:8000`，並在後端 repo 跑 `uvicorn api.main:app --reload --port 8000`。

```bash
npm run build                  # 部署前必須通過
```

## 頁面

| 路徑 | 說明 |
|---|---|
| `/` | 首頁：下一場選舉、兌現追蹤看板、政見×提案精選、現任者記分卡 |
| `/elections`、`/elections/[id]` | 歷屆選舉與單場結果（含鄉鎮市區地圖、罷免開票條） |
| `/people/[name]`、`/people/compare` | 個人頁（參選紀錄、政見、罷免紀錄、跨屆對照）與比較工具 |
| `/parties`、`/parties/[name]` | 政黨與縣市政治版圖 |
| `/platforms`、`/topics`、`/topics/[name]` | 政見瀏覽與主題分類 |
| `/tracker` | 兌現追蹤完整頁 |
| `/issues` | 議題缺口分析（社會嚴重度 × 政治關注度） |
| `/government/*` | 立法院、縣市政府、中央政府現況 |
| `/trends`、`/data/*` | 得票趨勢、投票率、資料來源與方法 |
| `/about`、`/changelog`、`/timeline` | 完成度說明、更新紀錄、民主大事記 |

## 完成度標示

網站仍在建設中。資料還不完整或方法還在調整的功能，會標上 `PREVIEW`（`src/components/preview-badge.tsx`），點擊連到 `/about#status` 的完成度總表。**新增半成品功能時請一併標示** —— 誠實揭露限制比多做一個功能重要。

## 開發注意

完整踩坑紀錄見 [`MEMORY.md`](MEMORY.md)。最常見的幾個：

1. **一律 `.catch(() => [])`** —— 後端在免費層會休眠，冷啟動約一分鐘，build 時也可能還沒部署完。沒有 fallback 會讓整個 build 失敗。
2. **縣市名用「臺」不用「台」** —— 資料庫是「臺北市」，GeoJSON 是「台北市」，對照表在 `src/lib/format.ts` 的 `GEO_NAME_MAP`。
3. **排序縣市用 `sortCounties`**，不要 `localeCompare`。
4. **總統選舉每位正副候選人各有一筆票數且數字相同** —— 加總前要濾掉 `background === "副總統"`，否則票數翻倍。
5. **跨年比較要先正規化地名** —— 臺北縣→新北市、桃園縣→桃園市、縣市合併等，見 `COUNTY_MERGE`。

## 貢獻

歡迎回報錯誤、提供建議或送 PR。資料本身的問題（政見內容、數字錯誤）請開在[後端 repo](https://github.com/Yaochieh/taiwan-election/issues)，介面與呈現的問題開在這裡。

送 PR 前請確認 `npm run build` 通過。

授權：MIT。
