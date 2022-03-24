import { Request } from "express";
export interface Context {
  req: Request;
  services: any;
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
