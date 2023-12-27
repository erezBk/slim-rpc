import {
  RpcContext,
  RpcRequestContext,
  InputValidationFn,
  RpcResponse,
  WebFramework,
} from "./models";

let app: WebFramework<unknown>;
let routes_to_init = [];

export const create_rpc_server = <T>(params: {
  web_framework: WebFramework<T>;
  create_context: (req: Request) => Promise<RpcContext>;
  routes: T;
}) => {
  const { create_context, web_framework, routes } = params;
  app = web_framework;
  // route for client to get the slim-rpc scheme
  app.expose_all_routes("/slim-rpc-scheme", routes);
  app.inject_ctx_to_each_call("req_context", create_context);
  if (routes_to_init.length > 0) {
    routes_to_init.forEach((fn) => fn());
  }
};

export const RPC = <IN, OUT>(
  name: string,
  validate_input: InputValidationFn<IN>,
  fn: (input: IN, ctx: RpcRequestContext) => Promise<OUT>
): { query: (input: IN) => Promise<RpcResponse<OUT>> } => {
  const create_route = () => {
    app.create_route<IN, OUT>("req_context", name, async (input, ctx) => {
      const is_valid = await validate_input(input);
      if (is_valid) {
        try {
          const value = await fn(input, {
            ctx,
          });
          return {
            type: "success",
            value,
          };
        } catch (error) {
          const { message } = error as Error;
          return {
            type: "error",
            code: 500,
            reason: message,
          };
        }
      } else {
        return {
          type: "error",
          code: 400,
          reason: "bad input",
        };
      }
    });
  };
  if (app) {
    create_route();
  } else {
    routes_to_init.push(create_route);
  }
  return {
    // @ts-ignore
    query: name,
  };
};
