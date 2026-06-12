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

// ── image URL helper ────────────────────────────────────────
export const bulletinImageUrl = (localPath: string): string => {
  // local_path 是 "data/bulletin_images/49/蔣萬安_1.png"
  // 對應 static mount: /static/bulletin_images/49/蔣萬安_1.png
  const stripped = localPath.replace(/^data\/bulletin_images\//, "");
  return `${IMAGE_BASE}/${stripped}`;
};
