import { RPC } from "../../lib";
import { User } from "./users.model";

const list_users = RPC<void, User[]>(
  "users.list",
  async (_, { context, req }) => {
    console.log("making a call to list_users : ", req.headers);
    const users_col = await context.services.users();
    const users = await users_col.list();
    return users;
  }
);

const update_user = RPC<User, User[]>(
  "users.update",
  async ({ age, name }, { context }) => {
    const users_col = await context.services.users();
    await users_col.create(name, age);
    const users_state = await users_col.list();
    return users_state;
  }
);

const create_user = RPC<{ name: string; age: number }, User[]>(
  "users.create",
  async ({ age, name }, { context }) => {
    const users_col = await context.services.users();
    await users_col.create(name, age);
    const users_state = await users_col.list();
    return users_state;
  }
);

const remove_user = RPC<{ id: string }, User[]>(
  "users.remove",
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
