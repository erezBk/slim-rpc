import { accounts } from "./accounts/accounts.rpc";
import { users } from "./users/users.rpc";

const appRouter = {
  accounts,
  users,
};

export type AppRouter = typeof appRouter;
