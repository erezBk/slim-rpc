import { AppRouter } from "./router.model";
import { create_client } from "../lib/client";

export const run_client = async () => {
  console.log("running client");
  const client = create_client<AppRouter>("http://localhost:3001");
  const res = await client.accounts.get_by_id.query({ id: "a" });
  console.log("RES:", res);
  const res2 = await client.users.list.query({ count: 7 });
  console.log("res2:", res2);
  setTimeout(async () => {
    const res3 = await client.users.create.query({
      age: 20,
      name: "bubu",
    });
    console.log("res3:", res3);
    const res4 = await client.users.list.query({
      count: 100,
    });
    console.log("res4:", res4);
  }, 1000);
};
