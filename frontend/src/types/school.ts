export interface SchoolBranch {
  id: number;
  name: string;
  companyId: number;
  companyName: string;
  location: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolCompany {
  id: number;
  name: string;
  ownerName: string;
  contact: string;
  inSchool: boolean;
}

export interface SchoolCompanyWithMeta extends SchoolCompany {
  branchCount: number;
}
