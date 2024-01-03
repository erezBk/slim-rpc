export const create_client = <T>(base_url: string): T => {
  let is_ready = false;
  const waiters = [];
  // the cb is a Promise waiting to be resolved by
  // the batch request handler containing the result corresponding
  // to this api call.
  // the batched_requests array must be clean once the requests are exec
  // and before they resolve! the items will move to a different
  const batched_requests: Array<{ url: string; props: string; cb: Function }> =
    [];

  // @ts-ignore
  let client: T = {};

  const proxy_handler = (path: string[]) => ({
    get(target, prop, receiver) {
      if (prop === "query") {
        if (is_ready) {
          return [...path].reduce((acc, p) => acc[p], client);
        } else {
          return async (args: any) => {
            return new Promise((resolve) => {
              // @ts-ignore
              waiters.push(async () => {
                // @ts-ignore
                const the_api_call: (a: any) => Promise<any> = [...path].reduce(
                  (acc, p) => acc[p],
                  client
                );
                // @ts-ignore
                const res = await the_api_call(args);
                resolve(res);
              });
            });
          };
        }
      }
      return new Proxy(
        { [prop]: { __path: [...path, prop] } },
        proxy_handler([...path, prop])
      );
    },
  });

  const create_api_call = (api_call_key: string) => {
    return async (props) => {
      const url = `${base_url}/${api_call_key}`;
      const body = JSON.stringify(props);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
      const data = await res.json();
      return data;
    };
  };

  const replace_apply_keys_with_calls = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = create_api_call(obj[key]);
      } else if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        obj[key] = replace_apply_keys_with_calls(obj[key]);
      }
    }
    return obj;
  };

  const parse_scheme = <T>(api_scheme: T): T => {
    return replace_apply_keys_with_calls(api_scheme);
  };

  const delay = () => {
    return new Promise((r) => {
      setTimeout(() => {
        r("");
      }, 2000);
    });
  };

  // @ts-ignore
  const client_proxy: T = new Proxy(client, proxy_handler([]));
  (async () => {
    const res = await fetch(base_url + "/slim-rpc-scheme", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    //  await delay();
    const api_scheme = await res.json();
    client = parse_scheme(api_scheme);
    is_ready = true;
    waiters.forEach((fn: Function) => fn());
  })();

  return client_proxy;
};
