#!/usr/bin/env node
/**
 * Copies the game wire contracts from the backend into this app.
 *
 *   npm run contracts:sync                       copy (backend at ../poker-backend)
 *   npm run contracts:sync -- --check            exit 1 if the copy is out of date
 *   npm run contracts:sync -- --backend <path>   another backend checkout
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const check = args.includes("--check");
const backendIdx = args.indexOf("--backend");
const backend = path.resolve(
  root,
  backendIdx >= 0 ? (args[backendIdx + 1] ?? "") : "../poker-backend",
);

const SOURCE = path.join(backend, "src/svc/modules/game/contracts.ts");
const TARGET = path.join(root, "src/modules/table/api/contracts.ts");
const HEADER =
  "// GENERATED: copied from poker-backend/src/svc/modules/game/contracts.ts.\n" +
  "// Do not edit here; change the backend file and run `npm run contracts:sync`.\n\n";

if (!existsSync(SOURCE)) {
  console.error(`Backend contracts not found at ${SOURCE}`);
  process.exit(2);
}
const expected = HEADER + readFileSync(SOURCE, "utf8");

if (check) {
  const current = existsSync(TARGET) ? readFileSync(TARGET, "utf8") : "";
  if (current !== expected) {
    console.error("contracts.ts is out of date. Run `npm run contracts:sync`.");
    process.exit(1);
  }
  console.log("contracts.ts matches the backend.");
} else {
  writeFileSync(TARGET, expected);
  console.log(`Copied contracts to ${path.relative(root, TARGET)}`);
}
