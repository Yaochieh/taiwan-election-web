import Link from "next/link";
import { getMayoralHistory, getPresidentialTrend, getPartyListTrend } from "@/lib/api";
import { partyColor, formatVotes } from "@/lib/format";

export const metadata = {
  title: "政黨資訊 · 正至",
  description: "台灣主要政黨的介紹、創黨年、累計選舉成績",
};

// 主要政黨基本資訊（這部分目前是手動策展；之後可移到 DB）
const PARTY_INFO: Record<
  string,
  {
    short: string;
    foundedYear: string;
    intro: string;
    leader?: string;
    color: string;
  }
> = {
  民主進步黨: {
    short: "民進黨",
    foundedYear: "1986",
    color: partyColor("民主進步黨"),
    intro:
      "1986 年 9 月 28 日於台北圓山大飯店成立，由黨外運動人士組成，是台灣第一個本土政黨。主張台灣主體意識、民主與本土化，曾五度贏得總統選舉。",
  },
  中國國民黨: {
    short: "國民黨",
    foundedYear: "1894",
    color: partyColor("中國國民黨"),
    intro:
      "前身為孫中山 1894 年於檀香山成立的興中會。1949 年隨中華民國政府遷台後，曾長期執政至 2000 年首次政黨輪替。主張中華民國法統。",
  },
  台灣民眾黨: {
    short: "民眾黨",
    foundedYear: "2019",
    color: partyColor("台灣民眾黨"),
    intro:
      "2019 年 8 月由柯文哲創立的政黨，與 1927 年蔣渭水創立的同名政黨無組織關聯。強調「理性、務實、科學」的中間路線。",
  },
  時代力量: {
    short: "時代力量",
    foundedYear: "2015",
    color: partyColor("時代力量"),
    intro:
      "2015 年 1 月由太陽花學運後續組織者成立。主張進步、自由、台獨。2016 年成為第三大黨，後因人事更迭與分裂逐漸式微。",
  },
  親民黨: {
    short: "親民黨",
    foundedYear: "2000",
    color: partyColor("親民黨"),
    intro:
      "2000 年由前國民黨員宋楚瑜創立。早期曾為第三大黨，後逐漸轉為小黨。多次與國民黨合作競選總統。",
  },
  新黨: {
    short: "新黨",
    foundedYear: "1993",
    color: partyColor("新黨"),
    intro:
      "1993 年由國民黨「新國民黨連線」立委分裂成立。主張中華民族主義與兩岸統一。",
  },
  台灣基進: {
    short: "基進黨",
    foundedYear: "2016",
    color: partyColor("台灣基進"),
    intro:
      "2016 年成立，前身為 2012 年的「基進側翼」。主張台灣獨立、轉型正義，定位為民進黨左翼壓力團體。",
  },
};

const FEATURED_ORDER = [
  "民主進步黨",
  "中國國民黨",
  "台灣民眾黨",
  "時代力量",
  "親民黨",
  "新黨",
  "台灣基進",
];

export default async function PartiesPage() {
  const [mayoralHistory, presidentialTrend, partyListTrend] = await Promise.all([
    getMayoralHistory().catch(() => []),
    getPresidentialTrend().catch(() => []),
    getPartyListTrend().catch(() => []),
  ]);

  // 統計各黨累計：
  // - 縣市長當選次數
  // - 總統當選次數（取每屆得票最高者作為當選）
  // - 不分區歷年得票率（取最近一屆）
  const stats: Record<
    string,
    { mayorWins: number; presidentialWins: number; latestPartyListPct?: number }
  > = {};
  for (const p of FEATURED_ORDER) {
    stats[p] = { mayorWins: 0, presidentialWins: 0 };
  }

  for (const h of mayoralHistory) {
    if (h.party_name && stats[h.party_name]) {
      stats[h.party_name].mayorWins += 1;
    }
  }

  // 總統：每年只算最高票
  type PresRow = typeof presidentialTrend[number];
  const presByYear = new Map<string, PresRow[]>();
  for (const r of presidentialTrend) {
    const y = r.date.slice(0, 4);
    if (!presByYear.has(y)) presByYear.set(y, []);
    presByYear.get(y)!.push(r);
  }
  for (const list of presByYear.values()) {
    const top = list.sort((a, b) => b.votes - a.votes)[0];
    if (top.party_name && stats[top.party_name]) {
      stats[top.party_name].presidentialWins += 1;
    }
  }

  // 最近一屆不分區
  const latestPL = [...partyListTrend].sort((a, b) =>
    b.date.localeCompare(a.date),
  )[0]?.date;
  if (latestPL) {
    const sameYear = partyListTrend.filter((r) => r.date === latestPL);
    const total = sameYear.reduce((a, b) => a + b.votes, 0);
    for (const r of sameYear) {
      if (stats[r.party_name]) {
        stats[r.party_name].latestPartyListPct = (r.votes / total) * 100;
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          PARTIES
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight">
          政黨資訊
        </h1>
        <p className="text-ink-soft mt-4 leading-relaxed max-w-3xl">
          台灣主要政黨的簡介與選舉成績。資料涵蓋 1994 年首屆民選縣市長、1996 年首屆民選總統至今。
        </p>
      </header>

      <section className="space-y-12">
        {FEATURED_ORDER.map((name) => {
          const info = PARTY_INFO[name];
          const s = stats[name];
          if (!info) return null;
          return (
            <article
              key={name}
              className="border-t-2 pt-6"
              style={{ borderColor: info.color }}
            >
              <div className="grid sm:grid-cols-12 gap-6">
                <div className="sm:col-span-4">
                  <Link
                    href={`/parties/${encodeURIComponent(name)}`}
                    className="block hover:opacity-80 transition"
                  >
                    <h2
                      className="font-serif text-3xl font-bold mb-1 hover:underline underline-offset-4"
                      style={{ color: info.color }}
                    >
                      {name}
                    </h2>
                  </Link>
                  <p className="text-sm text-ink-soft mb-3">
                    <span className="font-medium text-ink">{info.short}</span>
                    <span className="mx-2">·</span>
                    成立於 {info.foundedYear} 年
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <Stat
                      label="總統當選"
                      value={s.presidentialWins}
                      color={info.color}
                    />
                    <Stat
                      label="縣市長累計"
                      value={s.mayorWins}
                      color={info.color}
                    />
                    <Stat
                      label="2024 政黨票"
                      value={
                        s.latestPartyListPct
                          ? `${s.latestPartyListPct.toFixed(1)}%`
                          : "—"
                      }
                      color={info.color}
                    />
                  </div>
                </div>
                <div className="sm:col-span-8">
                  <p className="leading-[1.85] text-ink">{info.intro}</p>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="border-t-2 border-ink mt-16 pt-8">
        <h2 className="font-serif text-2xl font-bold mb-4">小型政黨</h2>
        <p className="text-ink-soft leading-relaxed max-w-3xl">
          除上述主要政黨外，台灣登記的政黨超過 350 個。歷年曾推派候選人並達一定影響力的尚有：
          綠黨、基進黨、社會民主黨、健保免費連線、台灣維新、無黨團結聯盟、台灣團結聯盟（已解散）等。
          更完整的政黨資料可參考{" "}
          <a
            href="https://moi.gov.tw"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-accent-red"
          >
            內政部
          </a>
          。
        </p>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="border border-rule p-2">
      <p className="text-[10px] tracking-widest uppercase text-ink-soft mb-1">
        {label}
      </p>
      <p
        className="font-serif text-2xl font-bold tabular-nums"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}
