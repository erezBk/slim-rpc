import {
  RpcContext,
  RpcRequestContext,
  WebFramework,
  RpcRouteObject,
  RpcRouter,
} from "./models";
import { SafeParseError, Schema } from "zod";
let app: WebFramework;

/**
 * function to turn all of the rpc api routes into an object
 * that is nested the same way as the paths
 * for example :
 * given arr = ['users/list','users/add','accounts/list','accounts/remove']
 * the resulting object will be
 * {
 *   "users": {
 *       "list": "users/list",
 *       "add": "users/add"
 *   },
 *   "accounts": {
 *       "list": "accounts/list",
 *       "remove": "accounts/remove"
 *   }
 * }
 * */
const to_object_paths = (arr: string[]) => {
  let result: { [key: string]: any } = {};
  arr.forEach((item) => {
    const keys = item.split("/");
    const last_key = keys.pop();
    let current_obj = result;
    keys.forEach((key) => {
      current_obj[key] = current_obj[key] || {};
      current_obj = current_obj[key];
    });
    current_obj[last_key!] = item;
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

  function exec_path(key: string, value: any) {
    if (typeof value == "object") {
      Object.entries(value).forEach(([k, v]) => {
        exec_path(`${key}/${k}`, v);
      });
    } else if (typeof value == "function") {
      all_routes.push(key);
      value(key);
    }
  }

  Object.entries(routes).forEach(([k, v]) => exec_path(k, v));
  // route for client to get the slim-rpc scheme
  app.expose_all_routes("/slim-rpc-scheme", to_object_paths(all_routes));
};

/**
 * Complicated shit ahead warning!
 * ok, in order to create the route I needed to return
 * a function which lets the web framework create the route in a later stage
 * because at the time of the RPC function is being used in the modules (ex : users , account ,cart ..)
 * it has no idea about the routes structure which is being constructed only when calling the create_rpc_server() function
 * */
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
          // all good
          return {
            type: "success",
            value,
          };
        } catch (error) {
          const { message } = error as Error;
          // some internal error
          return {
            type: "error",
            code: 500,
            reason: message,
          };
        }
      } else {
        // input validation error
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
  /**
   * Typescript workaround alert!
   * I wanted the client to perform for ex : client.users.list.query({count:5})  with full intellisense
   * so I tricked typescript using this @ts-ignore below to enable the intellisense on the client
   * */
  // @ts-ignore
  return create_route;
};
