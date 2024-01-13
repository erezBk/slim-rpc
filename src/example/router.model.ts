import { accounts } from "./server/accounts/accounts.rpc";
import { users } from "./server/users/users.rpc";
import { auth } from "./server/auth/auth.rpc";

const appRouter = {
  accounts,
  auth,
  users,
};

export type AppRouter = typeof appRouter;
