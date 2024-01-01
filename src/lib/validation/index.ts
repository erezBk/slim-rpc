import { ValidationResponse } from "../models";
import { from_joi_scheme, from_zod_scheme } from "./validation.adapters";

const always_valid = (): ValidationResponse => ({ type: "success" });

const has_props = <T extends object>(...props: Array<keyof T>) => {
  return (input: T): ValidationResponse => {
    const missing_props = props.filter((prop) => prop in input);
    if (missing_props.length > 0) {
      return {
        type: "error",
        reason: `${missing_props.join(", ")} are missing`,
      };
    } else {
      return { type: "success" };
    }
  };
};

const prop_is = <T extends object, K extends keyof T>(
  prop: K,
  check: (prop_val: T[K]) => boolean,
  err_msg = `${prop as string} is missing`
) => {
  return (input: T): ValidationResponse => {
    if (prop in input) {
      const is_valid = check(input[prop]);
      if (is_valid) {
        return {
          type: "success",
        };
      } else {
        return {
          type: "error",
          reason: err_msg,
        };
      }
    } else {
      return {
        type: "error",
        reason: `${prop as string} is missing`,
      };
    }
  };
};

export const Validators = {
  always_valid,
  from: {
    joi: from_joi_scheme,
    zod: from_zod_scheme,
  },
  has_props,
  prop_is,
};
