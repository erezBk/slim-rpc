import { Express, Request } from "express";
import axios, { AxiosError } from "axios";
import { Context, RequestContext, Response } from "./models";
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
  create_context: (req: Request) => Promise<Context>;
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
  if (routes_to_init.length > 0) {
    routes_to_init.forEach((fn) => fn());
  }
};

export const RPC = <IN, OUT>(
  name: string,
  validate_input: (body: any) => boolean,
  fn: (input: IN, ctx: RequestContext) => Promise<OUT>
) => {
  const add_route = () => {
    app.post("/" + name, async (req, res) => {
      const input = req.body;
      if (validate_input(input)) {
        console.log("input : ", input);
        try {
          const result = await fn(input, { req, context: req["req_context"] });
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

  const client_fn =
    (headers: Record<string, string>) =>
    async (input: IN): Promise<Response<OUT>> => {
      try {
        const res = await axios.post(
          `http://localhost:${port_number}/` + name,
          input,
          {
            headers,
          }
        );
        return {
          success: true,
          value: res.data,
        };
      } catch (e) {
        const error: AxiosError = e;
        return {
          success: false,
          code: error.response.status,
        };
      }
    };

  return client_fn;
};
