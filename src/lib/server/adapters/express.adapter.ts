import { RpcContext, WebFramework, RpcResponse } from "../../models";
import { Express } from "express";

export const RpcExpressAdapter = <T>(app: Express): WebFramework<T> => {
  const expose_all_routes = (path: string, routes: T) => {
    app.get(path, (_, res) => {
      res.json(routes);
    });
  };

  const inject_ctx_to_each_call = (
    req_context_param_name: string,
    create_context: (req: Request) => Promise<RpcContext>
  ) => {
    app.use(async (req, _, next) => {
      // @ts-ignore
      const req_context = await create_context(req);
      req[req_context_param_name] = req_context;
      next();
    });
  };

  const create_route = <IN, OUT>(
    req_context_param_name: string,
    path: string,
    get_res: (body: IN, ctx: RpcContext) => Promise<RpcResponse<OUT>>
  ) => {
    app.post("/" + path, async (req, res) => {
      const result = await get_res(req.body, req[req_context_param_name]);
      res.json(result);
    });
  };

  return {
    expose_all_routes,
    inject_ctx_to_each_call,
    create_route,
  };
};
