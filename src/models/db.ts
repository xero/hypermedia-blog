import { Database } from "bun:sqlite";
export const db = new Database("src/db.sqlite", { readonly: true });
export const isEmpty = (val:any):boolean => {
  return val && Object.keys(val).length === 0;
}
export const quit = () :void => {
  db.close();
};
