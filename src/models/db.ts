import { Database } from "bun:sqlite";
/*   _     _   _   _ ___ __
 *  |_ \/ |_) / \ |_) | (_
 *  |_ /\ |   \_/ | \ | __)
 */
export const db = new Database("src/db.sqlite", { readonly: true });
export const isEmpty = (val: any): boolean => {
	return val && Object.keys(val).length === 0;
}
export const quit = (): void => {
	db.close();
};
