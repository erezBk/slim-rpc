import { accounts } from "./server/accounts/accounts.rpc";
import { users } from "./server/users/users.rpc";

const appRouter = {
  accounts,
  users,
};

export type AppRouter = typeof appRouter;
