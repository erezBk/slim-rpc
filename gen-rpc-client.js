// @ts-check
const {
  readFile,
  writeFile,
  readdir,
  mkdirp,
  pathExists,
} = require("fs-extra");
const { join } = require("path");

const read_config = async () => {
  const config = await readFile(join(__dirname, "rpc.config.json"), {
    encoding: "utf-8",
  });
  return JSON.parse(config);
};

const make_client_dir = async (path) => {
  const client_dir_path = join(__dirname, path);
  const is_client_dir_exist = await pathExists(client_dir_path);
  if (!is_client_dir_exist) {
    await mkdirp(client_dir_path);
  } else {
    console.log("client dir already exist");
  }
};

const getter_all_rpc_relevant_files = async (
  src_dir_path,
  rpc_file_pattern_postfix
) => {
  const src_path = join(__dirname, src_dir_path);
  const files = await readdir(src_path, { encoding: "utf-8" });
  const relevant_files = files.filter((l) =>
    l.endsWith(rpc_file_pattern_postfix)
  );
  return relevant_files;
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
  return {
    name: Array.from(signature.match(fn_name) || ["?"])[0],
    input: input_out_match[0],
    output: input_out_match[1],
  };
};

const gen_rpc_fn = (fn_name, req_type, res_type) => {
  return `
  export async function ${fn_name}(payload:${req_type}):Promise<Response<${res_type}>>{
       try{
           const res =  await axios.post(defaults.base_url + \`/${fn_name}\`,payload);
           return {
               success:true,
               value:res.data
           }
       }catch(e){
          return {
              success:false,
              code:e.response.code
          }
       }
   }
    `;
};

let base_client_template = `
import axios from 'axios';
  
interface SuccessResponse<T>{
  success:true,
  value:T
}

interface ErrorResponse{
  success:false,
  code:number
}

export type Response<T> = SuccessResponse<T> | ErrorResponse

export const defaults = {
   base_url:""
}
`;

(async () => {
  const { src, client_dir, rpc_file_pattern_postfix, models_file } =
    await read_config();
  await make_client_dir(client_dir);

  const rpc_src_files = await getter_all_rpc_relevant_files(
    src,
    rpc_file_pattern_postfix
  );

  console.log(rpc_src_files);

  const functions = [];
  for (const file_name of rpc_src_files) {
    const code = await extract_rpc_signature(join(__dirname, src, file_name));
    functions.push(...code.map(extract_rpc_fn_parts));
  }

  console.log(functions);

  let fns_as_code = [];

  for (const rpc_fn of functions) {
    const { name, input, output } = rpc_fn;
    const fn_as_ts_code = gen_rpc_fn(name, input, output);
    fns_as_code.push(fn_as_ts_code);
  }

  const models = await readFile(join(__dirname, src, models_file), {
    encoding: "utf-8",
  });

  const file_content = `
  ${base_client_template}
   ${models} 
   ${fns_as_code.join("\n")}
  `;

  await writeFile(join(__dirname, client_dir, "rpc.client.ts"), file_content, {
    encoding: "utf-8",
  });
})();
