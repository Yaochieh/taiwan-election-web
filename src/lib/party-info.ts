// 主要政黨基本介紹（之後可遷移到 DB）
export interface PartyInfoEntry {
  short: string;
  foundedYear: string;
  intro: string;
  color: string;
  website?: string;
}

import { partyColor } from "./format";

export const PARTY_INFO: Record<string, PartyInfoEntry> = {
  民主進步黨: {
    short: "民進黨",
    foundedYear: "1986",
    color: partyColor("民主進步黨"),
    intro:
      "1986 年 9 月 28 日於台北圓山大飯店成立，由黨外運動人士組成，是台灣第一個本土政黨。主張台灣主體意識、民主與本土化，曾五度贏得總統選舉（2000、2004、2016、2020、2024）。",
    website: "https://www.dpp.org.tw",
  },
  中國國民黨: {
    short: "國民黨",
    foundedYear: "1894",
    color: partyColor("中國國民黨"),
    intro:
      "前身為孫中山 1894 年於檀香山成立的興中會，1919 年改組為中國國民黨。1949 年隨中華民國政府遷台後，曾長期執政至 2000 年首次政黨輪替。主張中華民國法統。",
    website: "https://www.kmt.org.tw",
  },
  台灣民眾黨: {
    short: "民眾黨",
    foundedYear: "2019",
    color: partyColor("台灣民眾黨"),
    intro:
      "2019 年 8 月 6 日由柯文哲創立的政黨，與 1927 年蔣渭水創立的同名政黨無組織關聯。強調「理性、務實、科學」的中間路線。2024 年立委選舉成為第三大黨。",
    website: "https://www.tpp.org.tw",
  },
  時代力量: {
    short: "時代力量",
    foundedYear: "2015",
    color: partyColor("時代力量"),
    intro:
      "2015 年 1 月由太陽花學運後續組織者成立。主張進步、自由、台獨。2016 年國會選舉成為第三大黨，2020 年後因人事更迭與分裂逐漸式微。",
    website: "https://www.newpowerparty.tw",
  },
  親民黨: {
    short: "親民黨",
    foundedYear: "2000",
    color: partyColor("親民黨"),
    intro:
      "2000 年 3 月 31 日由前國民黨員、台灣省長宋楚瑜創立。早期曾為第三大黨，後逐漸轉為小黨。多次與國民黨合作競選總統。",
    website: "https://www.pfp.org.tw",
  },
  新黨: {
    short: "新黨",
    foundedYear: "1993",
    color: partyColor("新黨"),
    intro:
      "1993 年 8 月由國民黨「新國民黨連線」立委分裂成立。主張中華民族主義與兩岸統一。",
    website: "https://www.np.org.tw",
  },
  台灣基進: {
    short: "基進黨",
    foundedYear: "2016",
    color: partyColor("台灣基進"),
    intro:
      "2016 年成立，前身為 2012 年的「基進側翼」。主張台灣獨立、轉型正義，定位為民進黨左翼壓力團體。2020 年立委選舉首次取得 1 席。",
    website: "https://statebuilding.tw",
  },
};
