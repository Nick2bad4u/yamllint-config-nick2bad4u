import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { parseDocument } from "yaml";

import { configPath, packageName, resolveConfigPath } from "../src/preset";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const dotfileConfigPath = path.join(repoRoot, ".yamllint");
const yamlConfigPath = path.join(repoRoot, "yamllint.yaml");
const packageJsonPath = path.join(repoRoot, "package.json");

interface PackageJson {
    exports: Record<string, unknown>;
    files: string[];
    name: string;
}

function asRecord(value: unknown): Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new TypeError("Expected a YAML mapping.");
    }

    return value as Record<string, unknown>;
}

function parseConfig(source: string): Record<string, unknown> {
    const document = parseDocument(source);

    expect(document.errors).toStrictEqual([]);
    expect(document.warnings).toStrictEqual([]);

    return asRecord(document.toJSON());
}

describe("yamllint-config-nick2bad4u", () => {
    it("exports the packaged yamllint config path", async () => {
        expect.assertions(7);

        const config = await readFile(configPath, "utf8");

        expect(packageName).toBe("yamllint-config-nick2bad4u");
        expect(path.isAbsolute(configPath)).toBe(true);
        expect(configPath.endsWith(".yamllint")).toBe(true);
        expect(configPath).not.toContain("package.json");
        expect(config).toContain("extends: default");
        expect(config).toContain("line-length:");
        expect(config).toContain('allowed-values: ["true", "false"]');
    });

    it("resolves the config path from built module locations", () => {
        expect.assertions(1);

        const builtModuleUrl = pathToFileURL(
            path.join(repoRoot, "dist", "preset.js")
        ).href;

        expect(resolveConfigPath(builtModuleUrl)).toBe(dotfileConfigPath);
    });

    it("keeps packaged config files equivalent and parseable", async () => {
        expect.assertions(15);

        const [dotfileConfig, yamlConfig] = await Promise.all([
            readFile(dotfileConfigPath, "utf8"),
            readFile(yamlConfigPath, "utf8"),
        ]);

        expect(yamlConfig).toBe(dotfileConfig);

        const parsedConfig = parseConfig(dotfileConfig);
        const rules = asRecord(parsedConfig["rules"]);
        const indentation = asRecord(rules["indentation"]);
        const truthy = asRecord(rules["truthy"]);
        const keyDuplicates = asRecord(rules["key-duplicates"]);

        expect(parsedConfig["extends"]).toBe("default");
        expect(parsedConfig["locale"]).toBe("en_US.UTF-8");
        expect(parsedConfig["yaml-files"]).toStrictEqual([
            "*.yaml",
            "*.yml",
            ".yamllint",
            ".yamllint.yaml",
            ".yamllint.yml",
            "docker-compose*.yml",
            "docker-compose*.yaml",
            "**/*.yaml",
            "**/*.yml",
        ]);
        expect(parsedConfig["ignore"]).toContain("node_modules");
        expect(parsedConfig["ignore"]).toContain("dist/");
        expect(parsedConfig["ignore"]).not.toContain("docs/Packages");
        expect(indentation["level"]).toBe("error");
        expect(indentation["spaces"]).toBe(4);
        expect(truthy["allowed-values"]).toStrictEqual(["true", "false"]);
        expect(truthy["check-keys"]).toBe(false);
        expect(keyDuplicates["forbid-duplicated-merge-keys"]).toBe(true);
        expect(keyDuplicates["level"]).toBe("error");
    });

    it("publishes the raw configs and TypeScript helper", async () => {
        expect.assertions(6);

        const packageJson = JSON.parse(
            await readFile(packageJsonPath, "utf8")
        ) as PackageJson;

        expect(packageJson.name).toBe(packageName);
        expect(packageJson.files).toContain("dist");
        expect(packageJson.files).toContain(".yamllint");
        expect(packageJson.files).toContain("yamllint.yaml");
        expect(packageJson.exports["."]).toStrictEqual({
            import: "./dist/preset.js",
            require: null,
            types: "./dist/preset.d.ts",
        });
        expect(packageJson.exports["./package.json"]).toBe("./package.json");
    });
});
