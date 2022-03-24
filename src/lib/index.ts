import { Express, Request } from "express";
import axios, { AxiosError } from "axios";
import { Context, Response } from "./models";

let app: Express;
let routes_to_init = [];

export const init = <S>(
  instance: Express,
  ctx: (req: Request) => Promise<{ services: S }>
) => {
  app = instance;
  app.use(async (req, _, next) => {
    const { services } = await ctx(req);
    req["services"] = services;
    next();
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
        const res = await axios.post("http://localhost:3000/" + name, input, {
          headers,
        });
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
