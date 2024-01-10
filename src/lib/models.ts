export interface RpcContext {
  author: string;
}

export interface RpcRequestContext {
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

export type RpcRouteObject<IN, OUT> = {
  query: (input: IN) => Promise<RpcResponse<OUT>>;
};

export type RpcRouter = Record<
  string,
  Record<string, RpcRouteObject<any, any>>
>;

export type RpcResponse<T> = RpcSuccessResponse<T> | RpcErrorResponse;

export type ValidationResponse =
  | { type: "success" }
  | { type: "error"; reason: string };

export type InputValidationFn<IN> =
  | ((body: IN) => ValidationResponse)
  | ((body: IN) => Promise<ValidationResponse>);

export interface WebFramework {
  expose_all_routes: (path: string, routes: RpcRouter) => void;
  inject_ctx_to_each_call: (
    req_ctx_param_name: string,
    create_context: (req: Request) => Promise<RpcContext>
  ) => void;
  create_route: <IN, OUT>(
    req_context_param_name: string,
    path: string,
    get_res: (input: IN, ctx: RpcContext) => Promise<RpcResponse<OUT>>
  ) => void;
}
