import { Repository } from "../repo.js";

export function cmdLog(){
    const repo = Repository.open();
    const logs = repo.getLog();

    if(logs.length === 0){
        console.log("no commits yet");
        return;
    }

    for(const entry of logs){
        console.log(`commit ${entry.hash}`);
        console.log(`Author: ${entry.author}`);
        console.log(`\n    ${entry.message}\n`);
    }
}
