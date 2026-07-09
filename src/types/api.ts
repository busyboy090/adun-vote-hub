export type Role = "SUPER_ADMIN" | "ADMIN" | "ELECTION_OFFICER" | "STUDENT" | string;
export type ElectionStatus = "DRAFT" | "SCHEDULED" | "ACTIVE" | "CLOSED" | string;

export interface User {
  id: string;
  email?: string;
  matricNumber?: string;
  role: Role;
  faculty?: string;
  department?: string;
  level?: string;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  user?: User;
  data?: { accessToken?: string; refreshToken?: string; user?: User };
  [k: string]: unknown;
}

export interface Election {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: ElectionStatus;
  positions?: Position[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Position {
  id: string;
  title: string;
  description?: string;
  electionId: string;
  candidates?: Candidate[];
}

export interface Candidate {
  id: string;
  userId?: string;
  positionId: string;
  manifesto?: string;
  isApproved?: boolean;
  pictureUrl?: string;
  user?: User;
  position?: Position;
}

export interface VoteResult {
  candidateId: string;
  candidateName?: string;
  positionId: string;
  positionTitle?: string;
  votes: number;
  percentage?: number;
}

export interface ElectionResults {
  electionId: string;
  electionTitle?: string;
  totalVotes: number;
  results: VoteResult[];
  winners?: VoteResult[];
}

export interface AuditLog {
  id: string;
  action: string;
  actorId?: string;
  actor?: User;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

// DTOs
export interface AdminLoginDto { email: string; password: string }
export interface StudentLoginDto { matricNumber: string; password: string }
export interface StudentRegisterDto {
  matricNumber: string;
  password: string;
  faculty?: string;
  department?: string;
  level?: string;
}
export interface CreateUserDto {
  email?: string;
  matricNumber?: string;
  password: string;
  role: Role;
}
export interface CreateElectionDto {
  title: string;
  startDate: string;
  endDate: string;
  status?: ElectionStatus;
}
export type UpdateElectionDto = Partial<CreateElectionDto>;
export interface CreatePositionDto {
  title: string;
  description?: string;
  electionId: string;
}
export type UpdatePositionDto = Partial<CreatePositionDto>;
export interface UpdateStudentProfileDto {
  faculty?: string;
  department?: string;
  level?: string;
  isActive?: boolean;
  isVerified?: boolean;
}
export interface UpdateCandidateDto {
  userId?: string;
  positionId?: string;
  manifesto?: string;
  isApproved?: boolean;
}
export interface CreateVoteDto {
  electionId: string;
  positionId: string;
  candidateId: string;
}