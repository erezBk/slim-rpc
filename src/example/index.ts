import * as express from "express";
import * as Rpc from "../lib";
import "./users/users.rpc";
import "./accounts/accounts.rpc";
import { UsersCol } from "./users/users";

const PORT = +process.env.PORT || 3000;
const app = express();
app.use(express.json());

Rpc.init(app, async (req) => {
  return {
    services: {
      users: async () => {
        const col_name = "users_" + req.headers["org-id"];
        return UsersCol(col_name);
      },
    },
  };
});

app.listen(PORT, async () => {
  console.log("init services before listening ....");
});
