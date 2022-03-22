import { Express } from "express";

/* 
 need to have both sync and async(default) implementations
*/

let app: Express;
let routes_to_init = [];

export const init = (instance: Express) => {
  app = instance;
  if (routes_to_init.length > 0) {
    routes_to_init.forEach((fn) => fn());
  }
};

export const RPC = <IN, OUT>(name: string, fn: (input: IN) => Promise<OUT>) => {
  const add_route = () => {
    app.post("/" + name, async (req, res) => {
      const input = req.body;
      console.log("input : ", input);
      const result = await fn(input);
      res.json(result);
    });
  };
  if (app) {
    add_route();
  } else {
    routes_to_init.push(add_route);
  }
};
