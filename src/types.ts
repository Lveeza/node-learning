export type Note = { id: string; text: string; createdAt: string; updatedAt?: string };
export interface ListQuery {
  limit: number;
  offset: number;
  q?: string;
}
export type UserRecord = { id: string; email: string; passwordHash: string };