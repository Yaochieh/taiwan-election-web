// 將 DB 中的 district 代碼（如 "地區(63, 0, 0)"）轉成中文縣市名

const COUNTY_CODE_MAP: Record<number, string> = {
  0: "全國",
  1: "臺北市", 2: "高雄市", 3: "基隆市", 4: "臺中市",
  5: "臺南市", 6: "新竹市", 7: "嘉義市", 8: "連江縣",
  10: "新北市",
  14: "宜蘭縣", 15: "桃園縣", 16: "新竹縣", 17: "苗栗縣",
  18: "臺中縣", 19: "彰化縣", 20: "南投縣", 21: "雲林縣",
  22: "嘉義縣", 23: "臺南縣", 24: "高雄縣", 25: "屏東縣",
  26: "臺東縣", 27: "花蓮縣", 28: "澎湖縣",
  63: "臺北市", 64: "高雄市", 65: "新北市",
  66: "臺中市", 67: "臺南市", 68: "桃園市",
  9: "金門縣",
};

const TOWNSHIP_TO_COUNTY: Record<string, string> = {
  七美鄉: "澎湖縣", 五峰鄉: "新竹縣", 仁愛鄉: "南投縣",
  信義區: "基隆市", 卓溪鄉: "花蓮縣", 南澳鄉: "宜蘭縣",
  溪州鄉: "彰化縣", 牡丹鄉: "屏東縣", 水林鄉: "雲林縣",
  阿里山鄉: "嘉義縣", 泰安鄉: "苗栗縣", 香山區: "新竹市",
  蘭嶼鄉: "臺東縣", 烏坵鄉: "金門縣", 東引鄉: "連江縣",
  山地門鄉: "屏東縣", 滿洲鄉: "屏東縣",
};

export function cleanDistrict(district: string | null | undefined): string | null {
  if (!district) return null;
  const m = district.match(/^地區\((\d+),\s*0,\s*0\)$/);
  if (m) {
    const code = parseInt(m[1], 10);
    return COUNTY_CODE_MAP[code] ?? district;
  }
  if (district in TOWNSHIP_TO_COUNTY) return TOWNSHIP_TO_COUNTY[district];
  return district;
}

export function formatVotes(votes: number | null | undefined): string {
  if (votes == null) return "—";
  return new Intl.NumberFormat("zh-TW").format(Math.round(votes));
}

export function formatYear(date: string): string {
  return date.slice(0, 4);
}

/**
 * 格式化選舉標籤，避免「2022 111年縣市長選舉」這種視覺混淆。
 * 移除中文標題裡冗餘的「N 年」前綴，改為「2022 年 縣市長選舉（民國 111 年）」。
 */
export function formatElectionLabel(
  date: string,
  name: string,
  description?: string | null,
): string {
  const year = date.slice(0, 4);
  // 從 name 開頭剝掉「111年」「第 X 屆」這類前綴
  const cleanName = name.replace(/^\d{2,3}年/, "").trim();
  let label = `${year} 年 ${cleanName}`;
  // 加民國年註記
  const ad = parseInt(year, 10);
  if (!Number.isNaN(ad)) {
    const minguo = ad - 1911;
    label += `（民國 ${minguo} 年）`;
  }
  if (description) {
    label += ` · ${description}`;
  }
  return label;
}

/**
 * 短版：給卡片標題用，例：「2022 年縣市長選舉」
 */
export function formatElectionLabelShort(
  date: string,
  name: string,
): string {
  const year = date.slice(0, 4);
  const cleanName = name.replace(/^\d{2,3}年/, "").trim();
  return `${year} 年${cleanName}`;
}

/**
 * 格式化得票數 + 百分比。
 */
export function formatVotesWithPct(
  votes: number | null | undefined,
  total: number | null | undefined,
): string {
  if (votes == null) return "—";
  const v = formatVotes(votes);
  if (!total || total === 0) return v;
  const pct = (votes / total) * 100;
  return `${v}（${pct.toFixed(2)}%）`;
}

export function votePct(
  votes: number | null | undefined,
  total: number | null | undefined,
): string | null {
  if (votes == null || !total || total === 0) return null;
  return `${((votes / total) * 100).toFixed(2)}%`;
}

export function partyColor(party: string | null | undefined, fallback?: string | null): string {
  if (!party) return fallback || "#777";
  // 黨色 fallback
  const map: Record<string, string> = {
    民主進步黨: "#1B9E3E",
    中國國民黨: "#000095",
    台灣民眾黨: "#28C8C8",
    時代力量: "#FBBE01",
    親民黨: "#FF6310",
    新黨: "#FFD800",
    台灣基進: "#A73F24",
  };
  return map[party] || fallback || "#555";
}
