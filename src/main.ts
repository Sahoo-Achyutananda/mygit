// console.log("Hello Mygit");

import { cmdInit } from "./commands/init.js";
import { cmdAdd } from "./commands/add.js";
import { cmdCommit } from "./commands/commit.js";
import { cmdLog } from "./commands/log.js";
import { cmdStatus }   from "./commands/status.js";
import { cmdBranch }   from "./commands/branch.js";
import { cmdCheckout } from "./commands/checkout.js"

const [,, command, ...args] = process.argv;

switch(command){
    case "init": cmdInit(args); break;
    case "add": cmdAdd(args); break;
    case "commit": cmdCommit(args); break;
    case "log": cmdLog(); break;
    case "status": cmdStatus();  break;
    case "branch": cmdBranch(args); break;
    case "checkout": cmdCheckout(args); break;
    default: console.log(`unknown command: ${command}`);
}
