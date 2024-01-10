import { RPC } from "../../../lib";
import { User } from "./users.model";
import * as z from "zod";

const user_scheme = z.object({
  name: z.string(),
  age: z.number(),
});

const list = RPC<{ count: number }, User[]>(
  z.object({ count: z.number().min(6) }),
  async ({ count }, { ctx }) => {
    const users_col = await ctx.services.users();
    const users = await users_col.list();
    return users.slice(0, count);
  }
);

const update = RPC<User, User[]>(
  user_scheme,
  async ({ age, name }, { ctx }) => {
    const users_col = await ctx.services.users();
    await users_col.create(name, age);
    const users_state = await users_col.list();
    return users_state;
  }
);

const create = RPC<{ name: string; age: number }, { id: string }>(
  user_scheme,
  async ({ age, name }, { ctx }) => {
    const users_col = await ctx.services.users();
    const id = await users_col.create(name, age);
    return { id };
  }
);

const remove = RPC<{ id: string }, User[]>(
  z.object({ id: z.string() }),
  async ({ id }, { ctx }) => {
    const users_col = await ctx.services.users();
    await users_col.remove(id);
    const users = await users_col.list();
    return users;
  }
);

export const users = {
  list,
  update,
  create,
  remove,
};
