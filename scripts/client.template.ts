import axios from "axios";

interface SuccessResponse<T> {
  type: "success";
  value: T;
}

interface ErrorResponse {
  type: "error";
  code: number;
}

export type Response<T> = SuccessResponse<T> | ErrorResponse;

export const defaults = {
  base_url: "",
};

const create_request = <T, R>(domain: string, fn_name: string) => {
  return async (payload: T): Promise<Response<R>> => {
    try {
      const res = await axios.post(
        defaults.base_url + `${domain}/${fn_name}`,
        payload
      );
      return {
        type: "success",
        value: res.data,
      };
    } catch (e) {
      return {
        type: "error",
        code: e.response.status,
      };
    }
  };
};
