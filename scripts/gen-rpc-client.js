const {
  readFile,
  writeFile,
  readdir,
  unlinkSync,
  mkdirp,
  pathExists,
} = require("fs-extra");
const { join } = require("path");

const root = join(__dirname, "../");

const read_config = async () => {
  const config = await readFile(join(root, "rpc.config.json"), {
    encoding: "utf-8",
  });
  return JSON.parse(config);
};

const make_client_dir = async (path) => {
  const client_dir_path = join(root, path);
  const is_client_dir_exist = await pathExists(client_dir_path);
  if (!is_client_dir_exist) {
    await mkdirp(client_dir_path);
  } else {
    console.log("client dir already exist");
  }
};

const getter_all_rpc_relevant_files = async (
  src_dir_path,
  rpc_file_pattern_postfix,
  rpc_model_pattern_postfix,
  files = []
) => {
  const src_path = join(root, src_dir_path);
  const files_and_folders = await readdir(src_path, { encoding: "utf-8" });
  const is_file = (item) => item.endsWith(".ts");
  for (const f of files_and_folders) {
    if (is_file(f)) {
      files.push(join(src_dir_path, f));
    } else {
      await getter_all_rpc_relevant_files(
        join(src_dir_path, f),
        rpc_file_pattern_postfix,
        rpc_model_pattern_postfix,
        files
      );
    }
  }
  const rpc_fns_files = files.filter((l) =>
    l.endsWith(rpc_file_pattern_postfix)
  );
  const rpc_model_files = files.filter((l) =>
    l.endsWith(rpc_model_pattern_postfix)
  );
  return {
    rpc_fns_files,
    rpc_model_files,
  };
};

const remove_new_lines = (val) => val.replace(/\n/g, "");

const extract_rpc_signature = async (rpc_file_path) => {
  const sign = /(RPC<[\S\s]+?)>\(([\S\s][\S\s]"?.+")/g;
  const code = await readFile(rpc_file_path, { encoding: "utf-8" });
  const rpc_signatures = Array.from(code.match(sign) || []);
  return rpc_signatures.map(remove_new_lines);
};

const extract_rpc_fn_parts = (signature) => {
  const fn_name = /(?<=")(.+)(?=")/;
  const input_output = /(?<=RPC<)(.*)(?=>)/;

  const input_out_match = Array.from(signature.match(input_output))[0].split(
    ","
  );
  const fn = Array.from(signature.match(fn_name) || ["?"])[0].split(".");
  return {
    domain: fn[0],
    method: fn[1],
    input: input_out_match[0],
    output: input_out_match[1],
  };
};

const gen_rpc_fn = (domain, fn_name, req_type, res_type) => {
  return `create_request<${req_type},${res_type}>("${domain}","${fn_name}") `;
};

const get_base_client_template = async () => {
  return await readFile(join(__dirname, "client.template.ts"), {
    encoding: "utf-8",
  });
};

(async () => {
  const { src, client_dir, rpc_file_postfix, models_file_postfix } =
    await read_config();
  await make_client_dir(client_dir);

  const { rpc_fns_files, rpc_model_files } =
    await getter_all_rpc_relevant_files(
      src,
      rpc_file_postfix,
      models_file_postfix,
      []
    );

  const functions = [];
  for (const file_path of rpc_fns_files) {
    const code = await extract_rpc_signature(file_path);
    functions.push(...code.map(extract_rpc_fn_parts));
  }

  const functions_by_domains = {};
  for (const rpc_fn of functions) {
    const { domain, method, input, output } = rpc_fn;
    const fn_as_ts_code = gen_rpc_fn(domain, method, input, output);

    functions_by_domains[domain] = {
      ...(functions_by_domains[domain] || {}),
      [method]: fn_as_ts_code,
    };
  }

  const generated_functions_per_domain = Object.entries(functions_by_domains)
    .reduce((acc, [domain_name, fns]) => {
      acc.push(`
  ${domain_name}:{
    ${Object.entries(fns)
      .reduce((acc_inner, [fn_name, fn_str]) => {
        acc_inner.push(`${fn_name}: ${fn_str}`);
        return acc_inner;
      }, [])
      .join("\n,")}
  },
  `);
      return acc;
    }, [])
    .join("\n");

  const models = [];
  for (const model_file_path of rpc_model_files) {
    const model_code = await readFile(model_file_path, { encoding: "utf-8" });
    models.push(model_code);
  }
  const base_client_template = await get_base_client_template();
  const file_content = `
  ${models.join("\n")}
  ${base_client_template.replace("//#CODE", generated_functions_per_domain)}
    `;

  await writeFile(join(root, client_dir, "rpc.client.ts"), file_content, {
    encoding: "utf-8",
  });
})();
