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