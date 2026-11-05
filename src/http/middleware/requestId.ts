import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodType } from "zod";
import { randomUUID } from "node:crypto";

export function requestId(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const id = randomUUID();
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
}

type Source = "body" | "params" | "query";
export const validate =
  (schema: ZodType, source: Source = "body"): RequestHandler =>
  (req, res, next) => {
    const id = randomUUID();
    req.id = id;
    res.setHeader("X-Request-Id", id);
    next();
  };
