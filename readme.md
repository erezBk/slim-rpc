# Slim-RPC
![Logo](./assets/logo.png)
- Trpc inspired RPC lib
- Expects Zod.scheme as input validation
- e2e intellisense
- under **300 lines of code** so you can easily extend it
  
  - [Motivation ](#motivation)
  - [Server](#server)
    - [Augmenting the RpcContext](#augmenting-the-rpccontext)
    - [Usage example](#server-usage-example)
    - [Error handling](#server-error-hanlding)
  - [Shared router model](#shared-router-model)
  - [Client](#client)
    - [Usage example](#client-usage-example)
    - [Error handling](#client-error-hanlding)
  - [Road MAP](#road-map)
  - [Contributions](#contributions)


## Motivation <a name="motivation"></a>
Trpc is a really great library! <br>
I wanted to see if I can develop it's core feature and DX my self and <br>
was surprised by the **short amount of code** it took and how well it worked for me <br>
So I decided to share it with the world.


## Server  <a name="server"></a>
### Augmenting the RpcContext <a name="augmenting-the-rpccontext"></a>
the **RpcContext** is an object that is being created for each RPC function handler invocation. <br>
In order to have intellisense available for each RPC function you will need to use Typescript augmentation<br>
for that in your server project root create a **d.ts** file <br>
and add inside **RpcContext** whatever you want
```ts
import { RpcContext } from "slim-rpc/lib/cjs/models";
import { UserService } from "./users/user.service";
import { AccountsService } from "./accounts/accounts.service";
declare module "slim-rpc/lib/cjs/models" {
  interface RpcContext {
    user_id:string;
    org_id:string;
    services: {
      users: UserService;
      accounts:AccountsService
    };
  }
}
```

### Usage example <a name="server-usage-example"></a>
In this example we use **express** as a web framework and we have 3 modules <br>
* auth
* users
* accounts

```ts
// server/index.ts
import express from 'express'
import { create_rpc_server, RpcExpressAdapter } from "slim-rpc";
import { auth } from './auth/auth.rpc'
import { accounts } from './accounts/accounts.rpc'
import { create_accounts_service } from './accounts/accounts.service'
import { users } from './users/users.rpc'
import { create_user_service } from './users/users.service'

const app = express();
create_rpc_server({
  web_framework: RpcExpressAdapter(app),
  routes: {
    auth,
    accounts,
    users,
  },
  create_context: async (req) => {
    return {
      org_id:req.headers['org-id'],
      users_id:req.headers['user-id'],
      services: {
        users: create_user_service(req),
        users: create_accounts_service(req),
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
### Error handling <a name="server-error-handling"></a>
**input validation errors (400)** are handled by the library using the error msgs from the **zod** scheme parser <br> <br>
**other errors** will be returned as status **500** with the massage taken from the **error object**.<br> <br>
**401 & 403** for the time being I suggest that those errors will be handled by middlewares before **Slim-RPC** is handling them. <br>
for ex when using express:
```ts
// handle 401
app.use(async (req,req,next)=>{
  if(req.path === '/login'){
    next();
  }else{
    const ia_authorized = await check_is_auth_user(req);
    if(!is_authorized){
      res.status(401).send('user is not authorized')
    }else{
      next();
    }
  }
})
// handle 403
// I want the library to have the RPC function handle the role based calls
// will be on the road map & impl soon I hope
app.use(async (req,req,next)=>{
  if(req.path == '/login'){
    next();
  }else{
    const role = extract_role(req);
    const is_allowed = check_is_user_allowed(role,req.path);
    if(is_allowed){
      next()
    }else{
      res.status(403).send("user doesn't have enough permission to perform the action")
    }
  }
})
// then init SlimRPC
```
## Shared Router model <a name="shared-router-model"></a>
```ts
// router.model.ts
import { accounts } from "./server/accounts/accounts.rpc";
import { users } from "./server/users/users.rpc";
import {auth} from './server/auth/auth.rpc'

const appRouter = {
  auth,
  accounts,
  users,
};

export type AppRouter = typeof appRouter;

```
## Client <a name="client"></a>
### Usage example <a name="client-usage-example"></a>
```ts
// client/state.ts
import { AppRouter } from "../router.model";
import { create_client,set_rpc_client_config } from "slim-rpc";

const client = create_client<AppRouter>(env.base_url);
const all_clients = ref([]); // vuejs example

const init = async(name:string,pass:string)=>{
    // get the authorization Bearer by login
    const auth_res = await client.auth.login({name,pass})
    if(auth_res.type == 'success'){
       set_rpc_client_config({
          headers: {
            authorization: auth_res.value,
          },
        });
      // get a list of 20 users
      const res = await client.users.list.query({count:20})  // full intellisense !
      if(res.type == 'success'){
         all_clients.value =  res.value;
      }
    }
}
// ...
```
### Error handling <a name="client-error-handling"></a>
the **RpcResponse** response object for each call is of the form:
```ts
interface RpcSuccessResponse<T> {
  type: "success";
  value: T;
}

interface RpcErrorResponse {
  type: "error";
  code: number;
  reason?: string;
}

export type RpcResponse<T> = RpcSuccessResponse<T> | RpcErrorResponse;
```
so each error will be of **type** == 'error' and will have at least a **code** value.


## Roadmap <a name="roadmap"></a>
* Handle 401 globally 
* Enable handling of 403 (role based) within each RPC call definition
* **koa** and **fastify** adapters
* Batching mechanism for all in one go client-server round trip
* Canceling requests mechanism
* Server Sent events mechanism

## Contributions <a name="contributions"></a>
Not yet