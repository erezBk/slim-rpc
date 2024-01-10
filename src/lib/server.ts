import {
  RpcContext,
  RpcRequestContext,
  WebFramework,
  RpcRouteObject,
  RpcRouter,
} from "./models";
import { SafeParseError, Schema } from "zod";
let app: WebFramework;

const arr_to_obj = (arr: string[]) => {
  let result = {};
  arr.forEach((item) => {
    const keys = item.split("/");
    const last_key = keys.pop();
    let current_obj = result;

    keys.forEach((key) => {
      // @ts-ignore
      current_obj[key] = current_obj[key] || {};
      // @ts-ignore
      current_obj = current_obj[key];
    });
    // @ts-ignore
    current_obj[last_key] = item;
  });

  return result;
};

export const create_rpc_server = (params: {
  web_framework: WebFramework;
  create_context: (req: Request) => Promise<RpcContext>;
  routes: RpcRouter;
}) => {
  const { create_context, web_framework, routes } = params;
  app = web_framework;
  app.inject_ctx_to_each_call("req_context", create_context);

  const all_routes: string[] = [];
  // @ts-ignore
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
  zod_scheme: Schema,
  fn: (input: IN, ctx: RpcRequestContext) => Promise<OUT>
): RpcRouteObject<IN, OUT> => {
  const create_route = (path: string) => {
    app.create_route<IN, OUT>("req_context", path, async (input, ctx) => {
      const validation_res = await zod_scheme.safeParse(input);

      if (validation_res.success) {
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
          reason: (validation_res as SafeParseError<any>).error.issues
            .map((d) => d.message)
            .join(", "),
        };
      }
    });
  };
  // @ts-ignore
  return create_route;
};
