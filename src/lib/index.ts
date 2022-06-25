import { Express, Request } from "express";
import axios, { AxiosError } from "axios";
import { Context, Response } from "./models";
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
export const init = <S>(
  instance: Express,
  port: number,
  ctx: (req: Request) => Promise<{ services: S }>
) => {
  port_number = port;
  app = instance;
  app.use(async (req, _, next) => {
    const { services } = await ctx(req);
    req["services"] = services;
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
  fn: (input: IN, ctx: Context) => Promise<OUT>
) => {
  const add_route = () => {
    app.post("/" + name, async (req, res) => {
      const input = req.body;
      console.log("input : ", input);
      const result = await fn(input, { req, services: req["services"] });
      res.json(result);
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
