import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("root package keeps Next route output in CommonJS scope for Vercel", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
    type?: string;
  };

  assert.notEqual(packageJson.type, "module");
});
