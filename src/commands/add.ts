import * as fs from "fs";
import { Repository } from "../repo.js";
import { makeBlob } from "../objects.js";

export function cmdAdd(args : string[]){
    const repo = Repository.open();

    repo.index.load();

    for(const filePath of args){
        const content = fs.readFileSync(filePath);
        const blob = makeBlob(content);
        const hash = repo.store.write(blob);

        repo.index.stage(filePath, hash);
        console.log(`staged: ${filePath}`);
    }

    repo.index.save();

}