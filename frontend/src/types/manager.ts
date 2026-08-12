export interface Branch {
  id: string;
  name: string;
  address: string;
  employeesCount: number;
  schedule: string;
  dailySales: number;
  status: 'open' | 'closed';
  imageUrl: string;
  minAnticipationMinutes: number;
  maxAnticipationHours: number;
}

export interface BranchUpdateData {
  name: string;
  location: string;
  schedule: string;
  active: boolean;
  imageFile?: File | null;
  minAnticipationMinutes: number;
  maxAnticipationHours: number;
}
