import type { Request, Response, NextFunction } from "express";
import { sendJson } from "./helpers.js";
import { AppError } from "../errors.js";

const CLIENT_ERROR_MESSAGES: Record<string, string> = {
  "entity.parse.failed": "Invalid JSON",
  "entity.too.large": "Body too large",
};

interface HttpError {
  status?: number;
  type?: string;
}

function isClientError(err: unknown): err is HttpError & { status: number } {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    Number.isInteger((err as HttpError).status) &&
    (err as HttpError).status! >= 400 &&
    (err as HttpError).status! < 500
  );
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    sendJson(res, err.status, { error: err.message, details: err.details });
    return;
  }

  if (isClientError(err)) {
    sendJson(res, err.status, {
      error: (err.type && CLIENT_ERROR_MESSAGES[err.type]) ?? "Bad request",
    });
    return;
  }

  req.log.error({ err }, 'Unhandled error')
  sendJson(res, 500, { error: "Internal server error" });
}

