import { Request } from "express";
// import { UserDb } from "../example/users/users";

export interface RpcContext {
  [key: string]: any;
  // this is just for DEMOING
  // because I'm unable to Override RpcContext for some reason
  /*  services: {
    users: () => Promise<UserDb>;
  }; */
}

export interface RpcRequestContext {
  //req: Request;
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

export type InputValidationFn<IN> =
  | ((body: IN) => boolean)
  | ((body: IN) => Promise<boolean>);
