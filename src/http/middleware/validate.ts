import { ValidationError } from '../../errors.js';
import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

type Source = "body" | "query" | "params";

export const validate = (schema: ZodType, source: Source = "body") => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || source,
      message: issue.message,
    }));
    return next(new ValidationError('Validation failed', details));
  }

  req.valid ??= {} as Request["valid"];
  req.valid[source] = result.data; 
  next();

};