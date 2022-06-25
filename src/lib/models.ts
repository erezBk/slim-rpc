import { Request } from "express";

export interface Context {
  [key: string]: any;
}

export interface RequestContext {
  req: Request;
  context: Context;
}

interface SuccessResponse<T> {
  success: true;
  value: T;
}

interface ErrorResponse {
  success: false;
  code: number;
}

export type Response<T> = SuccessResponse<T> | ErrorResponse;
