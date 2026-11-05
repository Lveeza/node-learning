import type { Request, Response, NextFunction } from "express";

export async function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(`[${req.id}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  await next();
}