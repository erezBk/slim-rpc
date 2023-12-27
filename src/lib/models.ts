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

// TODO: NOT GOOD !! need to improve

export interface WebFramework<T> {
  expose_all_routes: (path: string, routes: T) => void;
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

/* 
 
 extract_body_from_req
 send_json_response


*/
