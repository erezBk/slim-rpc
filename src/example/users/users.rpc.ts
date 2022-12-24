import { RPC } from "../../lib";
import { has_prop, to_unary } from "../fp";
import { User } from "./users.model";
import * as joi from "joi";

const user_scheme = joi.object({
  name: joi.string().required(),
  age: joi.number().integer().min(0).max(100).required(),
});

const is_valid_user = to_unary(user_scheme.validate);

const always_valid = () => true;

const list_users = RPC<{ count: number }, User[]>(
  "users.list",
  always_valid,
  async ({ count }, { context, req }) => {
    const users_col = await context.services.users();
    const users = await users_col.list();
    return users.slice(0, count);
  }
);

const update_user = RPC<User, User[]>(
  "users.update",
  is_valid_user,
  async ({ age, name }, { context }) => {
    const users_col = await context.services.users();
    await users_col.create(name, age);
    const users_state = await users_col.list();
    return users_state;
  }
);

const create_user = RPC<{ name: string; age: number }, User[]>(
  "users.create",
  is_valid_user,
  async ({ age, name }, { context }) => {
    const users_col = await context.services.users();
    await users_col.create(name, age);
    const users_state = await users_col.list();
    return users_state;
  }
);

const remove_user = RPC<{ id: string }, User[]>(
  "users.remove",
  has_prop("id"),
  async ({ id }, { context }) => {
    const users_col = await context.services.users();
    await users_col.remove(id);
    const users = await users_col.list();
    return users;
  }
);

export const users_api = (headers: Record<string, string>) => ({
  remove: remove_user(headers),
  create: create_user(headers),
  list: list_users(headers),
  update: update_user(headers),
});
