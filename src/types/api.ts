export interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

export interface ApiErrorDetail {
  msg?: string;
  message?: string;
  field?: string;
  loc?: string[];
  path?: string[] | string;
  location?: string;
  type?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details: ApiErrorDetail[];
  isNetworkError: boolean;
  isAuthError: boolean;
}
