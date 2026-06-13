import * as fs from "fs";
import * as path from "path";

import {compress, decompress} from "./utils.js";
import { hashObject, storeBytes } from "./objects.js";
import type {GitObject} from "./objects.js";

export class Store{
    private root : string; // this holds the path to .mygit/objects

    constructor(repoRoot : string){
        this.root = path.join(repoRoot, ".mygit", "objects"); // note we are using path.join -> the /s are automatically added
    }

    has(hash : string) : boolean{
        return fs.existsSync(path.join(this.root, hash.slice(0,2), hash.slice(2)));
    }

    objectPath(hash : string) : string {
        return path.join(this.root, hash.slice(0,2), hash.slice(2));
    }

    write(obj: GitObject): string {
        const hash = hashObject(obj); // this is the sha1 of the output of the storeObjects(obj)

        if (this.has(hash)) return hash; // dedup — already stored, skip

        const compressed = compress(storeBytes(obj));
        const filePath = this.objectPath(hash);

        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, compressed);

        return hash;
    }

    read(hash: string): GitObject {
        const filePath = this.objectPath(hash); // finds the path where the object is stored in the .mygit folder
        const compressed = fs.readFileSync(filePath); // reads the content from the Path
        const raw = decompress(compressed); // we decompress the compressed stored data

        // raw = "type size\0data"
        const nullPos = raw.indexOf(0);
        const header = raw.slice(0, nullPos).toString();  // "blob 6"
        const type = header.split(" ")[0] as "blob" | "tree" | "commit";
        const data = raw.slice(nullPos + 1);

        return { type, data };
    }

}


