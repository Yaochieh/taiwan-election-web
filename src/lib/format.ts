// 將 DB 中的 district 代碼（如 "地區(63, 0, 0)"）轉成中文縣市名

const COUNTY_CODE_MAP: Record<number, string> = {
  1: "台北市", 2: "高雄市", 3: "基隆市", 4: "台中市",
  5: "台南市", 6: "新竹市", 7: "嘉義市",
  10: "新北市",
  14: "宜蘭縣", 15: "桃園縣", 16: "新竹縣", 17: "苗栗縣",
  18: "台中縣", 19: "彰化縣", 20: "南投縣", 21: "雲林縣",
  22: "嘉義縣", 23: "台南縣", 24: "高雄縣", 25: "屏東縣",
  26: "台東縣", 27: "花蓮縣", 28: "澎湖縣",
  63: "台北市", 64: "高雄市", 65: "新北市",
  66: "台中市", 67: "台南市", 68: "桃園市",
  9: "金門縣",
};

const TOWNSHIP_TO_COUNTY: Record<string, string> = {
  七美鄉: "澎湖縣", 五峰鄉: "新竹縣", 仁愛鄉: "南投縣",
  信義區: "基隆市", 卓溪鄉: "花蓮縣", 南澳鄉: "宜蘭縣",
  溪州鄉: "彰化縣", 牡丹鄉: "屏東縣", 水林鄉: "雲林縣",
  阿里山鄉: "嘉義縣", 泰安鄉: "苗栗縣", 香山區: "新竹市",
  蘭嶼鄉: "台東縣", 烏坵鄉: "金門縣", 東引鄉: "連江縣",
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
