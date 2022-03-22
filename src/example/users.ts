import { singleton } from "./fp";
import { User } from "./models";

const gen_id = (prefix: string) => {
  let id = 1;
  return () => {
    id++;
    return prefix + "_" + id;
  };
};
const next_user_id = gen_id("user");

interface UserDb {
  create: (name: string, age: number) => Promise<string>;
  list: () => Promise<User[]>;
  remove: (id: string) => Promise<boolean>;
}

export const UsersCol = singleton<User[], UserDb>((first_users) => {
  const users_db: Record<string, User> = first_users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<string, User>);

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
