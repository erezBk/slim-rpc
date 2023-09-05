import * as express from "express";
import * as Rpc from "../lib";
import "./users/users.rpc";
import "./accounts/accounts.rpc";
import { UsersCol } from "./users/users";
import * as cors from "cors";

const PORT = +process.env.PORT || 3001;
const app = express();
app.use(cors()).use(express.json());

Rpc.init({
  express_app: app,
  port: PORT,
  create_context: async (req) => {
    return {
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
});
