import { Response, Request } from 'express';

// This is for TS, after passing context into Apollo
export interface MyContext {
  req: Request;
  res: Response;
  payload: { userId: string };
}
