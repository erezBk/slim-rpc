import { gen_id, memoize } from "../fp";
import { User } from "./users.model";

const next_user_id = gen_id("user");

interface UserDb {
  create: (name: string, age: number) => Promise<string>;
  list: () => Promise<User[]>;
  remove: (id: string) => Promise<boolean>;
}

export const UsersCol = memoize((org_id: string) => {
  console.log("init users collection for orgId : ", org_id);
  const users_db: Record<string, User> = {};

  const create = async (name: string, age: number) => {
    const id = next_user_id();
    const new_user: User = { id, name, age };
    users_db[id] = new_user;
    return id;
  };

  const list = async () => Object.values(users_db);

  const remove = async (id: string) => {
    delete users_db[id];
    return true;
  };

  return {
    create,
    list,
    remove,
  };
});
