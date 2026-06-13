# Problems Faced

## Day 2 — utils.ts (sha1, compress, decompress)

---

### 1. `require` without assignment
**Problem:** Wrote `require("crypto")` without storing it in a variable. `crypto` was never defined, so `crypto.createHash(...)` crashed.

**Fix:**
```typescript
const crypto = require("crypto");  // CommonJS way
// or
import * as crypto from "crypto";  // ES module way (correct)
```

---

### 2. Decompressing uncompressed data
**Problem:** Called `decompress(Buffer.from("Hello"))` directly. `decompress` expects already-compressed bytes, not raw text. zlib threw `Z_DATA_ERROR: incorrect header check`.

**Fix:** Always compress first, then decompress the result:
```typescript
const compressed = compress(Buffer.from("Hello"));
const decompressed = decompress(compressed);  // pass compressed, not raw
```

---

### 3. Missing quotes in import path
**Problem:** Wrote `import { sha1 } from ../src/utils` — no quotes around the path, which is a syntax error.

**Fix:**
```typescript
import { sha1, compress, decompress } from "../src/utils.js";
```

---

### 4. Functions not exported from utils.ts
**Problem:** `test_utils.ts` tried to import functions that weren't exported. The import silently failed.

**Fix:** Add `export` to each function in `utils.ts`:
```typescript
export function sha1(...) { ... }
export function compress(...) { ... }
export function decompress(...) { ... }
```

---

### 5. Mixing CommonJS and ES module syntax
**Problem:** Used `require(...)` and `module.exports = {...}` alongside `import` and `export` in the same file. These are two different module systems and can't be mixed.

**Fix:** Pick one. Since the project uses `import`/`export`, remove all `require` and `module.exports` and use only ES module syntax.

---

### 6. `rootDir` too narrow in tsconfig.json
**Problem:** `tsconfig.json` had `"rootDir": "./src"` but test files were in `./test`. TypeScript refused to process files outside `rootDir`.

**Fix:**
```json
"rootDir": "."
```

---

### 7. Missing `"type": "module"` in package.json
**Problem:** Without this field, Node.js treats all files as CommonJS by default. TypeScript with `verbatimModuleSyntax` then blocked all `import`/`export` statements with errors like *"ECMAScript imports cannot be written in a CommonJS file"*.

**Fix:** Add to `package.json`:
```json
"type": "module"
```

---

### 8. `ts-node` doesn't support ES modules
**Problem:** Running `npx ts-node test/test_utils.ts` threw `Cannot find module '...utils.js'` because `ts-node` doesn't resolve `.js` imports to `.ts` files in ESM mode.

**Fix:** Use `tsx` instead:
```
npx tsx test/test_utils.ts
```
`tsx` handles ES modules automatically with no extra config.

---

## Day 4 — objects.ts part 1 (types + hashing)

### Key Concepts

**Git object types**
Git has 4 object types: `blob`, `tree`, `commit`, `tag`. Every object is identified by its SHA1 hash.

**Git object storage format**
Git doesn't hash just the raw content. It wraps it in a header first:
```
"type size\0data"
```
Example for `"hello\n"` (6 bytes):
```
"blob 6\0hello\n"
```
The SHA1 of this full string is the object's hash. That's what `storeBytes` builds.

**Why hash the header too?**
So that a blob and a tree with the same raw bytes get different hashes. The type is part of the identity.

**`makeBlob`**
A blob is just raw file content wrapped in a `GitObject`. No metadata — just the bytes.
```typescript
makeBlob("hello\n") → { type: "blob", data: Buffer("hello\n") }
```

**Verifying your implementation**
The hash of `"hello\n"` is always `ce013625030ba8dba906f756967f9e9ca394464a` in real git. You can verify with:
```
echo "hello" | git hash-object --stdin
```
If your output matches, your implementation is correct.

**`TreeEntry` is a pointer, not a node**
A `TreeEntry` has a `mode`, `name`, and `hash`. The hash points to either a blob (file) or another tree (subdirectory). The entry itself is just a row in a directory listing.

| mode | points to |
|---|---|
| `100644` | blob (regular file) |
| `040000` | tree (subdirectory) |

---

## Day 5 — objects.ts part 2 (makeTree + makeCommit)

### Key Concepts

**Why tree format is binary but commit format is text**
- Tree objects store hashes as 20 raw bytes (not 40 hex chars) to save space. A directory with many files would be huge otherwise.
- Commit objects are plain readable text because they're small and humans may need to read them directly.

**`makeTree` binary format**
For each entry:
```
"mode name\0" + 20 raw bytes (SHA1 hash)
```
The `\0` separates the name from the hash. The hash is converted from 40 hex chars to 20 binary bytes:
```typescript
Buffer.from(entry.hash, "hex")  // "hex" tells Buffer to decode as hex
```

**`makeCommit` text format**
```
tree <treeHash>
parent <parentHash>      ← optional, omitted for the very first commit
author Name <email> timestamp +0000
committer Name <email> timestamp +0000
                         ← blank line required
commit message
```
The blank line between headers and message is mandatory — git uses it to know where headers end.

**Parent hash is optional**
The first commit in a repo has no parent. Every commit after that has at least one. Merge commits have two parents. That's how git builds the commit history chain.

**Timestamp format**
Git stores time as Unix timestamp (seconds since 1970) + timezone offset:
```
1234567890 +0000
```
