// import { sendJson } from "./helpers.js";
// import { AppError } from "../errors.js";
// import type { Request, Response, NextFunction } from "express";

// const CLIENT_ERROR_MESSAGES = {
//   'entity.parse.failed': 'Invalid JSON',
//   'entity.too.large': 'Body too large',
// };


// export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
//   if (res.headersSent) return next(err);

//   if (err instanceof AppError) {
//     sendJson(res, err.status, { error: err.message, details: err.details });
//     return;
//   }

//   if (Number.isInteger(err.status) && err.status >= 400 && err.status < 500) {
//     return sendJson(res, err.status, {
//       error: CLIENT_ERROR_MESSAGES[err.type as keyof typeof CLIENT_ERROR_MESSAGES] ?? "Bad request",
//     });
//   }

//   console.error(req.id, err);
//   return sendJson(res, err.status, { error: err.message, details: err.details });
// }

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

  console.error(req.id, err);
  sendJson(res, 500, { error: "Internal server error" });
}

  // return sendJson(res, err.status, { error: err.message, details: err.details });
