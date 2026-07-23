export type MasterDataStatus = "all" | "active" | "inactive";

export type MasterDataParams = {
  search?: string;
  status?: MasterDataStatus;
  page?: string;
  pageSize?: string;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
};

export type ActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type RackRecord = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};