import { Express, Request } from "express";
import axios, { AxiosError } from "axios";
import {
  RpcContext,
  RpcRequestContext,
  RpcResponse,
  InputValidationFn,
} from "./models";
import * as path from "path";

const rpc_client_path = path.join(
  __dirname,
  "..",
  "..",
  "rpc-client",
  "rpc.client.ts"
);

let app: Express;
let routes_to_init = [];
let port_number = 0;
export const init = <S>(params: {
  express_app: Express;
  port: number;
  create_context: (req: Request) => Promise<RpcContext>;
}) => {
  const { create_context, express_app, port } = params;
  port_number = port;
  app = express_app;
  app.use(async (req, _, next) => {
    const req_context = await create_context(req);
    req["req_context"] = req_context;
    next();
  });
  app.get("/gen-client", (req, res) => {
    res.sendFile(rpc_client_path);
  });

  app.get("/routes", (req, res, next) => {
    const table = [];
    const routes = req.app._router.stack;
    for (const key in routes) {
      if (routes.hasOwnProperty(key)) {
        let val = routes[key];
        if (val.route) {
          val = val.route;
          table.push(`${val.stack[0].method} : ${val.path}`);
        }
      }
    }
    res.json(table);
  });
  if (routes_to_init.length > 0) {
    routes_to_init.forEach((fn) => fn());
  }
};

export const RPC = <IN, OUT>(
  name: string,
  validate_input: InputValidationFn<IN>,
  fn: (input: IN, ctx: RpcRequestContext) => Promise<OUT>
) => {
  const add_route = () => {
    app.post("/" + name, async (req, res) => {
      const input = req.body;
      const is_valid = await validate_input(input);
      if (is_valid) {
        console.log("input : ", input);
        try {
          const result = await fn(input, {
            /* req, */ context: req["req_context"],
          });
          res.json(result);
        } catch (error) {
          const { message } = error as Error;
          res.status(500).send(message);
        }
      } else {
        res.status(400).send("bad input!");
      }
    });
  };
  if (app) {
    add_route();
  } else {
    routes_to_init.push(add_route);
  }

  return fn;
};
