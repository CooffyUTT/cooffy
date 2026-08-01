import {
  SchoolBranch,
  SchoolBranchApi,
  SchoolCompany,
  SchoolCompanyApi,
} from "@/types/school";

export function mapSchoolBranch(response: SchoolBranchApi): SchoolBranch {
  return {
    id: response.id,
    name: response.name,
    companyId: response.company,
    companyName: response.company_name,
    schoolId: response.school_id,
    schoolName: response.school_name,
    location: response.location,
    schedule: response.schedule,
    imageUrl: response.image,
    active: response.active,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
  };
}

export function mapSchoolCompany(response: SchoolCompanyApi): SchoolCompany {
  return {
    id: response.id,
    name: response.name,
    ownerName: response.owner_name ?? "Sin gerente asignado",
    contact: "No disponible",
    inSchool: true,
  };
}
