// branches and HEAD

import * as fs from "fs";
import * as path from "path";
import { ref } from "process";

export class Refs{
    private root : string;

    constructor(repoRoot : string){
        this.root = path.join(repoRoot, ".mygit");
    }

    private read(refPath : string) : string | null { // reads any file inside .mygit -> not just refs folder
        const full = path.join(this.root, refPath);
        if(!fs.existsSync(full)) return null;
        return fs.readFileSync(full , "utf8").trim();
    }

    private write(refPath : string, content : string) : void {
        const full = path.join(this.root, refPath);
        fs.mkdirSync(path.dirname(full), {recursive : true});
        fs.writeFileSync(full, content + "\n");
    }

    headBranch(): string | null {
        const content = this.read("HEAD");
        if (content?.startsWith("ref: refs/heads/")) {
            return content.slice("ref: refs/heads/".length);
        }
        return null;
    }

    // returns the actual commit hash HEAD points to
    headCommit(): string | null {
        const content = this.read("HEAD");
        if (!content) return null;

        if (content.startsWith("ref: ")) {
            // symbolic ref - follow it
            return this.read(content.slice("ref: ".length));
        }
        return content;  // detached HEAD - already a hash
    }

    setHeadBranch(branch: string): void {
        this.write("HEAD", `ref: refs/heads/${branch}`);
    }

    setHeadDetached(hash: string): void {
        this.write("HEAD", hash);
    }

    readBranch(branch: string): string | null {
        return this.read(`refs/heads/${branch}`);
    }

    writeBranch(branch: string, hash: string): void {
        this.write(`refs/heads/${branch}`, hash);
    }

    listBranches(): string[] {
        const dir = path.join(this.root, "refs", "heads");
        if(!fs.existsSync(dir)) return [];
        return fs.readdirSync(dir);
    }
}