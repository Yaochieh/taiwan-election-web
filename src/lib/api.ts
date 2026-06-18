import type {
  Election,
  Candidate,
  CandidateDetail,
  CandidateSearchResult,
  Party,
  Platform,
  PlatformSource,
  PlatformImage,
  CandidatePlatformStatus,
  PresidentialTrend,
  PartyListTrend,
  MayoralHistory,
  District,
  ElectionResult,
  LegislatureComposition,
  SearchResult,
  PersonProfile,
  PlatformTarget,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const IMAGE_BASE = `${API_URL}/static/bulletin_images`;

async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 3600 }, // 1 小時 ISR 快取
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${path} → ${res.status}`);
  }
  return res.json();
}

// ── elections ────────────────────────────────────────────────
export const getElections = () => fetcher<Election[]>("/elections");
export const getElection = (id: number) => fetcher<Election>(`/elections/${id}`);
export const getElectionDistricts = (id: number) =>
  fetcher<District[]>(`/elections/${id}/districts`);
export const getElectionResults = (id: number, district?: string) => {
  const q = district ? `?district=${encodeURIComponent(district)}` : "";
  return fetcher<ElectionResult[]>(`/elections/${id}/results${q}`);
};
export type TownshipResult = {
  county: string;
  township: string;
  votes: number;
  candidate_name: string;
  background: string | null;
  party_name: string | null;
  color_hex: string | null;
};
export const getTownshipResults = (id: number, county?: string) => {
  const q = county ? `?county=${encodeURIComponent(county)}` : "";
  return fetcher<TownshipResult[]>(`/elections/${id}/townships${q}`);
};

// ── candidates ──────────────────────────────────────────────
export const getCandidates = (electionId: number) =>
  fetcher<Candidate[]>(`/candidates?election_id=${electionId}`);
export const getCandidate = (id: number) =>
  fetcher<CandidateDetail>(`/candidates/${id}`);
export const searchCandidates = (q: string) =>
  fetcher<CandidateSearchResult[]>(`/candidates/search?q=${encodeURIComponent(q)}`);

// ── parties ─────────────────────────────────────────────────
export const getParties = () => fetcher<Party[]>("/parties");

// ── platforms ───────────────────────────────────────────────
export const getElectionsWithPlatforms = () =>
  fetcher<Election[]>("/platforms/elections");

export const getElectionPlatforms = (electionId: number) =>
  fetcher<Platform[]>(`/platforms/elections/${electionId}`);

export const getCandidatesStatus = (electionId: number, district?: string) => {
  const q = district ? `?district=${encodeURIComponent(district)}` : "";
  return fetcher<CandidatePlatformStatus[]>(
    `/platforms/elections/${electionId}/candidates-status${q}`,
  );
};

export const getCandidatePlatforms = (candidateId: number, electionId: number) =>
  fetcher<Platform[]>(`/platforms/candidates/${candidateId}?election_id=${electionId}`);

export const getCandidatePlatformSources = (candidateId: number, electionId: number) =>
  fetcher<PlatformSource[]>(
    `/platforms/candidates/${candidateId}/sources?election_id=${electionId}`,
  );

export const getCandidatePlatformImages = (candidateId: number, electionId: number) =>
  fetcher<PlatformImage[]>(
    `/platforms/candidates/${candidateId}/images?election_id=${electionId}`,
  );

// ── trends ──────────────────────────────────────────────────
export const getPresidentialTrend = () =>
  fetcher<PresidentialTrend[]>("/trends/presidential");
export const getPartyListTrend = () =>
  fetcher<PartyListTrend[]>("/trends/party-list");

// ── mayoral ─────────────────────────────────────────────────
export const getMayoralHistory = () =>
  fetcher<MayoralHistory[]>("/mayoral/history");

// ── legislature ─────────────────────────────────────────────
export const getLegislatureComposition = (year: string) =>
  fetcher<LegislatureComposition>(`/legislature/${year}`);

export type LegislativeSeatTrend = {
  year: string;
  party: string;
  color_hex: string | null;
  seats: number;
};
export const getLegislativeSeatTrend = () =>
  fetcher<LegislativeSeatTrend[]>("/legislature/trend/seats");

export type CountyWinnerCell = {
  year: string;
  county: string;
  party: string;
  color_hex: string | null;
  pct: number;
  candidate?: string;
};
export const getPresidentialCountyWinners = (mergeOld = true) =>
  fetcher<CountyWinnerCell[]>(
    `/trends/presidential/county-winners?merge_old=${mergeOld}`,
  );
export const getMayoralCountyWinners = (mergeOld = true) =>
  fetcher<CountyWinnerCell[]>(
    `/trends/mayoral/county-winners?merge_old=${mergeOld}`,
  );

// ── topics ──────────────────────────────────────────────────
export type Topic = {
  topic_id: number;
  name: string;
  icon: string;
  rank: number;
  platform_count: number;
};
export type TopicPlatform = {
  platform_id: number;
  content: string;
  score: number;
  candidate_id: number;
  candidate_name: string;
  election_id: number;
  election_date: string;
  election_name: string;
  election_type: string;
  election_desc: string | null;
  district: string | null;
  party_name: string | null;
  color_hex: string | null;
};
export type TopicStats = {
  topic: string;
  by_year: { year: string; n: number }[];
  by_party: { party: string; color_hex: string | null; n: number }[];
  by_person: {
    name: string;
    party: string;
    color_hex: string | null;
    times: number;
    total_score: number;
  }[];
  by_type: { type: string; n: number }[];
  data_sources?: { label: string; url: string; notes: string | null }[];
};

export const getTopics = () => fetcher<Topic[]>("/topics");
export const getTopicPlatforms = (
  name: string,
  filters?: {
    election_type?: string;
    party?: string;
    person?: string;
    year_from?: number;
    year_to?: number;
  },
) => {
  const params = new URLSearchParams();
  if (filters?.election_type) params.set("election_type", filters.election_type);
  if (filters?.party) params.set("party", filters.party);
  if (filters?.person) params.set("person", filters.person);
  if (filters?.year_from) params.set("year_from", String(filters.year_from));
  if (filters?.year_to) params.set("year_to", String(filters.year_to));
  const q = params.toString();
  return fetcher<TopicPlatform[]>(
    `/topics/${encodeURIComponent(name)}${q ? "?" + q : ""}`,
  );
};
export const getTopicStats = (name: string) =>
  fetcher<TopicStats>(`/topics/${encodeURIComponent(name)}/stats`);

export type AutoTarget = {
  target_id: number;
  person_name: string;
  title: string;
  description: string;
  metric_unit: string;
  target_value: number;
  election_id: number | null;
  source_platform_id: number | null;
  status: string;
  election_date: string | null;
  election_name: string | null;
  election_type: string | null;
  election_desc: string | null;
  party_name: string | null;
  color_hex: string | null;
  tense?: "past" | "future" | "unknown" | null;
  verification_status?:
    | "pending"
    | "verified"
    | "disputed"
    | "not_executed"
    | "in_office"
    | "self_claim"
    | null;
};
export const getTopicAutoTargets = (name: string) =>
  fetcher<AutoTarget[]>(`/topics/${encodeURIComponent(name)}/targets`);

export type TopicDistribution = {
  topic: string;
  icon: string;
  n: number;
  total_score: number;
};
export const getPersonTopicDistribution = (name: string) =>
  fetcher<TopicDistribution[]>(
    `/people/${encodeURIComponent(name)}/topic-distribution`,
  );

// ── search ─────────────────────────────────────────────────
export const search = (q: string, limit = 30) =>
  fetcher<SearchResult>(`/search?q=${encodeURIComponent(q)}&limit=${limit}`);

// ── people ─────────────────────────────────────────────────
export const getPersonProfile = (name: string) =>
  fetcher<PersonProfile>(`/people/${encodeURIComponent(name)}`);

export const getPersonTargets = (name: string) =>
  fetcher<PlatformTarget[]>(`/people/${encodeURIComponent(name)}/targets`);

// ── image URL helper ────────────────────────────────────────
export const bulletinImageUrl = (localPath: string): string => {
  // local_path 是 "data/bulletin_images/49/蔣萬安_1.png"
  // 對應 static mount: /static/bulletin_images/49/蔣萬安_1.png
  const stripped = localPath.replace(/^data\/bulletin_images\//, "");
  return `${IMAGE_BASE}/${stripped}`;
};

// 公報整頁 OCR 圖：data/bulletin_pages/01臺北市市長_p1.png
export const bulletinPageUrl = (localPath: string): string => {
  const stripped = localPath.replace(/^data\/bulletin_pages\//, "");
  return `${API_URL}/static/bulletin_pages/${stripped}`;
};

// 從 local_path 自動判斷對應 URL（依目錄）
export const sourceLocalPathUrl = (localPath: string): string | null => {
  if (!localPath) return null;
  if (localPath.startsWith("data/bulletin_pages/")) return bulletinPageUrl(localPath);
  if (localPath.startsWith("data/bulletin_images/")) return bulletinImageUrl(localPath);
  return null;
};

const PHOTO_BASE = `${API_URL}/static/candidate_photos`;
export const candidatePhotoUrl = (localPath: string | null | undefined): string | null => {
  if (!localPath) return null;
  const stripped = localPath.replace(/^data\/candidate_photos\//, "");
  return `${PHOTO_BASE}/${stripped}`;
};

// ── 議題缺口 ──────────────────────────────────────────────
export type FertilityGap = {
  topic: string;
  severity_source: string;
  births: { year: number; births: number }[];
  drop_pct: number | null;
  attention: { platforms: number; people: number; total_people: number; pct: number };
  attention_keywords: string[];
};
export const getFertilityGap = () =>
  fetcher<FertilityGap>("/issues/fertility");
