export interface RpcContext {
  author: string;
}

export interface RpcRequestContext {
  //req: Request;
  ctx: RpcContext;
}

interface RpcSuccessResponse<T> {
  type: "success";
  value: T;
}

interface RpcErrorResponse {
  type: "error";
  code: number;
  reason?: string;
}

export type RpcResponse<T> = RpcSuccessResponse<T> | RpcErrorResponse;

export type InputValidationFn<IN> =
  | ((body: IN) => boolean)
  | ((body: IN) => Promise<boolean>);
