// src/errors.js
export class AppError extends Error {
  status: number;
  constructor(message : string, status = 500, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
    this.status = status;
  }
}

export type ValidationIssue = { field: string; message: string };

export class ValidationError extends AppError {
  details?: ValidationIssue[];
  constructor(message: string, details: ValidationIssue[]) {
    super(message, 400);
    this.details = details;
  }
}


export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}
