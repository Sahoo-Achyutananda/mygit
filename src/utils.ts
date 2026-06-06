import * as crypto from "crypto";
import * as zlib from "zlib";

export function sha1(data: Buffer | string): string {
  let result: string = crypto.createHash("sha1").update(data).digest("hex");
  return result;
}

export function compress(data: Buffer): Buffer {
  return zlib.deflateSync(data);
}

export function decompress(data: Buffer): Buffer {
  return zlib.inflateSync(data);
}