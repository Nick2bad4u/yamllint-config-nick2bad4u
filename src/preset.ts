import * as path from "node:path";
import { fileURLToPath } from "node:url";

/** Packaged yamllint config filename. */
export const configFileName = ".yamllint" as const;

/** Published package name for this shared yamllint config. */
export const packageName = "yamllint-config-nick2bad4u" as const;

/**
 * Resolves the packaged yamllint config from an ESM module URL.
 *
 * @param fromUrl - Module URL to resolve from.
 *
 * @returns Absolute path to the packaged yamllint config file.
 */
export function resolveConfigPath(fromUrl: string = import.meta.url): string {
    return path.join(
        path.dirname(fileURLToPath(fromUrl)),
        "..",
        configFileName
    );
}

/** Absolute path to the packaged yamllint config file. */
export const configPath: string = resolveConfigPath();
