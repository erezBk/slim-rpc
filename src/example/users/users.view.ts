import { users_api } from "./users.rpc";

export const ui = async (org_id: string) => {
  const api = users_api({ ["org-id"]: org_id });
  const res = await api.list();
  if (res.success) {
    console.log("res.value : ", res.value);
    return `<html>
                <body>
                <div>
                 <ul>
                    ${res.value.map((u) => `<li>${u.name} - ${u.age}</li>`)}
                 </ul>
                </div>
                </body>
                </html>`;
  } else {
    return `
      <html>
      <body>
        <p>error loading users : ${JSON.stringify(res)}</p>
      </body>
      </html>
      `;
  }
};
