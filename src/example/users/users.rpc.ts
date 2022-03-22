import { RPC } from "../../lib";
import { User } from "./users.model";

RPC<{ name: string; age: number }, User[]>(
  "create_user",
  async ({ age, name }, { services }) => {
    const users_col = await services.users();
    await users_col.create(name, age);
    const users_state = await users_col.list();
    return users_state;
  }
);

RPC<{ id: string }, User[]>("remove_user", async ({ id }, { services }) => {
  const users_col = await services.users();
  await users_col.remove(id);
  const users = await users_col.list();
  return users;
});
