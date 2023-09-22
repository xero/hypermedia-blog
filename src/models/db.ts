import { Database } from "bun:sqlite";
export const db = new Database("src/db.sqlite", { readonly: true });
export const quit = () :void => {
  db.close();
};
