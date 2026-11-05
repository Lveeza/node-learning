import { sendJson } from "./helpers.js";
import { AppError } from "../errors.js";

const CLIENT_ERROR_MESSAGES = {
  'entity.parse.failed': 'Invalid JSON',
  'entity.too.large': 'Body too large',
};

export function errorHandler(err, req, res , next) {
  if (res.headersSent)  return next(err);

  if (err instanceof AppError) {
    sendJson(res, err.status, { error: err.message, details: err.details });
    return;
  }

   if (Number.isInteger(err.status) && err.status >= 400 && err.status < 500) {
    return sendJson(res, err.status, {
      error: CLIENT_ERROR_MESSAGES[err.type] ?? 'Bad request',
    });
  }

  console.error(req.id, err);
  return sendJson(res, err.status, { error: err.message, details: err.details });

}
