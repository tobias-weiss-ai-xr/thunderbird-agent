// src/utils/errors.ts
// Custom error types for thunderbird-mcp

/**
 * Base error class for Thunderbird MCP errors
 */
export class ThunderbirdMCPError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ThunderbirdMCPError';
  }
}

/**
 * Error when Thunderbird extension is not connected
 */
export class ExtensionNotConnectedError extends ThunderbirdMCPError {
  constructor(message = 'Thunderbird extension is not connected') {
    super(message, 'EXTENSION_NOT_CONNECTED');
    this.name = 'ExtensionNotConnectedError';
  }
}

/**
 * Error when communication with extension times out
 */
export class ExtensionTimeoutError extends ThunderbirdMCPError {
  constructor(timeoutMs: number) {
    super(`Extension response timeout after ${timeoutMs}ms`, 'EXTENSION_TIMEOUT', { timeoutMs });
    this.name = 'ExtensionTimeoutError';
  }
}

/**
 * Error when HTTP server fails to start
 */
export class HTTPServerStartError extends ThunderbirdMCPError {
  constructor(port: number, originalError: Error) {
    super(
      `Failed to start HTTP server on port ${port}: ${originalError.message}`,
      'HTTP_SERVER_START_ERROR',
      { port, originalError: originalError.message }
    );
    this.name = 'HTTPServerStartError';
  }
}

/**
 * Error when Thunderbird WebExtension API call fails
 */
export class ThunderbirdAPIError extends ThunderbirdMCPError {
  constructor(action: string, originalError: Error) {
    super(
      `Thunderbird API call failed for action '${action}': ${originalError.message}`,
      'THUNDERBIRD_API_ERROR',
      { action, originalError: originalError.message }
    );
    this.name = 'ThunderbirdAPIError';
  }
}

/**
 * Error when message format is invalid
 */
export class InvalidMessageFormatError extends ThunderbirdMCPError {
  constructor(message: string, reason: string) {
    super(
      `Invalid message format: ${message} - ${reason}`,
      'INVALID_MESSAGE_FORMAT',
      { message, reason }
    );
    this.name = 'InvalidMessageFormatError';
  }
}

/**
 * Error when validation fails
 */
export class ValidationError extends ThunderbirdMCPError {
  constructor(field: string, value: any, constraint: string) {
    super(
      `Validation failed for '${field}': ${constraint}`,
      'VALIDATION_ERROR',
      { field, value, constraint }
    );
    this.name = 'ValidationError';
  }
}

/**
 * Error when operation is not supported
 */
export class OperationNotSupportedError extends ThunderbirdMCPError {
  constructor(operation: string, reason?: string) {
    super(
      `Operation '${operation}' is not supported${reason ? `: ${reason}` : ''}`,
      'OPERATION_NOT_SUPPORTED',
      { operation, reason }
    );
    this.name = 'OperationNotSupportedError';
  }
}

/**
 * Helper to determine if an error is a known ThunderbirdMCPError
 */
export function isThunderbirdMCPError(error: any): error is ThunderbirdMCPError {
  return error instanceof ThunderbirdMCPError;
}

/**
 * Convert any error to a ThunderbirdMCPError format
 */
export function normalizeError(error: any): ThunderbirdMCPError {
  if (isThunderbirdMCPError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new ThunderbirdMCPError(
      error.message,
      'UNKNOWN_ERROR',
      { originalError: error.name, stack: error.stack }
    );
  }

  if (typeof error === 'string') {
    return new ThunderbirdMCPError(error, 'UNKNOWN_ERROR');
  }

  return new ThunderbirdMCPError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    { originalError: error }
  );
}

/**
 * Validate and format error for user-facing messages
 */
export function formatError(error: any): {
  success: false;
  error: string;
  code?: string;
  details?: any;
} {
  const normalized = normalizeError(error);

  return {
    success: false,
    error: normalized.message,
    code: normalized.code,
    details: normalized.details
  };
}