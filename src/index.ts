// Staging area

import * as fs from "fs";
import * as path from "path";

export class Index{
    private filePath : string;
    private map : Map<string, string> = new Map(); // stores path -> hash
    // note this is not the path to the object in the .mygit folder
    // this is the actual path of the file !
    constructor(repoRoot : string) {
        this.filePath = path.join(repoRoot, ".mygit", "index"); // index is a file where the staging information is stored
    }

    load() : void {
        if(!fs.existsSync(this.filePath)) return;
        const lines = fs.readFileSync(this.filePath, "utf-8").split('\n');
        for(const line of lines){
            if(!line.trim()) continue; // skipping blank line
            const [hash, ...rest] = line.split(" ");
            this.map.set(rest.join(" "), hash!);
        }
    }

    save() : void {
        const lines = [...this.map.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([pth, hash]) => `${hash} ${pth}`);
        fs.writeFileSync(this.filePath, lines.join("\n") + "\n"); // + \n is to point the cursor at a new line at the end
    }

    stage(filePath: string, hash: string): void {
        this.map.set(filePath, hash);
    }

    remove(filePath: string): void {
        this.map.delete(filePath);
    }

    has(filePath: string): boolean {
        return this.map.has(filePath);
    }

    getHash(filePath: string): string | undefined {
        return this.map.get(filePath);
    }

    all(): Map<string, string> {
        return this.map;
    }

}