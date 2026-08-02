export interface SchoolBranch {
  id: number;
  name: string;
  companyId: number;
  companyName: string;
  schoolId?: number;
  schoolName?: string | null;
  location: string | null;
  schedule?: string | null;
  imageUrl?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolBranchApi {
  id: number;
  name: string;
  company: number;
  company_name: string;
  school_id: number;
  school_name: string | null;
  location: string | null;
  schedule: string | null;
  image: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchoolCompany {
  id: number;
  name: string;
  ownerName: string;
  contact: string;
  inSchool: boolean;
}

export interface SchoolCompanyApi {
  id: number;
  name: string;
  owner: number;
  owner_name: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchoolCompanyWithMeta extends SchoolCompany {
  branchCount: number;
}
