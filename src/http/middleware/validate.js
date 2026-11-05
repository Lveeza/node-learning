import { ValidationError } from '../../errors.js';

export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || source,
      message: issue.message,
    }));
    return next(new ValidationError('Validation failed', details));
  }

  req.valid ??= {};
  req.valid[source] = result.data; 
  next();

};