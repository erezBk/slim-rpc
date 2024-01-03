import { RPC, Validators } from "../../../lib/server";
import { User } from "./users.model";
import * as joi from "joi";

const user_scheme = joi.object({
  name: joi.string().required(),
  age: joi.number().integer().min(0).max(100).required(),
});

const list = RPC<{ count: number }, User[]>(
  Validators.prop_is("count", (c) => c > 6, "count should be > 6"),
  async ({ count }, { ctx }) => {
    const users_col = await ctx.services.users();
    const users = await users_col.list();
    return users.slice(0, count);
  }
);

const update = RPC<User, User[]>(
  Validators.from.joi(user_scheme),
  async ({ age, name }, { ctx }) => {
    const users_col = await ctx.services.users();
    await users_col.create(name, age);
    const users_state = await users_col.list();
    return users_state;
  }
);

const create = RPC<{ name: string; age: number }, { id: string }>(
  Validators.always_valid,
  async ({ age, name }, { ctx }) => {
    const users_col = await ctx.services.users();
    const id = await users_col.create(name, age);
    return { id };
  }
);

const remove = RPC<{ id: string }, User[]>(
  Validators.has_props("id"),
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
