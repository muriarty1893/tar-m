import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { siteConfig } from "@/config/site";

const root = path.join(__dirname, "..", "..");
const DIRS = ["app", "components", "lib", "data"];

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return sourceFiles(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}

describe("brand name", () => {
  it("appears in code only via siteConfig.name", () => {
    const offenders = DIRS.flatMap((d) => sourceFiles(path.join(root, d)))
      .filter((f) => fs.readFileSync(f, "utf8").includes(siteConfig.name))
      .map((f) => path.relative(root, f));
    expect(offenders).toEqual([]);
  });
});
