export const metadata = { title: "中央政府 · 正至" };

export default function CabinetPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="border-b border-rule pb-8 mb-10">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-3">
          CABINET
        </p>
        <h1 className="font-serif text-4xl font-bold">中央政府</h1>
        <p className="text-ink-soft mt-3">總統、副總統、行政院首長。</p>
      </header>
      <div className="border border-rule p-8 text-center text-ink-soft">
        <p className="font-serif text-xl mb-3">此頁面建置中</p>
        <p className="text-sm max-w-xl mx-auto leading-relaxed">
          將整合總統府、行政院、各部會首長與政務官資料。
          資料來源預計引用行政院新聞傳播處與各部會官網。
        </p>
      </div>
    </div>
  );
}
