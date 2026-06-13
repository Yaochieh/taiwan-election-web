import Link from "next/link";
import { PersonLink, PartyLink } from "@/components/entity-links";
import { partyColor } from "@/lib/format";

export const metadata = { title: "中央政府 · 正至" };

interface Official {
  role: string;
  name: string;
  party?: string;
  since?: string;
  note?: string;
}

const PRESIDENCY: Official[] = [
  { role: "總統", name: "賴清德", party: "民主進步黨", since: "2024-05-20" },
  { role: "副總統", name: "蕭美琴", party: "民主進步黨", since: "2024-05-20" },
];

const EXEC: Official[] = [
  { role: "行政院長", name: "卓榮泰", party: "民主進步黨", since: "2024-05-20" },
  { role: "行政院副院長", name: "鄭麗君", party: "民主進步黨", since: "2024-05-20" },
  { role: "行政院秘書長", name: "龔明鑫", party: "民主進步黨", since: "2024-05-20" },
];

const FIVE_YUAN: Official[] = [
  { role: "立法院長", name: "韓國瑜", party: "中國國民黨", since: "2024-02-01" },
  { role: "立法院副院長", name: "江啟臣", party: "中國國民黨", since: "2024-02-01" },
  { role: "司法院長", name: "謝銘洋", party: "無黨籍", since: "2024-10-31", note: "代理" },
  { role: "考試院長", name: "周弘憲", party: "無黨籍", since: "2020-09-01" },
  { role: "監察院長", name: "陳菊", party: "無黨籍", since: "2020-08-01" },
];

const MINISTERS: Official[] = [
  { role: "內政部長", name: "劉世芳", party: "民主進步黨" },
  { role: "外交部長", name: "林佳龍", party: "民主進步黨" },
  { role: "國防部長", name: "顧立雄", party: "無黨籍" },
  { role: "財政部長", name: "莊翠雲", party: "無黨籍" },
  { role: "教育部長", name: "鄭英耀", party: "無黨籍" },
  { role: "法務部長", name: "鄭銘謙", party: "無黨籍" },
  { role: "經濟部長", name: "郭智輝", party: "無黨籍" },
  { role: "交通部長", name: "陳世凱", party: "民主進步黨" },
  { role: "勞動部長", name: "洪申翰", party: "民主進步黨" },
  { role: "衛福部長", name: "邱泰源", party: "無黨籍" },
  { role: "農業部長", name: "陳駿季", party: "無黨籍" },
  { role: "文化部長", name: "李遠", party: "無黨籍", note: "原名小野" },
  { role: "數位發展部長", name: "黃彥男", party: "無黨籍" },
  { role: "環境部長", name: "彭啟明", party: "無黨籍" },
];

function OfficialCard({ o }: { o: Official }) {
  const color = o.party ? partyColor(o.party) : "#666";
  return (
    <div
      className="border border-rule p-3 flex flex-col gap-1"
      style={{ borderLeftColor: color, borderLeftWidth: 4 }}
    >
      <div className="text-xs text-ink-soft tracking-wide">{o.role}</div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <PersonLink
          name={o.name}
          color={color}
          className="font-serif text-lg font-bold"
        />
        {o.note && (
          <span className="text-xs text-ink-soft">（{o.note}）</span>
        )}
      </div>
      <div className="text-xs text-ink-soft">
        {o.party && <PartyLink name={o.party} />}
        {o.party && o.since && <span className="mx-1">·</span>}
        {o.since && <span>就任 {o.since}</span>}
      </div>
    </div>
  );
}

export default function CabinetPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <div className="text-sm text-ink-soft mb-3">
          <Link href="/government" className="hover:text-ink">
            ← 政府
          </Link>
        </div>
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          CABINET
        </p>
        <h1 className="article-title font-serif text-4xl sm:text-5xl font-bold leading-tight">
          中央政府
        </h1>
        <p className="text-ink-soft mt-4 leading-relaxed max-w-3xl">
          總統府、行政院、五院首長與主要部會首長現況。資料時間：2024 年 5
          月就任後內閣。
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-serif text-2xl font-bold mb-4 border-b border-ink pb-2">
          總統府
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {PRESIDENCY.map((o) => (
            <OfficialCard key={o.role} o={o} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-serif text-2xl font-bold mb-4 border-b border-ink pb-2">
          行政院核心
        </h2>
        <div className="grid sm:grid-cols-3 gap-2">
          {EXEC.map((o) => (
            <OfficialCard key={o.role} o={o} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-serif text-2xl font-bold mb-4 border-b border-ink pb-2">
          五院首長
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {FIVE_YUAN.map((o) => (
            <OfficialCard key={o.role} o={o} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-serif text-2xl font-bold mb-4 border-b border-ink pb-2">
          主要部會首長
          <span className="ml-3 text-sm font-normal text-ink-soft">
            {MINISTERS.length} 部
          </span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {MINISTERS.map((o) => (
            <OfficialCard key={o.role} o={o} />
          ))}
        </div>
      </section>

      <p className="text-xs text-ink-soft border-t border-rule pt-4">
        資料整理自行政院、總統府、立法院公開資料。如有人事異動歡迎到 GitHub
        回報。
      </p>
    </div>
  );
}
