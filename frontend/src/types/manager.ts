export interface Branch {
  id: string;
  name: string;
  address: string;
  employeesCount: number;
  schedule: string;
  dailySales: number;
  status: 'open' | 'closed';
  imageUrl: string;
}