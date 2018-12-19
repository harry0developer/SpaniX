export interface ViewedJob {
  job_id_fk: number;
  candidate_id_fk: number;
  recruiter_id_fk: number;
  date_viewed: string;
}

export interface SharedJob {
  job_id_fk: number;
  candidate_id_fk: number;
  recruiter_id_fk: number;
  platform: string;
  date_shared: string;
}

export interface AppliedJob {
  job_id_fk: number;
  candidate_id_fk: number;
  recruiter_id_fk: number;
  date_applied: string;
}

export interface ViewedCandidate {
  candidate_id_fk: number;
  recruiter_id_fk: number;
  date_viewed: string;
}
