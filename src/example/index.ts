import * as express from "express";
import * as Rpc from "../lib";
import "./users/users.rpc";
import "./accounts/accounts.rpc";
import { UsersCol } from "./users/users";
import { ui } from "./users/users.view";
import * as cors from "cors";
const PORT = +process.env.PORT || 3001;
const app = express();
app.use(cors()).use(express.json());

Rpc.init({
  express_app: app,
  port: PORT,
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

app.get("/users", async (req, res) => {
  const result = await ui(req.headers["org-id"] as string);
  res.send(result);
});

app.listen(PORT, async () => {
  console.log("init services before listening .... running on port ", PORT);
});
