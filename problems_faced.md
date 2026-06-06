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
