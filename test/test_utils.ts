import {sha1, compress, decompress} from "../src/utils.js";

console.log(sha1("Hello"));
let compressed_string = compress(Buffer.from("Hello"));
console.log(compressed_string);
let decompressed_string = decompress(compressed_string);
console.log(decompressed_string);
console.log(decompressed_string.toString());
