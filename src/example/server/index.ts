import * as express from "express";
import * as Rpc from "../../lib";
import "./users/users.rpc";
import "./accounts/accounts.rpc";
import { UsersCol } from "./users/users";
import * as cors from "cors";
import { accounts } from "./accounts/accounts.rpc";
import { users } from "./users/users.rpc";
import { AppRouter } from "../router.model";
import { run_client } from "../client/client.app";

const PORT = +process.env.PORT || 3001;
const app = express();
app.use(cors()).use(express.json());

Rpc.init<AppRouter>({
  express_app: app,
  port: PORT,
  routes: {
    accounts,
    users,
  },
  create_context: async (req) => {
    return {
      author: "erez",
      user: { id: "1" },
      services: {
        users: async () => {
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
