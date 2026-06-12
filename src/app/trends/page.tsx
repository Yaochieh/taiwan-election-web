import { getPresidentialTrend, getPartyListTrend } from "@/lib/api";
import { PresidentialChart } from "./presidential-chart";
import { PartyListChart } from "./party-list-chart";

export const metadata = {
  title: "趨勢分析 · 正至",
  description: "總統選舉得票趨勢與立委不分區政黨票歷年變化",
};

export default async function TrendsPage() {
  const [presidential, partyList] = await Promise.all([
    getPresidentialTrend().catch(() => []),
    getPartyListTrend().catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          TRENDS
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight">
          趨勢分析
        </h1>
        <p className="text-ink-soft mt-4 leading-relaxed max-w-3xl">
          從歷次選舉資料觀察政治版圖的變化——總統選舉的兩黨得票對比，
          以及立委不分區政黨票看小黨興衰。
        </p>
      </header>

      <section className="mb-16">
        <h2 className="font-serif text-2xl font-bold mb-3 flex items-baseline gap-3">
          總統選舉
          <span className="text-sm font-normal text-ink-soft">
            1996 — 2024（8 屆）
          </span>
        </h2>
        <p className="text-sm text-ink-soft mb-6 max-w-2xl leading-relaxed">
          台灣自 1996 年首次直選總統以來，每屆主要候選人的全國得票率。
        </p>
        <PresidentialChart data={presidential} />
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold mb-3 flex items-baseline gap-3">
          立委不分區政黨票
          <span className="text-sm font-normal text-ink-soft">
            2008 — 2024（5 屆）
          </span>
        </h2>
        <p className="text-sm text-ink-soft mb-6 max-w-2xl leading-relaxed">
          2008 年起立委採並立制，選民可投政黨票。圖為各屆達 5% 門檻（或有過半席次政黨）得票率。
        </p>
        <PartyListChart data={partyList} />
      </section>
    </div>
  );
}
