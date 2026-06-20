import { Repository } from "../repo.js";
import { makeCommit } from "../objects.js";

export function cmdCommit(args: string[]) {
    const msgFlag = args.indexOf("-m");
    const message = msgFlag !== -1 ? args[msgFlag + 1] : "no message";

    const repo = Repository.open();
    const treeHash = repo.writeTree();
    const parentHash = repo.refs.headCommit();
    const commit = makeCommit(treeHash, parentHash, "theoneofakind", "shoo@email.com", message!);
    const commitHash = repo.store.write(commit);

    const branch = repo.refs.headBranch();
    if(branch){
        repo.refs.writeBranch(branch, commitHash);
    }else{
        repo.refs.setHeadDetached(commitHash);
    }

    console.log(`[${branch ?? "detached"} ${commitHash.slice(0, 7)}] ${message}`);
}
