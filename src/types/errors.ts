export const ErrorCodes = {
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  PARSE_ERROR: 'PARSE_ERROR',
  IMPORT_ERROR: 'IMPORT_ERROR',
  EXPORT_ERROR: 'EXPORT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

export class BookmarkError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: string
  ) {
    super(message)
    this.name = 'BookmarkError'
  }
} 