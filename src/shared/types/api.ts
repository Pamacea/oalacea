export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface ApiResponse<T> {
  data: T
  error?: ApiError
  meta?: {
    timestamp: string
    version: string
  }
}
