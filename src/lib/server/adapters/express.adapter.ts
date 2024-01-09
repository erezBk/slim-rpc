import { RpcContext, WebFramework, RpcResponse, RpcRouter } from "../../models";
import { Express } from "express";

export const RpcExpressAdapter = (app: Express): WebFramework => {
  const expose_all_routes = (path: string, routes: RpcRouter) => {
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
      // @ts-ignore
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
      // @ts-ignore
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
