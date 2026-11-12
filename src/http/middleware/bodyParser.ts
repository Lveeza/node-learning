import { readJsonBody } from "../helpers.js";
import type { Request, Response, NextFunction } from "express";

export async function bodyParser(req: Request, res: Response, next: NextFunction) {
  if (req.method !== "POST" && req.method !== "PUT" && req.method !== "PATCH") {
    return next();
  }

  const body = await readJsonBody(req);
  req.body = body;
  await next();
}
