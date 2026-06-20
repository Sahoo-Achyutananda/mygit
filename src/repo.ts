import * as fs from "fs";
import * as path from "path";
import { Store } from "./store.js";
import { Index } from "./index.js";
import { Refs } from "./refs.js";

import  {makeTree, hashObject} from "./objects.js";

export class Repository{
    store : Store;
    index : Index;
    refs : Refs;
    root : string;

    constructor(root : string){
        this.root = root;
        this.store = new Store(root);
        this.index = new Index(root);
        this.refs = new Refs(root);
    }

    static init(repoPath : string): Repository{
        const mygit = path.join(repoPath, ".mygit");

        fs.mkdirSync(path.join(mygit, "objects"), { recursive: true });
        fs.mkdirSync(path.join(mygit, "refs", "heads"), { recursive: true });

        fs.writeFileSync(path.join(mygit, "HEAD"), "ref: refs/heads/main\n");
        fs.writeFileSync(path.join(mygit, "config"), "[core]\n\trepositoryformatversion = 0\n"); // this is the file that gets modified when we update something using git config

        return new Repository(repoPath);
    }

    static open(): Repository{
        let current = process.cwd();

        while(true){
            if(fs.existsSync(path.join(current, "mygit"))){ // searches for current_dir/mygit
                return new Repository(current);
            }
        }

        const parent = path.dirname(current);
        if(parent === current)
            throw new Error("not a mygit repository");
        current = parent;
    }

    // add inside the Repository class
    private buildTree(entries: Map<string, string>, prefix: string): string {
        const treeEntries = [];
        const subdirs = new Map<string, Map<string, string>>();

        for(const [filePath, hash] of entries){
            if(!filePath.startsWith(prefix)) continue;

            const rest = filePath.slice(prefix.length);  // strip prefix
            const slashPos = rest.indexOf("/");

            if(slashPos === -1){
                treeEntries.push({ mode: "100644", name: rest, hash });
            }else{
                const subdir = rest.slice(0, slashPos);
                if (!subdirs.has(subdir)) subdirs.set(subdir, new Map());
                subdirs.get(subdir)!.set(filePath, hash);
            }
        }

        // recurse into each subdirectory → get its tree hash
        for(const [subdir, subEntries] of subdirs){
            const subHash = this.buildTree(subEntries, prefix + subdir + "/");
            treeEntries.push({ mode: "040000", name: subdir, hash: subHash });
        }

        // sort by name — git requires this
        treeEntries.sort((a, b) => a.name.localeCompare(b.name));

        const tree = makeTree(treeEntries);
        return this.store.write(tree);
    }

    writeTree(): string {
        this.index.load(); // this loads the Map from the INDEX file
        return this.buildTree(this.index.all(), ""); // remember the all() method we added -> it returns the entire MAp here 
        // the all method is like a get method basicallty
    }

}