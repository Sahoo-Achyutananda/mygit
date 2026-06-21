import * as fs from "fs";
import * as path from "path";
import { Repository } from "../repo.js";
import { makeBlob, hashObject, parseCommit } from "../objects.js";

function hashFile(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return hashObject(makeBlob(content));
}

function walkDir(dir: string, base = ""): string[] {
    const results: string[] = [];
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
        const rel = base ? `${base}/${entry.name}` : entry.name;
        if(entry.name === ".mygit") continue;
        if(entry.isDirectory()) results.push(...walkDir(path.join(dir, entry.name), rel));
        else results.push(rel);
    }
    return results;
}

export function cmdStatus() {
    const repo = Repository.open();
    repo.index.load();

    const indexMap = repo.index.all();
    const headHash = repo.refs.headCommit();

    const headFiles = headHash
        ? repo.treeToEntries(parseCommit(repo.store.read(headHash)).tree, "")
        : new Map<string, string>();

    // 1. staged - in index but new or different from HEAD
    console.log("Changes to be committed:");
    for(const [filePath, hash] of indexMap){
        if(!headFiles.has(filePath)) 
            console.log(`  new file:  ${filePath}`);
        else if(headFiles.get(filePath) !== hash) 
            console.log(`  modified:  ${filePath}`);
    }

    // 2. unstaged - on disk but different from index
    console.log("\nChanges not staged for commit:");
    for(const [filePath] of indexMap){
        if(!fs.existsSync(filePath)) 
            console.log(`  deleted:   ${filePath}`);
        else if(hashFile(filePath) !== indexMap.get(filePath)) 
            console.log(`  modified:  ${filePath}`);
    }

    // 3. untracked - on disk but not in index at all
    console.log("\nUntracked files:");
    for(const filePath of walkDir(repo.root)){
        if(!indexMap.has(filePath)) 
            console.log(`  ${filePath}`);
    }
}
