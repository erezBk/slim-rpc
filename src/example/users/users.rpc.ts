import { RPC } from "../../lib";
import { has_prop, to_unary } from "../fp";
import { User } from "./users.model";
import * as joi from "joi";

const user_scheme = joi.object({
  name: joi.string().required(),
  age: joi.number().integer().min(0).max(100).required(),
});

const is_valid_user = to_unary(user_scheme.validate);

const list = RPC<{ count: number }, User[]>(
  "users.list",
  ({ count }) => count > 6,
  async ({ count }, { context }) => {
    const users_col = await context.services.users();
    const users = await users_col.list();
    return users.slice(0, count);
  }
);

const update = RPC<User, User[]>(
  "users.update",
  is_valid_user,
  async ({ age, name }, { context }) => {
    const users_col = await context.services.users();
    await users_col.create(name, age);
    const users_state = await users_col.list();
    return users_state;
  }
);

const create = RPC<{ name: string; age: number }, { id: string }>(
  "users.create",
  () => true,
  async ({ age, name }, { context }) => {
    const users_col = await context.services.users();
    const id = await users_col.create(name, age);
    return { id };
  }
);

const remove = RPC<{ id: string }, User[]>(
  "users.remove",
  has_prop("id"),
  async ({ id }, { context }) => {
    const users_col = await context.services.users();
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

export const UsersTests = {
  create,
};
