export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type AsyncResult<T, E = Error> =
  | { status: 'pending' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E }
