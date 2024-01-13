interface RpcClientDefaults {
  base_url?: string;
  headers?: {
    [key: string]: string;
  };
}

const rpc_client_config: RpcClientDefaults = {
  base_url: "",
  headers: {},
};

export const set_rpc_client_config = (options: RpcClientDefaults) => {
  if (options.base_url) {
    rpc_client_config.base_url = options.base_url;
  }
  if (options.headers) {
    rpc_client_config.headers = {
      ...rpc_client_config.headers,
      ...options.headers,
    };
  }
};

/**
 * ### Create slim-rpc client
 * it will return the entire server routing as an object with the same route nesting structure
 * calling each endpoint is done via the **.query()** method which has input/output as defined by
 * each RPC function in the server impl.
 * */
export const create_client = <T>(base_url: string): T => {
  rpc_client_config.base_url = base_url;
  let is_ready = false;
  let client: T = {} as T;
  const waiters: Array<() => Promise<void>> = [];

  const proxy_handler = (path: string[]): ProxyHandler<any> => ({
    get(target, prop, receiver) {
      if (prop === "query") {
        if (is_ready) {
          /**
           * the real client is now ready so we can return the function which will be used for the
           * .query() call
           * */
          // @ts-ignore
          return [...path].reduce((acc, p) => acc[p], client);
        } else {
          /**
           * the real client is not ready yet so we return a function which return a promise that will be resolved
           * only after the client will be ready (when is_ready is true) and that will happen after finishing parsing
           * the routes returned from calling /slim-rpc-scheme.
           *
           * */
          return async (args: any) => {
            return new Promise((resolve) => {
              waiters.push(async () => {
                // @ts-ignore
                const the_api_call: (a: any) => Promise<any> = [...path].reduce(
                  // @ts-ignore
                  (acc, p) => acc[p],
                  client
                );
                const res = await the_api_call(args);
                resolve(res);
              });
            });
          };
        }
      }
      return new Proxy(
        { [prop]: { __path: [...path, prop] } },
        proxy_handler([...path, prop as string])
      );
    },
  });

  const client_proxy: T = new Proxy(client, proxy_handler([]));

  const create_api_call = (api_call_key: string) => {
    return async (props: Object) => {
      const url = `${rpc_client_config.base_url}/${api_call_key}`;
      const body = JSON.stringify(props);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...rpc_client_config.headers,
        },
        body,
      });
      const data = await res.json();
      return data;
    };
  };

  const parse_scheme = <T>(api_scheme: T): T => {
    for (const key in api_scheme) {
      if (typeof api_scheme[key] === "string") {
        // @ts-ignore
        api_scheme[key] = create_api_call(api_scheme[key]);
      } else if (
        typeof api_scheme[key] === "object" &&
        !Array.isArray(api_scheme[key])
      ) {
        api_scheme[key] = parse_scheme(api_scheme[key]);
      }
    }
    return api_scheme;
  };

  /**
   * this function is calling the slim-rpc server's scheme endpoint
   * so that it can construct the client rpc in runtime! (mind blowing I know)
   * the 'waiters' is an array of api calls waiting to be execute while the call for the scheme
   * was taking place or even before it when there was no client actually to handle it!
   * (proxy is a sick sick sick mind bending js feature)
   * */
  (async () => {
    const res = await fetch(rpc_client_config.base_url + "/slim-rpc-scheme", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const api_scheme = await res.json();
    client = parse_scheme(api_scheme);
    is_ready = true;
    /**
     * now that the client is ready we can execute all of the waiting calls that where made before
     * it was ready.
     * */
    waiters.forEach((fn: Function) => fn());
  })();

  return client_proxy;
};
