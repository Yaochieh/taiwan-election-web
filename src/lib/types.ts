// 與 FastAPI 端點對應的 TypeScript 型別

export interface Election {
  election_id: number;
  name: string;
  type: "presidential" | "legislative" | "mayoral" | "council" | string;
  date: string;
  status: string;
  description: string | null;
  theme_id: string | null;
}

export interface Party {
  party_id: number;
  name: string;
  abbreviation: string | null;
  color_hex: string | null;
}

export interface Candidate {
  candidate_id: number;
  name: string;
  party_name: string | null;
  abbreviation: string | null;
  color_hex: string | null;
  district: string | null;
  votes: number | null;
  elected: number | null;
}

export interface CandidateDetail extends Candidate {
  background: string | null;
  platform: string | null;
}

export interface CandidateSearchResult {
  name: string;
  district: string | null;
  role: string | null;
  date: string;
  election_name: string;
  election_type: string;
  party_name: string | null;
  votes: number | null;
  elected: number | null;
}

export interface ElectionResult {
  district: string | null;
  candidate_name: string;
  background?: string | null;
  party_name: string | null;
  color_hex: string | null;
  votes: number;
  elected: number;
}

export interface District {
  district: string;
}

export interface Platform {
  seq: number;
  content: string;
  candidate_id?: number | null;
  candidate_name?: string | null;
  party_name?: string | null;
  color_hex?: string | null;
  source_url?: string | null;
  note?: string | null;
  content_raw?: string | null;
}

export interface PlatformSource {
  source_type: string;
  url: string | null;
  local_path: string | null;
  description: string | null;
  fetched_at: string | null;
}

export interface PlatformImage {
  local_path: string;
  url: string | null;
  description: string | null;
  ocr_text: string | null;
}

export interface CandidatePlatformStatus {
  candidate_id: number;
  candidate_name: string;
  party_name: string | null;
  color_hex: string | null;
  district: string | null;
  votes: number | null;
  elected: number | null;
  photo_path: string | null;
  platform_count: number;
  image_count: number;
}

export interface PresidentialTrend {
  date: string;
  candidate_name: string;
  party_name: string | null;
  votes: number;
}

export interface PartyListTrend {
  date: string;
  party_name: string;
  votes: number;
  elected: number | null;
}

export interface MayoralHistory {
  date: string;
  district: string | null;
  candidate_name: string;
  party_name: string | null;
  votes: number;
  election_note?: string | null;
}

export interface LegislatorMember {
  kind: "regional" | "highland" | "lowland" | "party_list";
  district: string;
  candidate: string;
  party: string;
  color_hex: string | null;
  votes: number;
}

export interface LegislaturePartyTotal {
  name: string;
  color_hex: string | null;
  regional: number;
  aboriginal: number;
  party_list: number;
  total: number;
}

export interface LegislatureComposition {
  year: string;
  total_seats: number;
  parties: LegislaturePartyTotal[];
  members: LegislatorMember[];
}

export interface SearchResult {
  query: string;
  total: number;
  candidates: SearchCandidate[];
  parties: SearchParty[];
  elections: Election[];
  platforms: SearchPlatform[];
  ocr: SearchOcr[];
}

export interface SearchCandidate {
  name: string;
  election_count: number;
  sample_election_id: number;
  ever_elected: number;
  parties: string | null;
}

export interface SearchParty {
  party_id: number;
  name: string;
  abbreviation: string | null;
  color_hex: string | null;
}

export interface SearchPlatform {
  platform_id: number;
  candidate_id: number;
  election_id: number;
  candidate_name: string;
  party_name: string | null;
  color_hex: string | null;
  election_name: string;
  election_date: string;
  content: string;
  snippet: string;
}

export interface SearchOcr {
  candidate_id: number;
  election_id: number;
  candidate_name: string;
  party_name: string | null;
  color_hex: string | null;
  election_name: string;
  election_date: string;
  local_path: string;
  snippet: string;
}

export interface PersonProfile {
  name: string;
  photo_path: string | null;
  background: string | null;
  background_source: string | null;
  edu_official: string | null;
  career_official: string | null;
  committees_official: string | null;
  official_source: string | null;
  proposals_count: number | null;
  interpellations_count: number | null;
  votes_count: number | null;
  total_races: number;
  total_wins: number;
  win_rate: number;
  races: PersonRace[];
  party_history: PartyHistoryEntry[];
}

export interface PersonRace {
  candidate_id: number;
  election_id: number;
  election_name: string;
  election_type: string;
  election_date: string;
  election_description: string | null;
  district: string | null;
  party_name: string | null;
  color_hex: string | null;
  votes: number | null;
  elected: number | null;
  platform_count: number;
  image_count: number;
  background?: string | null;
  counties_won?: string[];
  counties_total?: number;
}

export interface PartyHistoryEntry {
  party: string;
  color_hex: string | null;
  from_date: string;
}

export interface ProgressSource {
  url: string | null;
  source_type: string | null;
  publisher: string | null;
  authority_level: number | null;
}

export interface TargetProgress {
  recorded_at: string;
  current_value: number | null;
  note: string | null;
  source_url: string | null;
  sources: ProgressSource[];
}

export interface PlatformTarget {
  target_id: number;
  person_name: string;
  election_id: number | null;
  parent_target_id: number | null;
  category: string | null;
  title: string;
  description: string | null;
  metric_unit: string | null;
  baseline_value: number | null;
  baseline_date: string | null;
  target_value: number | null;
  target_date: string | null;
  status: string;
  data_source_kind: string | null;
  source_url: string | null;
  rank: number;
  election_name: string | null;
  election_date: string | null;
  progress: TargetProgress[];
  progress_pct: number | null;
  latest_value: number | null;
  children: PlatformTarget[];
  tense?: "past" | "future" | "unknown" | null;
  verification_status?:
    | "pending"
    | "verified"
    | "disputed"
    | "not_executed"
    | "in_office"
    | "self_claim"
    | null;
  verification_source?: string | null;
  verification_note?: string | null;
}
