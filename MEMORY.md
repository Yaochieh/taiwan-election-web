# 正至 · 前端開發備忘

雙倉庫專案：本 repo 是 **前端** — Next.js 16 + TypeScript + Tailwind。
後端：`~/Desktop/Projects/taiwan-election`（Python + FastAPI + SQLite）。

線上：
- 前端 https://taiwan-election-web.vercel.app
- API  https://web-production-f7c522.up.railway.app

## 開發 / 部署

```
npm run dev      # localhost:3000
npm run build    # 一定要過才能 push
```

部署：`git push` → Vercel 自動建。API 連線環境變數
`NEXT_PUBLIC_API_URL`（vercel.json / .env.local）。

## App Router 結構

```
src/
  app/
    layout.tsx           SiteHeader/Footer + JSON-LD
    page.tsx             首頁（hero + 倒數 + 最近總統/縣市長）
    about/                關於頁
    changelog/            更新紀錄
    timeline/             民主大事記
    elections/            選舉列表 + detail
    people/[name]/        個人頁（header / 學歷經歷 / 政黨歷程
                         / 主題雷達 / 政見追蹤 / 參選紀錄）
      compare/            多人並列比較
      search/             featured 政治人物
    parties/[name]/       政黨頁（席次趨勢 / 縣市長 / 總統候選人）
    government/
      cabinet/            總統府/行政院/五院/14 部會
      legislature/        113 立委（含 34 不分區實名）
      mayors/             縣市長矩陣 + 互動地圖
    platforms/            政見篩選 (type/election/district)
    topics/               主題瀏覽（住宅/長照/教育…）
      [name]/             主題詳細（年度趨勢/各黨/最常提及者
                         /量化承諾/政見原文/開放資料來源）
    trends/               總統得票/政黨票/立委席次/縣市政治版圖
    data/turnout|downloads/
    search/               全站搜尋
    elections/[id]/
      page.tsx            election detail + 縣市篩選
      result-treemap.tsx  recharts treemap
      vote-map.tsx        SVG county map + candidate selector
    opengraph-image.tsx   1200×630 OG image
    not-found.tsx error.tsx sitemap.ts robots.ts
  components/
    site-header.tsx site-footer.tsx search-bar.tsx
    entity-links.tsx    PersonLink / PartyLink (全站連結 helper)
    target-card.tsx     政見追蹤卡（含子目標與多源）
    topic-radar.tsx     SVG 雷達圖
  lib/
    api.ts              所有 fetcher
    format.ts           ★ COUNTY_GROUPS / COUNTY_ORDER /
                          sortCounties / partyColor / cleanDistrict
    types.ts            所有回應的 TS interface
    party-info.tsx      政黨基本資料策展
```

## ★ 縣市排序 — 全站統一規則

任何「列縣市」的地方都要用 `lib/format.ts` 的：

```ts
import { COUNTY_GROUPS, COUNTY_ORDER, COUNTY_TO_GROUP, sortCounties } from "@/lib/format";
```

排序：六都 → 其他縣市（北→南）→ 外島
組與組之間放分隔線或紅色 group label：

```tsx
{counties.map((c, idx) => {
  const group = COUNTY_TO_GROUP.get(c);
  const prevGroup = idx > 0 ? COUNTY_TO_GROUP.get(counties[idx-1]) : null;
  const isFirstOfGroup = group && group !== prevGroup;
  return (
    <Row className={isFirstOfGroup ? "border-t-2 border-t-ink/60" : ""}>
      {isFirstOfGroup && <Badge>{group}</Badge>}
      ...
    </Row>
  );
})}
```

已套用：`/government/mayors`、`/trends` 熱力圖、`/elections/[id]` 立委篩選、首頁。

## ★ 地名變遷對照（跨年比較必查）

| 現代名 | 歷史名 | 變更年 |
|---|---|---|
| 新北市 | 臺北縣 | 2010 升格 |
| 桃園市 | 桃園縣 | 2014 升格 |
| 臺中市 | 臺中縣 + 臺中市 | 2010 合併 |
| 臺南市 | 臺南縣 + 臺南市 | 2010 合併 |
| 高雄市 | 高雄縣 + 高雄市 | 2010 合併 |
| 臺北市 | 省轄 → 直轄 | 1967 升格 |

* 任何跨屆熱力圖／政黨版圖／長條比較，前端要用 `COUNTY_MERGE` 把舊縣
  名映射到現直轄市，避免 1996 看不到桃園市等情形。
* 1967 年前的「臺北市」範圍比現在小（士林/北投/南港/內湖/景美/木柵 6
  鄉鎮是 1967 才合併進來），目前不細分。

## ★ 總統選舉的「副總統 row 陷阱」

`election_results` 對每場總統選舉每位 candidate（正、副都算）都有
獨立 row，每縣市 4 組 → 8 筆，兩人票數相同。**計算縣市/全國 pct 時
要過濾 `r.background !== '副總統'`**，否則票數會 ×2 → pct 折半。

已修正點：
- `vote-map.tsx` 的 `focusByCounty` 在 isPresident 時 filter 副統
- 之前 `parties/民主進步黨` 的賴清德縣市票膨脹也是同個原因

## ★「臺」字 vs「台」字

- DB 統一用「臺」字 (U+81FA)
- GeoJSON 有「台」字 (U+53F0)
- `mayors/taiwan-map.tsx` 和 `elections/[id]/vote-map.tsx` 都有
  `GEO_NAME_MAP = { 台北市: "臺北市", ... }` 處理
- `format.ts` COUNTY_CODE_MAP 也統一用「臺」

不要在前端 hardcode「台北市」字串，遲早會錯不見。

## ★ 重要 UI 模式

### 政黨色強調
個人頁 `accent = partyColor(latestParty.party, latestParty.color_hex)`
作為 4px border + 大頭照 + 姓名色。

### Recharts SSR 防呆
所有用 recharts 的 client component 都要 `mount guard`：

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <Placeholder />;
return <ResponsiveContainer>...</ResponsiveContainer>;
```

Safari hydration 會炸 (#310 Rules of Hooks 也要小心，所有 hook
都要在條件 return **之前**)。

### IIFE 在 server component 內計算
頁面內常用 `{(() => { ... })()}` pattern 做就地聚合。

## ★ 資料一定標來源

任何顯示「補來的資料」「潤稿後的政見」「抓出來的關鍵數字」「公開
資料的學經歷」都要在 UI 上加註來源（連結優先；無連結則寫文字「中
選會公報 2024 區域立委 第X選區」）。後端 schema 對應的欄位：

- `platforms.source_url` / `platform_targets.source_url`
- `candidates.background_source`（學經歷補充來源）

前端模式：

```tsx
{platform.source_url && (
  <a href={platform.source_url} className="text-xs text-ink-soft hover:text-accent-red">
    資料來源 →
  </a>
)}
```

OCR 後人工潤稿的政見一定要在卡片上掛一個小 tag「人工整理」+ 來源，
讓使用者可以對照原文公報。

## ★ 不要做的事

1. **不要在 hooks 後面寫 `if (...) return`**（React #310）
2. **不要用 `.sort((a,b) => a.localeCompare(b))` 排縣市** — 改用 `sortCounties`
3. **不要 hardcode「台北市」**（要用「臺北市」）
4. **不要直接 fetch 而不 `.catch(() => [])`** — Railway API 在 build
   時可能還沒 deploy 完，cold start 也可能 timeout
5. **不要在 server component 用 `useState`** — 沒這回事
6. **不要在 client component 用 Server Component dynamic
   imports + ssr:false** — App Router 不支援；用 mount guard 或 Suspense
7. **不要動 `metadataBase`** — 已設為 vercel.app 完整 URL

## 常用 lib/format.ts helper

```ts
formatVotes(n)                  // 1,234,567 格式
formatElectionLabelShort()      // "2024 總統選舉"
votePct(my, total)              // "40.05%"
partyColor(name, color_hex?)    // 政黨顏色 fallback
cleanDistrict(str)              // 「地區(63,0,0)」→「臺北市」
COUNTY_ORDER / COUNTY_GROUPS    // ★ 縣市排序
sortCounties(items, getKey)     // ★ helper
```

## /trends 縣市政治版圖熱力圖

`CountyHeatmap` 是核心元件，用 `COUNTY_TO_GROUP` 自動分隔（六都/其他/外島），
右側列「政黨輪替次數」column（最多次用紅色標）。

## 政見主題 (`/topics`)

- 14 主題（住宅/長照/醫療/教育/交通/環境能源/兩岸外交/國防/勞工/
  經濟/治安/性別/農業/政府改革/文化）
- 每條 platform 可標多主題（platform_topic_links junction，含 score）
- 自動標註腳本在 backend repo: `scripts/tag_platforms_by_topic.py`
- 量化承諾抽取：`scripts/extract_platform_targets.py`
  - 抽「N 萬戶」「N% 比例」「N 年內」
  - 含 tense 欄（past/future/unknown）

## 政府公開資料 registry

`topic_data_sources` 表已 seed 20+ 個 URL（健保署、勞動部、能源署 …）。
主題詳細頁可顯示「想追蹤達標請查這些 API」。

未來要做的：自動抓 API → 對應到 platform_targets 做達標追蹤。
