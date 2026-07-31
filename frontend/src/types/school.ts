export interface SchoolBranch {
  id: string;
  name: string;
  company: string;
  location: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolCompany {
  id: string;
  name: string;
  ownerName: string;
  contact: string;
  inSchool: boolean;
}

export interface SchoolCompanyWithMeta extends SchoolCompany {
  branchCount: number;
}
