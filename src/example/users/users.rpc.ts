import { RPC } from "../../lib";
import { UsersCol } from "./users";
import { User } from "./users.model";

const users_col = UsersCol([]);

RPC<{ name: string; age: number }, User[]>(
  "create_user",
  async ({ age, name }) => {
    await users_col.create(name, age);
    const users = await users_col.list();
    return users;
  }
);

RPC<{ id: string }, User[]>("remove_user", async ({ id }) => {
  users_col.remove(id);
  const users = await users_col.list();
  return users;
});
