interface SuccessResponse<T> {
  type: "success";
  value: T;
}

interface ErrorResponse {
  type: "error";
  code: number;
}

export interface ClientConfig {
  base_url: string;
  headers: Record<string, string>;
}

export type Response<T> = SuccessResponse<T> | ErrorResponse;

const abort_controllers_map = {} as Record<string, AbortController[]>;
const create_abort_controller = (name: string) => {
  const ctrl = new AbortController();
  abort_controllers_map[name] = [...(abort_controllers_map[name] || []), ctrl];
  return ctrl;
};

const abort_all_requests = () => {
  Object.values(abort_controllers_map)
    .flat()
    .forEach((ctrl) => ctrl.abort());
};

const abort_requests = (call_names: string[]) => {
  call_names.forEach((name) => {
    if (name in abort_controllers_map) {
      abort_controllers_map[name].forEach((ctrl) => ctrl.abort());
      delete abort_controllers_map[name];
    }
  });
};

let defaults: ClientConfig = {
  base_url: "",
  headers: {},
};

const create_request = <T, R>(domain: string, fn_name: string) => {
  const fetch_controller = create_abort_controller(domain + "." + fn_name);
  return async (payload: T): Promise<Response<R>> => {
    try {
      const res = await fetch({
        method: "POST",
        signal: fetch_controller.signal,
        headers: {
          ...defaults.headers,
          // @ts-ignore
          "Content-Type": "application/json",
        },
        url: defaults.base_url + `${domain}.${fn_name}`,
        // @ts-ignore
        body: JSON.stringify(payload as Object),
      });
      if (res.ok) {
        const result = await res.json();
        return {
          type: "success",
          value: result,
        };
      } else {
        return {
          type: "error",
          code: res.status,
        };
      }
    } catch (e) {
      console.warn("slim-rpc client error: ", e);
      return {
        type: "error",
        // no network
        code: 0,
      };
    }
  };
};

export const server = {
  common(options: ClientConfig) {
    defaults = {
      ...defaults,
      ...options,
    };
  },
  abort(...call_names) {
    switch (true) {
      case call_names.length === 0:
        console.warn("you called server.abort() with 0 args");
        break;
      case call_names.length === 1 && call_names[0] === "*":
        abort_all_requests();
        break;
      default:
        abort_requests(call_names);
        break;
    }
  },
  //#CODE
};
