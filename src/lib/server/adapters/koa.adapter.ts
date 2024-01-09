import { RpcContext, RpcResponse, RpcRouter, WebFramework } from "../../models";
import * as koa from "koa";
import * as Router from "koa-router";

export const RpcKoaAdapter = (
  app: koa<koa.DefaultState, koa.DefaultContext>,
  router: Router
): WebFramework => {
  const expose_all_routes = (path: string, routes: RpcRouter) => {
    // route for client to get the slim-rpc scheme
    router.get(path, (ctx) => {
      ctx.body = routes;
    });
  };

  const inject_ctx_to_each_call = (
    req_ctx_param_name: string,
    create_context: (req: Request) => Promise<RpcContext>
  ) => {
    /*  app.use(async (req, _, next) => {
      // @ts-ignore
      const req_context = await create_context(req);
      req[req_ctx_param_name] = req_context;
      next();
    }); */
  };

  const create_route = <IN, OUT>(
    req_context_param_name: string,
    path: string,
    get_res: (body: IN, ctx: RpcContext) => Promise<RpcResponse<OUT>>
  ) => {
    /*  app.post("/" + name, async (req, res) => {
      const result = await get_res(req.body, req["req_context"]);
      res.json(result);
    }); */
  };

  return {
    expose_all_routes,
    inject_ctx_to_each_call,
    create_route,
  };
};
