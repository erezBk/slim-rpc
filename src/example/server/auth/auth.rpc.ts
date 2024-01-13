import { z } from "zod";
import { RPC } from "../../../lib";

const login = RPC<{ name: string; pass: string }, string>(
  z.object({ name: z.string(), pass: z.string().min(4).max(8) }),
  async ({ name, pass }) => {
    return `Bearer + some jwt impl ${name}`;
  }
);

export const auth = {
  login,
};
