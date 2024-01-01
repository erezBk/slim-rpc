import {
  RpcContext,
  RpcRequestContext,
  InputValidationFn,
  RpcResponse,
  WebFramework,
} from "./models";

let app: WebFramework<any>;

const arr_to_obj = (arr: string[]) => {
  let result = {};
  arr.forEach((item) => {
    const keys = item.split("/");
    const last_key = keys.pop();
    let current_obj = result;

    keys.forEach((key) => {
      current_obj[key] = current_obj[key] || {};
      current_obj = current_obj[key];
    });

    current_obj[last_key] = item;
  });

  return result;
};

export const create_rpc_server = <T>(params: {
  web_framework: WebFramework<T>;
  create_context: (req: Request) => Promise<RpcContext>;
  routes: T;
}) => {
  const { create_context, web_framework, routes } = params;
  app = web_framework;
  app.inject_ctx_to_each_call("req_context", create_context);

  const all_routes: string[] = [];
  function exec_path(key, value) {
    if (typeof value == "object") {
      Object.entries(value).forEach(([k, v]) => {
        exec_path(`${key}/${k}`, v);
      });
    } else if (typeof value == "function") {
      all_routes.push(key);
      value(key);
    }
  }
  // @ts-ignore
  Object.entries(routes).forEach(([k, v]) => exec_path(k, v));
  // route for client to get the slim-rpc scheme
  app.expose_all_routes("/slim-rpc-scheme", arr_to_obj(all_routes));
};

export const RPC = <IN, OUT>(
  validate_input: InputValidationFn<IN>,
  fn: (input: IN, ctx: RpcRequestContext) => Promise<OUT>
): { query: (input: IN) => Promise<RpcResponse<OUT>> } => {
  const create_route = (path: string) => {
    app.create_route<IN, OUT>("req_context", path, async (input, ctx) => {
      const validation_res = await validate_input(input);
      if (validation_res.type == "success") {
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
          reason: validation_res.reason,
        };
      }
    });
  };
  // @ts-ignore
  return create_route;
};
