import * as fs from "fs";
import { Repository } from "../repo.js";
import { parseCommit } from "../objects.js";
import { parse } from "path";

export function cmdCheckout(args: string[]){
    const branch = args[0];
    if(!branch) throw new Error("branch name required");

    const repo = Repository.open();
    const targetHash = repo.refs.readBranch(branch);

    if(!targetHash)
        throw new Error(`branch not found : ${branch}`);

    // 1. delete the currently tracked files
    const currentHash = repo.refs.headCommit();
    if(currentHash){
        const currentCommit = parseCommit(repo.store.read(currentHash));
        const currentFiles = repo.treeToEntries(currentCommit.tree, "");
        for(const filePath of currentFiles.keys()){
            if(fs.existsSync(filePath))
                fs.unlinkSync(filePath);
        }
    }

    // 2. restore files from target bracnh
    const targetCommit = parseCommit(repo.store.read(targetHash));
    repo.restoreTree(targetCommit.tree, repo.root);

    // 3. rebuild the index from scratch for the new branch
    repo.index.load();
    const newFiles = repo.treeToEntries(targetCommit.tree, "");
    for(const [filePath, hash] of newFiles){
        repo.index.stage(filePath, hash);
    }
    repo.index.save();

    repo.refs.setHeadBranch(branch);
    console.log(`switched to branch : ${branch}`);

}