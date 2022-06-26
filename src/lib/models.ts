import { Request } from "express";

export interface RpcContext {
  [key: string]: any;
}

export interface RpcRequestContext {
  req: Request;
  context: RpcContext;
}

interface RpcSuccessResponse<T> {
  success: true;
  value: T;
}

interface RpcErrorResponse {
  success: false;
  code: number;
}

export type RpcResponse<T> = RpcSuccessResponse<T> | RpcErrorResponse;

export type InputValidationFn =
  | ((body: any) => boolean)
  | ((body: any) => Promise<boolean>);
