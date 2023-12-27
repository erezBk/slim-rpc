import { Express, Request } from "express";
import {
  RpcContext,
  RpcRequestContext,
  InputValidationFn,
  RpcResponse,
} from "./models";

let app: Express;
let routes_to_init = [];
let port_number = 0;

export const init = <T>(params: {
  express_app: Express;
  port: number;
  create_context: (req: Request) => Promise<RpcContext>;
  routes: T;
}) => {
  const { create_context, express_app, port, routes } = params;
  port_number = port;
  app = express_app;

  // route for client to get the slim-rpc scheme
  app.get("/slim-rpc-scheme", (req, res) => {
    res.json(routes);
  });

  app.use(async (req, _, next) => {
    const req_context = await create_context(req);
    req["req_context"] = req_context;
    next();
  });

  if (routes_to_init.length > 0) {
    routes_to_init.forEach((fn) => fn());
  }
};

export const RPC = <IN, OUT>(
  name: string,
  validate_input: InputValidationFn<IN>,
  fn: (input: IN, ctx: RpcRequestContext) => Promise<OUT>
): { query: (input: IN) => Promise<RpcResponse<OUT>> } => {
  const add_route = () => {
    app.post("/" + name, async (req, res) => {
      const input = req.body;
      const is_valid = await validate_input(input);
      if (is_valid) {
        try {
          const value = await fn(input, {
            ctx: req["req_context"],
          });
          res.json({
            type: "success",
            value,
          });
        } catch (error) {
          const { message } = error as Error;
          res.json({
            type: "error",
            code: 500,
            reason: message,
          });
        }
      } else {
        res.json({
          type: "error",
          code: 400,
          reason: "bad input",
        });
      }
    });
  };
  if (app) {
    add_route();
  } else {
    routes_to_init.push(add_route);
  }
  return {
    // @ts-ignore
    query: name,
  };
};
