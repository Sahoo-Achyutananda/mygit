import { sha1 } from "./utils.js";

// there are 4 types of objects in git -> blob, tree, commit and  a tag
type ObjType = "blob" | "tree" | "commit";

interface GitObject{
    type : ObjType,
    data : Buffer
}

interface TreeEntry{
    mode : string, // 100644 for a regular file, 40000 for directory, etc .. 
    name : string, 
    hash : string,
}

// git stores objects in a particular format
// type size \0data, \0 is the separator
// the storeBytes function will add the header on top of the data and returns the final Buffer
export function storeBytes(obj : GitObject): Buffer{
    const header : string = `${obj.type} ${obj.data.length}\0`;
    const header_buffer : Buffer = Buffer.from(header);
    const result : Buffer = Buffer.concat([header_buffer, obj.data]);

    return result;
}

export function hashObject(obj : GitObject) : string {
    const gitobj_byte = storeBytes(obj);
    return sha1(gitobj_byte);
}

export function makeBlob(content : Buffer | string) : GitObject{
    let data;
    if(typeof content === "string"){
        data = Buffer.from(content);
    }else{
        data = content;
    }

    return {type : "blob", data}
}

// Day 5 -
// This returns a tree object
export function makeTree(entries : TreeEntry[]) : GitObject {
    const parts = entries.map(entry => {
        const header = Buffer.from(`${entry.mode} ${entry.name}\0`);
        const hashBytes = Buffer.from(entry.hash, "hex"); // git stores this as hexadecimal
        return Buffer.concat([header, hashBytes]);
    }); 

    return {type : "tree", data : Buffer.concat(parts)};
}

// this returns a commit object
export function makeCommit(treeHash : string, parentHash : string | null, name : string, email : string, message : string) : GitObject {
    const timeStamp = `${Math.floor(Date.now() / 1000)} +0000`;
    const author = `${name} <${email}> ${timeStamp}`;

    const lines = [
        `tree ${treeHash}`,
        ...(parentHash ? [`parent ${parentHash}`] : []),  // optional parent -> the spread operator is a trick -> if array is empty nothing is added 
        `author ${author}`,
        `committer ${author}`,
        ``,
        message,
    ]

    return { type : "commit", data : Buffer.from(lines.join('\n'))};
}

// Day 6 - parsers 

// parses the string returned by makeTree -> it just reverses what makeTree does -
export function parseTree(object : GitObject): TreeEntry[] {
    const entries : TreeEntry[] = [];
    let i = 0;

    while(i < object.data.length){ // object.data contains the full string that is suppsoed to be parsed !
        const nullPos = object.data.indexOf(0,i); // here i = > the offset (where to begin searching in the string)
        // why is the offset important ? -> 

        const header = object.data.slice(i, nullPos).toString();
        const spacePos = header.indexOf(" ");
        const mode = header.slice(0, spacePos);
        const name = header.slice(spacePos + 1);

        const hash = object.data.slice(nullPos + 1, nullPos + 21).toString("hex"); // 20 bytes → hex

        entries.push({ mode, name, hash });
        i = nullPos + 21;
    }

    return entries;

}

export function parseCommit(obj: GitObject): {
    tree: string;
    parent: string | null;
    author: string;
    message: string;
}{
    const lines = obj.data.toString().split("\n");
    let i = 0;
    let tree = "";
    let parent: string | null = null;
    let author = "";

    // read headers until blank line
    while (i < lines.length && lines[i] !== "") {
        const line = lines[i];
        if (line.startsWith("tree ")) 
            tree   = line.slice(5);
        if (line.startsWith("parent "))    
            parent = line.slice(7);
        if (line.startsWith("author "))    
            author = line.slice(7);
        i++;
    }

    // everything after the blank line is the message
    const message = lines.slice(i + 1).join("\n");

    return { tree, parent, author, message };
}
