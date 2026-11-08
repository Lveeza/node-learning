// src/errors.js
export class AppError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status = 500, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
    this.status = status;
  }
}

export type ValidationIssue = { field: string; message: string };

export class ValidationError extends AppError {
  details?: ValidationIssue[];
  constructor(message: string, details?: ValidationIssue[]) {
    super(message, 400);
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}
