import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { configPath, packageName } from "../src/preset";

describe("yamllint-config-nick2bad4u", () => {
    it("exports the packaged yamllint config path", async () => {
        expect.assertions(8);

        const config = await readFile(configPath, "utf8");

        expect(packageName).toBe("yamllint-config-nick2bad4u");
        expect(configPath.endsWith(".yamllint")).toBe(true);
        expect(configPath).not.toContain("package.json");
        expect(config).toContain("extends: default");
        expect(config).toContain("line-length:");
        expect(config).toContain(
            "docs/docusaurus/docs/documents/docs/Packages/**"
        );
        expect(config).toContain("build/");
        expect(config).toContain("release/");
    });
});
