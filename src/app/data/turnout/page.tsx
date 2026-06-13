import Link from "next/link";

export const metadata = { title: "投票率 · 正至" };

interface Row {
  year: number;
  date: string;
  pct: number;
  voters: number; // 萬人，總投票人數
  registered: number; // 萬人，選舉人數
  note?: string;
}

// 中選會公開資料；歷屆總統選舉投票率
const PRESIDENTIAL: Row[] = [
  { year: 1996, date: "1996-03-23", pct: 76.04, voters: 1057, registered: 1409 },
  { year: 2000, date: "2000-03-18", pct: 82.69, voters: 1264, registered: 1546 },
  { year: 2004, date: "2004-03-20", pct: 80.28, voters: 1305, registered: 1655 },
  { year: 2008, date: "2008-03-22", pct: 76.33, voters: 1322, registered: 1731 },
  { year: 2012, date: "2012-01-14", pct: 74.38, voters: 1345, registered: 1809 },
  { year: 2016, date: "2016-01-16", pct: 66.27, voters: 1245, registered: 1878 },
  { year: 2020, date: "2020-01-11", pct: 74.9, voters: 1465, registered: 1931 },
  { year: 2024, date: "2024-01-13", pct: 71.86, voters: 1418, registered: 1955 },
];

// 立委選舉投票率（單獨舉行的年份）
const LEGISLATIVE: Row[] = [
  { year: 1995, date: "1995-12-02", pct: 67.65, voters: 921, registered: 1361 },
  { year: 1998, date: "1998-12-05", pct: 68.09, voters: 968, registered: 1422 },
  { year: 2001, date: "2001-12-01", pct: 66.16, voters: 1018, registered: 1539 },
  { year: 2004, date: "2004-12-11", pct: 59.16, voters: 988, registered: 1670 },
  { year: 2008, date: "2008-01-12", pct: 58.5, voters: 1009, registered: 1725 },
  { year: 2012, date: "2012-01-14", pct: 74.72, voters: 1352, registered: 1809, note: "與總統合辦" },
  { year: 2016, date: "2016-01-16", pct: 66.58, voters: 1251, registered: 1878, note: "與總統合辦" },
  { year: 2020, date: "2020-01-11", pct: 74.86, voters: 1446, registered: 1931, note: "與總統合辦" },
  { year: 2024, date: "2024-01-13", pct: 71.97, voters: 1407, registered: 1955, note: "與總統合辦" },
];

// 縣市長（直轄市+縣市）投票率
const MAYORAL: Row[] = [
  { year: 2010, date: "2010-11-27", pct: 70.65, voters: 612, registered: 866 },
  { year: 2014, date: "2014-11-29", pct: 67.59, voters: 1227, registered: 1815 },
  { year: 2018, date: "2018-11-24", pct: 66.11, voters: 1235, registered: 1869 },
  { year: 2022, date: "2022-11-26", pct: 59.86, voters: 1136, registered: 1898 },
];

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex-1 bg-rule h-4 overflow-hidden">
      <div
        className="h-4 flex items-center justify-end pr-2 text-paper text-xs font-bold"
        style={{ width: `${pct}%`, backgroundColor: color }}
      >
        {pct >= 18 ? pct.toFixed(2) + "%" : ""}
      </div>
    </div>
  );
}

function Table({
  rows,
  color,
  title,
  subtitle,
}: {
  rows: Row[];
  color: string;
  title: string;
  subtitle: string;
}) {
  const sorted = rows.slice().sort((a, b) => a.year - b.year);
  const avg = sorted.reduce((a, b) => a + b.pct, 0) / sorted.length;
  return (
    <section className="mb-12">
      <h2 className="font-serif text-2xl font-bold mb-2">{title}</h2>
      <p className="text-sm text-ink-soft mb-4">{subtitle}</p>
      <div className="grid grid-cols-[60px_1fr_160px_60px] sm:grid-cols-[80px_1fr_220px_80px] gap-x-3 gap-y-2 items-center text-sm">
        {sorted.map((r) => (
          <div key={r.year} className="contents">
            <div className="font-serif tabular-nums">{r.year}</div>
            <Bar pct={r.pct} color={color} />
            <div className="text-xs text-ink-soft tabular-nums">
              {r.voters} / {r.registered} 萬
            </div>
            <div className="text-xs text-ink-soft text-right">
              {r.note ?? ""}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-ink-soft mt-4 pt-3 border-t border-rule">
        平均 {avg.toFixed(2)}%
      </p>
    </section>
  );
}

export default function TurnoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <div className="text-sm text-ink-soft mb-3">
          <Link href="/data" className="hover:text-ink">
            ← 數據資料
          </Link>
        </div>
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          TURNOUT
        </p>
        <h1 className="article-title font-serif text-3xl sm:text-4xl font-bold leading-tight mb-3">
          歷屆選舉投票率
        </h1>
        <p className="text-ink-soft leading-relaxed max-w-3xl">
          投票率 = 投票人數 ÷ 選舉人數。可看出公民政治參與度的變化。
        </p>
      </header>

      <Table
        rows={PRESIDENTIAL}
        color="#000095"
        title="總統選舉"
        subtitle="1996 年首次直選後共 8 屆。1996 投票率 76%，最低 2016 年 66%，最高 2000 年 83%。"
      />

      <Table
        rows={MAYORAL}
        color="#1B9431"
        title="縣市長（含直轄市）"
        subtitle="九合一選舉（2010 起）四年一次。2022 年投票率僅 59.86%，創新低。"
      />

      <Table
        rows={LEGISLATIVE}
        color="#FF6310"
        title="立法委員"
        subtitle="與總統合辦時投票率拉升。單獨舉辦的 2008、2004 立委選舉投票率較低（58–60%）。"
      />

      <p className="text-xs text-ink-soft mt-6 border-t border-rule pt-4">
        資料來源：中央選舉委員會選舉資料庫公告，數字四捨五入到小數第二位。
      </p>
    </div>
  );
}
