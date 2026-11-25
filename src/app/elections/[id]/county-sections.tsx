"use client";

import type { ReactNode } from "react";
import { COUNTY_TO_GROUP } from "@/lib/format";
import { PickerBox, PickerRow, PickerChip, PickerHint, queryString, useQueryParams } from "./picker";

/** 歷屆立委結果：73 個選區直接列太長，先選縣市再顯示該縣市各選區。
 *  各選區區塊在伺服器算好一次（ISR），這裡只在瀏覽器端決定顯示哪些。 */

const KEYS = ["county"] as const;

export function CountySections({
  blocks,
  counties,
}: {
  blocks: { county: string; node: ReactNode }[];
  counties: { county: string; n: number }[];
}) {
  const [{ county }, go] = useQueryParams(KEYS);
  const active = county && counties.some((c) => c.county === county) ? county : undefined;
  const total = counties.reduce((s, c) => s + c.n, 0);

  return (
    <>
      <PickerBox>
        <PickerRow label="按縣市瀏覽選區" onClear={active ? () => go({}) : undefined}>
          {counties.map(({ county: c, n }, i) => {
            const group = COUNTY_TO_GROUP.get(c);
            const newGroup = i > 0 && group && group !== COUNTY_TO_GROUP.get(counties[i - 1].county);
            return (
              <span key={c} className="flex items-center gap-2">
                {newGroup && <span className="text-ink-soft mx-1">｜</span>}
                <PickerChip
                  query={queryString({ county: c })}
                  onSelect={() => go({ county: c })}
                  active={c === active}
                  label={c}
                  count={n}
                />
              </span>
            );
          })}
        </PickerRow>
      </PickerBox>
      {active ? (
        blocks.filter((b) => b.county === active).map((b) => b.node)
      ) : (
        <PickerHint>
          共 {total} 個選區、{counties.length} 個縣市，請在上方選縣市開始瀏覽。
        </PickerHint>
      )}
    </>
  );
}
