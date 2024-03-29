import * as express from "express";
import { create_rpc_server, RpcExpressAdapter } from "../../lib";
import { UsersCol } from "./users/users";
import * as cors from "cors";
import { accounts } from "./accounts/accounts.rpc";
import { users } from "./users/users.rpc";
import { run_client } from "../client/client.app";

const PORT = +process.env.PORT! || 3001;
const app = express();
app.use(cors()).use(express.json());

create_rpc_server({
  web_framework: RpcExpressAdapter(app),
  routes: {
    accounts,
    users,
  },
  create_context: async (req) => {
    return {
      user: { id: "1" },
      services: {
        users: async () => {
          // @ts-ignore
          const col_name = "users_" + req.headers["org-id"];
          return UsersCol(col_name);
        },
      },
    };
  },
});

app.listen(PORT, async () => {
  console.log("init services before listening .... running on port ", PORT);
  run_client();
});
