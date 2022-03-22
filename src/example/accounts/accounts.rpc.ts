import { RPC } from "../../lib";
import { Account } from "./accounts.model";

const accounts: Record<string, Account> = {
  a: {
    id: "a",
    balance: 3000,
  },
};

RPC<{ id: string }, Account>("get_account", async ({ id }) => {
  return accounts[id];
});
