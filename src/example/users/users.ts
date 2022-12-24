import { gen_id, memoize } from "../fp";
import { User } from "./users.model";

const next_user_id = gen_id("user");

export interface UserDb {
  create: (name: string, age: number) => Promise<string>;
  list: () => Promise<User[]>;
  remove: (id: string) => Promise<boolean>;
}

export const UsersCol = memoize((org_id: string) => {
  console.log("init users collection for orgId : ", org_id);
  const users_db: Record<string, User> = Array(100)
    .fill({})
    .map((_, index) => {
      return {
        id: index + "",
        name: "user from server " + index,
        age: 30,
      };
    })
    .reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {}); /* {
    "1": { id: "1", name: "bubu", age: 30 },
  }; */

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
