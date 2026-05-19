/**
 * Generic paginated response shape used by all list endpoints.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Standard error response shape returned by services.
 */
export interface ApiError {
  code: string;
  message: string;
  correlationId: string;
  details?: Record<string, unknown>;
}
