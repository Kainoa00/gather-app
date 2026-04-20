export class PCCError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly facilityId?: string
  ) {
    super(message)
    this.name = 'PCCError'
  }
}

export class PCCAuthError extends PCCError {
  constructor(message: string, statusCode?: number, facilityId?: string) {
    super(message, statusCode, facilityId)
    this.name = 'PCCAuthError'
  }
}

export class PCCNotFoundError extends PCCError {
  constructor(message: string, statusCode?: number, facilityId?: string) {
    super(message, statusCode, facilityId)
    this.name = 'PCCNotFoundError'
  }
}

export class PCCRateLimitError extends PCCError {
  constructor(message: string, statusCode?: number, facilityId?: string) {
    super(message, statusCode, facilityId)
    this.name = 'PCCRateLimitError'
  }
}

export class PCCConnectionError extends PCCError {
  constructor(message: string, statusCode?: number, facilityId?: string) {
    super(message, statusCode, facilityId)
    this.name = 'PCCConnectionError'
  }
}

export class PCCValidationError extends PCCError {
  constructor(message: string, statusCode?: number, facilityId?: string) {
    super(message, statusCode, facilityId)
    this.name = 'PCCValidationError'
  }
}
