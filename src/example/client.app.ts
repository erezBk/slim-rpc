import { AppRouter } from "./router.model";
import { create_client } from "../lib/client";

export const run_client = async () => {
  console.log("running client");
  const client = create_client<AppRouter>("http://localhost:3001");
  const res = await client.accounts.get_by_id.query({ id: "a" });
  console.log("RES:", res);
  const res2 = await client.users.list.query({ count: 7 });
  console.log("res2:", res2);
};
