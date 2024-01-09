import * as z from "zod";
import { RPC } from "../../../lib/server";
import { Account } from "./accounts.model";

const _accounts: Record<string, Account> = {
  a: {
    id: "a",
    balance: 3000,
  },
};

const get_by_id = RPC<{ id: string }, Account>(
  z.object({ id: z.string() }),
  async ({ id }) => {
    return _accounts[id];
  }
);

export const accounts = {
  get_by_id,
};
