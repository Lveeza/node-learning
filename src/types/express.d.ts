declare global {
  namespace Express {
    interface Request {
      id: string;
      valid: { body?: unknown; params?: unknown; query?: unknown };
      userId?: string;
    }
  }
}
export {};