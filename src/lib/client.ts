export const create_client = <T>(base_url: string): T => {
  let is_ready = false;
  const waiters = [];

  // @ts-ignore
  let client: T = {};

  const proxy_handler = (path: string[]) => ({
    get(target, prop, receiver) {
      if (prop === "query") {
        if (is_ready) {
          return [...path, prop].reduce((acc, p) => acc[p], client);
        } else {
          return async (args) => {
            return new Promise((resolve) => {
              waiters.push(async () => {
                const the_api_call = [...path, prop].reduce(
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
        proxy_handler([...path, prop])
      );
    },
  });

  const create_api_call = (api_call_key: string) => {
    return async (props) => {
      const url = `${base_url}/${api_call_key}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(props), // Convert the data to JSON string
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

  // @ts-ignore
  const client_proxy: T = new Proxy(client, proxy_handler([]));
  (async () => {
    const res = await fetch(base_url + "/slim-rpc-scheme", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const api_scheme = await res.json();
    client = parse_scheme(api_scheme);
    is_ready = true;
    waiters.forEach((fn) => fn());
  })();

  return client_proxy;
};
