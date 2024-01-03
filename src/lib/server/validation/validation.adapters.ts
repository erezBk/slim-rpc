import * as joi from "joi";
import { SafeParseError, Schema } from "zod";
import { ValidationResponse } from "../../models";

export const from_joi_scheme = <T>(scheme: joi.ObjectSchema<T>) => {
  return (input: T): ValidationResponse => {
    const res = scheme.validate(input);
    if (res.error) {
      return {
        type: "error",
        reason: res.error.message,
      };
    }
    return {
      type: "success",
    };
  };
};

export const from_zod_scheme = <T>(scheme: Schema<T>) => {
  return (input: T): ValidationResponse => {
    const res = scheme.safeParse(input);
    if (!res.success) {
      return {
        type: "error",
        reason: (res as SafeParseError<T>).error.message,
      };
    }
    return {
      type: "success",
    };
  };
};
