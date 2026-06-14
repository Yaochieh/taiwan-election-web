import Link from "next/link";

export const metadata = { title: "民主時間軸 · 正至" };

interface Event {
  date: string;
  title: string;
  desc: string;
  type: "election" | "milestone" | "scandal" | "policy";
}

const EVENTS: Event[] = [
  {
    date: "1996-03-23",
    title: "首次總統直選",
    desc: "李登輝以 54.0% 當選第 9 任總統，台灣首位民選總統。投票率 76.04%。",
    type: "election",
  },
  {
    date: "2000-03-18",
    title: "首次政黨輪替",
    desc: "陳水扁以 39.3% 當選第 10 任總統，民進黨首次執政，結束國民黨 55 年連續統治。",
    type: "election",
  },
  {
    date: "2004-03-20",
    title: "319 槍擊事件後總統選舉",
    desc: "陳水扁以 50.1% 勝出（差距 0.22%）；國民黨/親民黨陣營抗議選舉結果。投票率 80.3%。",
    type: "election",
  },
  {
    date: "2005-06-07",
    title: "國民大會通過修憲，廢除任務型國大",
    desc: "立委席次從 225 席減為 113 席（73 區域 + 6 原住民 + 34 不分區），單一選區兩票制。",
    type: "milestone",
  },
  {
    date: "2008-01-12",
    title: "首次依新制立委選舉",
    desc: "113 席中國民黨拿下 81 席（72%），民進黨僅 27 席。投票率 58.5%。",
    type: "election",
  },
  {
    date: "2008-03-22",
    title: "第二次政黨輪替",
    desc: "馬英九以 58.4% 當選第 12 任總統，國民黨重返執政。",
    type: "election",
  },
  {
    date: "2010-12-25",
    title: "五都改制完成",
    desc: "新北、桃園（後 2014）、臺中、臺南、高雄合併縣市為直轄市；臺北市保留。",
    type: "milestone",
  },
  {
    date: "2014-03-18",
    title: "太陽花學運",
    desc: "立法院因服貿協議審查爭議遭學生占領 23 天，影響國民黨年底地方選舉。",
    type: "milestone",
  },
  {
    date: "2014-11-29",
    title: "九合一大選 KMT 大敗",
    desc: "民進黨拿下 13 席縣市長，國民黨僅剩 6 席。柯文哲（無黨）當選臺北市長。",
    type: "election",
  },
  {
    date: "2016-01-16",
    title: "首位女性總統當選",
    desc: "蔡英文以 56.1% 當選；民進黨同時取得立法院過半（68/113）首次全面執政。",
    type: "election",
  },
  {
    date: "2018-11-24",
    title: "10 案公投與九合一選舉",
    desc: "韓國瑜當選高雄市長；同性婚姻、東奧正名等 10 案公投。國民黨拿下 15 縣市。",
    type: "election",
  },
  {
    date: "2019-05-24",
    title: "亞洲首部同婚專法施行",
    desc: "司法院釋字 748 號施行法通過，台灣成為亞洲首個同性婚姻合法的國家。",
    type: "policy",
  },
  {
    date: "2020-01-11",
    title: "蔡英文連任 + 民進黨繼續執政",
    desc: "蔡英文以 57.1%（817 萬票，史上最高）連任。香港反送中影響選情。",
    type: "election",
  },
  {
    date: "2020-06-06",
    title: "韓國瑜罷免案通過",
    desc: "高雄市長韓國瑜遭罷免，是首位被罷免的直轄市長。投票率 42%，同意 97%。",
    type: "election",
  },
  {
    date: "2022-11-26",
    title: "九合一大選 民進黨重挫",
    desc: "民進黨僅保住 5 席縣市長，蔡英文辭黨主席。蔣萬安當選臺北市長。",
    type: "election",
  },
  {
    date: "2024-01-13",
    title: "三黨不過半的立法院",
    desc: "賴清德以 40.05% 當選第 16 任總統；民進黨立委席次從 62 降到 51，國民黨 52、民眾黨 8。",
    type: "election",
  },
  {
    date: "2024-05-17",
    title: "國會改革法案 + 青鳥行動",
    desc: "立法院藍白聯手三讀國會職權修正案；大批民眾包圍立院抗議，後憲法法庭判定多條違憲。",
    type: "milestone",
  },
];

const TYPE_STYLE: Record<Event["type"], { label: string; color: string }> = {
  election: { label: "選舉", color: "#000095" },
  milestone: { label: "里程碑", color: "#1B9431" },
  scandal: { label: "爭議事件", color: "#C00000" },
  policy: { label: "政策", color: "#FF6310" },
};

export default function TimelinePage() {
  const sorted = EVENTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          TIMELINE
        </p>
        <h1 className="article-title font-serif text-3xl sm:text-4xl font-bold leading-tight mb-3">
          台灣民主大事記
        </h1>
        <p className="text-ink-soft leading-relaxed max-w-2xl">
          1996 年首次總統直選以來的重要選舉、政治事件與政策里程碑。
          幫助理解台灣政治演變脈絡。
        </p>
      </header>

      <div className="space-y-8">
        {sorted.map((e) => {
          const meta = TYPE_STYLE[e.type];
          return (
            <article
              key={e.date + e.title}
              className="border-l-2 pl-6 relative"
              style={{ borderColor: meta.color }}
            >
              <div
                className="absolute -left-[7px] top-1 w-3 h-3 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <div className="flex items-baseline gap-3 mb-1">
                <p className="font-serif text-base tabular-nums">{e.date}</p>
                <span
                  className="text-xs px-2 py-0.5 text-paper"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.label}
                </span>
              </div>
              <h2 className="font-serif text-xl font-bold mb-2">{e.title}</h2>
              <p className="text-sm leading-relaxed text-ink-soft">{e.desc}</p>
            </article>
          );
        })}
      </div>

      <p className="text-xs text-ink-soft border-t border-rule pt-6 mt-12">
        歡迎{" "}
        <a
          href="https://github.com/Yaochieh/taiwan-election-web"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-ink"
        >
          GitHub
        </a>{" "}
        補充重要事件。資料來源：中央選舉委員會、維基百科、新聞報導。
      </p>
    </div>
  );
}
