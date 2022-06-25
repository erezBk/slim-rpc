import { Request } from "express";

export interface ContextServices {
  [key: string]: any;
}

export interface Context {
  req: Request;
  services: ContextServices;
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
