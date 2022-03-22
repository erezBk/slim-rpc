import * as express from "express";
import * as Rpc from "../lib";
import "./users.rpc";
import "./accounts.rpc";

const PORT = +process.env.PORT || 3000;
const app = express();
app.use(express.json());

Rpc.init(app);

app.listen(PORT, async () => {
  console.log("init services before listening ....");
});
