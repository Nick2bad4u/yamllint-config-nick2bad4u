# yamllint-config-nick2bad4u

[![CI](https://github.com/Nick2bad4u/yamllint-config-nick2bad4u/actions/workflows/ci.yml/badge.svg)](https://github.com/Nick2bad4u/yamllint-config-nick2bad4u/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/yamllint-config-nick2bad4u.svg)](https://www.npmjs.com/package/yamllint-config-nick2bad4u)
[![npm license.](https://flat.badgen.net/npm/license/yamllint-config-nick2bad4u?color=purple)](https://github.com/Nick2bad4u/yamllint-config-nick2bad4u/blob/main/LICENSE)
[![npm total downloads.](https://flat.badgen.net/npm/dt/yamllint-config-nick2bad4u?color=pink)](https://www.npmjs.com/package/yamllint-config-nick2bad4u)
[![latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/yamllint-config-nick2bad4u?color=cyan)](https://github.com/Nick2bad4u/yamllint-config-nick2bad4u/releases)
[![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/yamllint-config-nick2bad4u?color=yellow)](https://github.com/Nick2bad4u/yamllint-config-nick2bad4u/stargazers)
[![GitHub forks.](https://flat.badgen.net/github/forks/Nick2bad4u/yamllint-config-nick2bad4u?color=green)](https://github.com/Nick2bad4u/yamllint-config-nick2bad4u/forks)
[![GitHub open issues.](https://flat.badgen.net/github/open-issues/Nick2bad4u/yamllint-config-nick2bad4u?color=red)](https://github.com/Nick2bad4u/yamllint-config-nick2bad4u/issues)
[![codecov.](https://flat.badgen.net/codecov/github/Nick2bad4u/yamllint-config-nick2bad4u?color=blue)](https://codecov.io/gh/Nick2bad4u/yamllint-config-nick2bad4u)

Shared [yamllint](https://yamllint.readthedocs.io/en/stable/) configuration for
Nick2bad4u projects.

This package intentionally stays small: it publishes raw yamllint config files
plus a typed resolver helper. It does not wrap yamllint in a custom CLI, because
yamllint already supports external config files with `-c` and
`YAMLLINT_CONFIG_FILE`.

## What It Enforces

- Extends yamllint's `default` profile.
- Uses 4-space YAML indentation with consistent sequence indentation.
- Treats duplicate keys, malformed merge keys, bad spacing, trailing spaces, and
  missing final newlines as errors.
- Keeps long lines as warnings at 200 characters so generated links and schema
  values remain readable without hiding the signal.
- Allows GitHub Actions-style truthy keys by disabling truthy checks for keys,
  while limiting unquoted truthy values to `true` and `false`.
- Ignores common dependency, build, coverage, release, cache, and mutation-test
  output directories.

## Install

Install this package in the project that should share the config:

```sh
npm install --save-dev yamllint-config-nick2bad4u
```

Install `yamllint` separately with your Python or OS package manager:

```sh
python -m pip install yamllint
```

## Usage

Run yamllint with the packaged dotfile config:

```sh
yamllint -c node_modules/yamllint-config-nick2bad4u/.yamllint .
```

Use `--strict` in CI if warnings should fail the job:

```sh
yamllint --strict -c node_modules/yamllint-config-nick2bad4u/.yamllint .
```

The same config is also published as `yamllint.yaml` for tools that avoid
dotfile paths:

```sh
yamllint -c node_modules/yamllint-config-nick2bad4u/yamllint.yaml .
```

PowerShell consumers can set `YAMLLINT_CONFIG_FILE` for repeated local runs:

```powershell
$env:YAMLLINT_CONFIG_FILE = "node_modules/yamllint-config-nick2bad4u/.yamllint"
yamllint .
```

## TypeScript Helper

Node-based tooling can resolve the packaged config path without hardcoding the
package layout:

```ts
import { configPath, resolveConfigPath } from "yamllint-config-nick2bad4u";

console.log(configPath);
console.log(resolveConfigPath(import.meta.url));
```

## Published Files

- `.yamllint`
- `yamllint.yaml`
- `dist/preset.js`
- `dist/preset.d.ts`

## Development

Run the full release gate before publishing or claiming the package is ready:

```sh
npm run release:verify
```

Run coverage directly when changing the resolver helper or package contract
tests:

```sh
npm run coverage
```

Run the native yamllint smoke test directly when changing `.yamllint` or
`yamllint.yaml`:

```sh
npm run test:yamllint
```
