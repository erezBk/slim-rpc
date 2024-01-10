import { UserDb } from "./server/users/users";

declare module "../lib/models" {
  interface RpcContext {
    user: { id: string };
    services: {
      users: () => Promise<UserDb>;
    };
  }
}
