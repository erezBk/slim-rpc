export interface RpcContext {
  author: string;
}

export interface RpcRequestContext {
  //req: Request;
  ctx: RpcContext;
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
