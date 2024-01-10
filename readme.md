# Slim-RPC

- Trpc inspired RPC lib
- uses zod for input validation (did I say it's Trpc inspired ?)
- **under 300 lines of code!** 👍

## Usage
```ts
// server/index.ts
import express from 'express'
import { create_rpc_server, RpcExpressAdapter } from "slim-rpc";
import {accounts} from 'accounts/accounts.rpc.ts'
import {users} from 'users/users.rpc.ts'

const app = express();
create_rpc_server({
  web_framework: RpcExpressAdapter(app),
  routes: {
    accounts,
    users,
  },
  create_context: async (req) => {
    return {
      services: {
        users: async () => {
          const col_name = "users_" + req.headers["org-id"];
          return UsersCol(col_name);
        },
      },
    };
  },
});

```

```ts
// server/users/users.rpc.ts
import { RPC } from "slim-rpc";
import {z} from 'zod'


const user_scheme = z.object({
  name: z.string(),
  age: z.number(),
});

const list = RPC<{ count: number }, User[]>(
  z.object({ count: z.number().min(6) }),
  async ({ count }, { ctx }) => {
    const users_col = await ctx.services.users();
    const users = await users_col.list();
    return users.slice(0, count);
  }
);

const update = RPC<User, User[]>(
  user_scheme,
  async ({ age, name }, { ctx }) => {
    const users_col = await ctx.services.users();
    await users_col.create(name, age);
    const users_state = await users_col.list();
    return users_state;
  }
);

const create = RPC<{ name: string; age: number }, { id: string }>(
  user_scheme,
  async ({ age, name }, { ctx }) => {
    const users_col = await ctx.services.users();
    const id = await users_col.create(name, age);
    return { id };
  }
);

const remove = RPC<{ id: string }, User[]>(
  z.object({ id: z.string() }),
  async ({ id }, { ctx }) => {
    const users_col = await ctx.services.users();
    await users_col.remove(id);
    const users = await users_col.list();
    return users;
  }
);

export const users = {
  list,
  update,
  create,
  remove,
};
```
```ts
// router.model.ts
import { accounts } from "./server/accounts/accounts.rpc";
import { users } from "./server/users/users.rpc";

const appRouter = {
  accounts,
  users,
};

export type AppRouter = typeof appRouter;

```

```ts
// client/state.ts
import { AppRouter } from "../router.model";
import { create_client } from "slim-rpc";

const client = create_client<AppRouter>(env.base_url);
const all_clients = ref([]);
const init_users = async()=>{
    // get a list of 20 users
    const res = await client.users.list.query({count:20})  // full intellisense !
    if(res.type == 'success'){
       all_clients.value =  res.value;
    }
}
// ...
```



## Road MAP
* **koa** and **fastify** adapters
* Batching mechanism for all in one go client-server round trip
* Canceling requests mechanism
* Server Sent events mechanism