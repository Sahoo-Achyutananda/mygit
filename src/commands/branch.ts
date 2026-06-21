import { Repository } from "../repo.js";

export function cmdBranch(args: string[]){
    const repo = Repository.open();

    if(args.length === 0){
        const current  = repo.refs.headBranch();
        const branches = repo.refs.listBranches();
        for (const b of branches) {
            console.log(b === current ? `* ${b}` : `  ${b}`);
        }
    }else{ // Remember : git branch <branch_name> creates a new branch but does not switch to it.
        const name = args[0]!; 
        const headCommit = repo.refs.headCommit();
        if(!headCommit) throw new Error("no commits yet"); // if there are no commits yet, then creating a new branch of a current branch is not possible -> therefore we throw an error
        repo.refs.writeBranch(name, headCommit); // since the new branch will be the replica of the recent branch -> the hash will be same as the hash of the branch the HEAD points to
        console.log(`created branch: ${name}`);
    }
}
