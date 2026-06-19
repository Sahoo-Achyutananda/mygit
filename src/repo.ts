import * as fs from "fs";
import * as path from "path";
import { Store } from "./store.js";
import { Index } from "./index.js";
import { Refs } from "./refs.js";

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
}