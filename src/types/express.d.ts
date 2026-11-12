declare global {
  namespace Express {
    interface Request {
      valid: { body?: unknown; params?: unknown; query?: unknown };
      userId?: string;
    }
  }
}
export {};