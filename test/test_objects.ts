import { storeBytes, hashObject, makeBlob } from "../src/objects.js";

// --- Test: makeBlob with string ---
const blob1 = makeBlob("hello\n");
console.log("type:", blob1.type);                      // blob
console.log("data:", blob1.data.toString());           // hello\n

// --- Test: makeBlob with Buffer ---
const blob2 = makeBlob(Buffer.from("hello\n"));
console.log("buffer input works:", blob2.data.toString() === "hello\n");  // true

// --- Test: storeBytes format ---
const bytes = storeBytes(blob1);
console.log("storeBytes:", bytes.toString());          // blob 6\0hello\n (null shows as empty)

// --- Test: hashObject matches real git ---
const hash = hashObject(blob1);
console.log("hash:", hash);                            // ce013625030ba8dba906f756967f9e9ca394464a
console.log("hash length:", hash.length);              // 40
console.log("correct hash:", hash === "ce013625030ba8dba906f756967f9e9ca394464a");  // true
