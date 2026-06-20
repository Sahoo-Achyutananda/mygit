import { Repository } from "../repo.js";

export function cmdInit(args : string[]){
    const where = args[0] ?? "."; // if no args are passed then use the current location
    Repository.init(where);
    console.log(`Initialized empty mygit repository in ${where}/.mygit`);
}