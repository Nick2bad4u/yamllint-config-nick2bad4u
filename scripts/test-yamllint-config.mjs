#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const yamllintVersion = "1.38.0";
const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureDirectory = path.join(repoRoot, "yamllint-smoke-fixtures");
const virtualEnvironmentDirectory = path.join(
    repoRoot,
    ".cache",
    "yamllint-venv"
);
const virtualEnvironmentPython =
    process.platform === "win32"
        ? path.join(virtualEnvironmentDirectory, "Scripts", "python.exe")
        : path.join(virtualEnvironmentDirectory, "bin", "python");
const configPath = path.join(repoRoot, ".yamllint");

/**
 * Run a process and capture output.
 *
 * @param {string} command
 * @param {readonly string[]} argumentList
 *
 * @returns {import("node:child_process").SpawnSyncReturns<string>}
 */
const runProcess = (command, argumentList) =>
    spawnSync(command, [...argumentList], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: "pipe",
    });

/**
 * Run a command and throw with captured output when it fails.
 *
 * @param {string} command
 * @param {readonly string[]} argumentList
 *
 * @returns {void}
 */
const runRequiredProcess = (command, argumentList) => {
    const result = runProcess(command, argumentList);

    if (result.status === 0) {
        return;
    }

    throw new Error(
        [
            `Command failed: ${command} ${argumentList.join(" ")}`,
            result.stdout,
            result.stderr,
        ]
            .filter(Boolean)
            .join("\n")
    );
};

/**
 * Resolve a Python command that can create virtual environments.
 *
 * @returns {{ arguments: string[]; command: string }}
 */
const resolvePython = () => {
    const candidates =
        process.platform === "win32"
            ? [
                  { arguments: ["-3"], command: "py" },
                  { arguments: [], command: "python" },
                  { arguments: [], command: "python3" },
              ]
            : [
                  { arguments: [], command: "python3" },
                  { arguments: [], command: "python" },
              ];

    for (const candidate of candidates) {
        const result = runProcess(candidate.command, [
            ...candidate.arguments,
            "--version",
        ]);

        if (result.status === 0) {
            return candidate;
        }
    }

    throw new Error("Python is required to run native yamllint smoke tests.");
};

/**
 * Ensure the pinned yamllint executable is available in the local cache.
 *
 * @returns {{ arguments: string[]; command: string; label: string }}
 */
const ensureYamllint = () => {
    const python = resolvePython();

    if (!existsSync(virtualEnvironmentPython)) {
        runRequiredProcess(python.command, [
            ...python.arguments,
            "-m",
            "venv",
            virtualEnvironmentDirectory,
        ]);
    }

    const versionResult = runProcess(virtualEnvironmentPython, [
        "-m",
        "yamllint",
        "--version",
    ]);

    if (versionResult.status !== 0) {
        runRequiredProcess(virtualEnvironmentPython, [
            "-m",
            "pip",
            "install",
            "--disable-pip-version-check",
            "--quiet",
            `yamllint==${yamllintVersion}`,
        ]);
    }

    return {
        arguments: ["-m", "yamllint"],
        command: virtualEnvironmentPython,
        label: `yamllint ${yamllintVersion} from local venv`,
    };
};

/**
 * Resolve the preferred yamllint runner.
 *
 * @returns {{ arguments: string[]; command: string; label: string }}
 */
const resolveYamllintRunner = () => {
    const pathVersionResult = runProcess("yamllint", ["--version"]);

    if (pathVersionResult.status === 0) {
        return {
            arguments: [],
            command: "yamllint",
            label:
                pathVersionResult.stdout.trim() ||
                pathVersionResult.stderr.trim() ||
                "yamllint from PATH",
        };
    }

    return ensureYamllint();
};

const yamllintRunner = resolveYamllintRunner();

/**
 * Write a fixture into the smoke-test directory.
 *
 * @param {string} fileName
 * @param {string} content
 *
 * @returns {string}
 */
const writeFixture = (fileName, content) => {
    const fixturePath = path.join(fixtureDirectory, fileName);

    writeFileSync(fixturePath, content, "utf8");

    return fixturePath;
};

/**
 * Run yamllint against a fixture.
 *
 * @param {string} fixturePath
 *
 * @returns {import("node:child_process").SpawnSyncReturns<string>}
 */
const runYamllint = (fixturePath) =>
    runProcess(yamllintRunner.command, [
        ...yamllintRunner.arguments,
        "--strict",
        "-c",
        configPath,
        fixturePath,
    ]);

/**
 * Assert that yamllint accepts a fixture.
 *
 * @param {string} fixturePath
 *
 * @returns {void}
 */
const assertValidFixture = (fixturePath) => {
    const result = runYamllint(fixturePath);

    if (result.status === 0) {
        return;
    }

    throw new Error(
        [
            `Expected fixture to pass: ${fixturePath}`,
            result.stdout,
            result.stderr,
        ]
            .filter(Boolean)
            .join("\n")
    );
};

/**
 * Assert that yamllint rejects a fixture with the expected rule.
 *
 * @param {string} fixturePath
 * @param {string} expectedRule
 *
 * @returns {void}
 */
const assertInvalidFixture = (fixturePath, expectedRule) => {
    const result = runYamllint(fixturePath);
    const output = `${result.stdout}\n${result.stderr}`;

    if (result.status !== 0 && output.includes(`(${expectedRule})`)) {
        return;
    }

    throw new Error(
        [
            `Expected fixture to fail with ${expectedRule}: ${fixturePath}`,
            output,
        ]
            .filter(Boolean)
            .join("\n")
    );
};

/**
 * Run native yamllint smoke tests for the packaged config.
 *
 * @returns {void}
 */
const main = () => {
    rmSync(fixtureDirectory, { force: true, recursive: true });
    mkdirSync(fixtureDirectory, { recursive: true });

    try {
        assertValidFixture(configPath);
        assertValidFixture(path.join(repoRoot, "yamllint.yaml"));

        assertValidFixture(
            writeFixture(
                "valid.yaml",
                [
                    "---",
                    'name: "valid"',
                    "enabled: true",
                    "items:",
                    "    -",
                    '        name: "first"',
                    "        enabled: false",
                    "",
                ].join("\n")
            )
        );

        assertInvalidFixture(
            writeFixture(
                "duplicate-key.yaml",
                [
                    "---",
                    'name: "first"',
                    'name: "second"',
                    "",
                ].join("\n")
            ),
            "key-duplicates"
        );
        assertInvalidFixture(
            writeFixture(
                "bad-indentation.yaml",
                [
                    "---",
                    "root:",
                    "  child: true",
                    "",
                ].join("\n")
            ),
            "indentation"
        );
        assertInvalidFixture(
            writeFixture(
                "truthy-value.yaml",
                [
                    "---",
                    "enabled: on",
                    "",
                ].join("\n")
            ),
            "truthy"
        );
        assertInvalidFixture(
            writeFixture("trailing-spaces.yaml", "---\nenabled: true  \n"),
            "trailing-spaces"
        );
        assertInvalidFixture(
            writeFixture("missing-final-newline.yaml", "---\nenabled: true"),
            "new-line-at-end-of-file"
        );
    } finally {
        rmSync(fixtureDirectory, { force: true, recursive: true });
    }

    console.log(`${yamllintRunner.label} smoke tests passed.`);
};

try {
    main();
} catch (error) {
    console.error(error);
    process.exitCode = 1;
}
