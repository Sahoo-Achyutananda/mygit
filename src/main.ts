// console.log("Hello Mygit");

import { cmdInit } from "./commands/init.js";
import { cmdAdd } from "./commands/add.js";
import { cmdCommit } from "./commands/commit.js";
import { cmdLog } from "./commands/log.js";

const [,, command, ...args] = process.argv;

switch(command){
    case "init": cmdInit(args); break;
    case "add": cmdAdd(args); break;
    case "commit": cmdCommit(args); break;
    case "log": cmdLog(); break;
    default: console.log(`unknown command: ${command}`);
}
