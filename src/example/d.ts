import { RpcContext } from "../lib/models";
import { UserDb } from "./server/users/users";
import { User } from "./server/users/users.model";

declare module "../lib/models" {
  interface RpcContext {
    user: { id: string };
    services: {
      users: () => Promise<UserDb>;
    };
  }
}
