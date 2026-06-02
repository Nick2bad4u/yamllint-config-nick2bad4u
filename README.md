# yamllint-config-nick2bad4u

[![CI](https://github.com/Nick2bad4u/yamllint-config-nick2bad4u/actions/workflows/ci.yml/badge.svg)](https://github.com/Nick2bad4u/yamllint-config-nick2bad4u/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/yamllint-config-nick2bad4u.svg)](https://www.npmjs.com/package/yamllint-config-nick2bad4u)

Shared yamllint config for Nick2bad4u projects.

## Install

```sh
npm install --save-dev yamllint-config-nick2bad4u
```

## Usage

yamllint consumes config files by path:

```sh
yamllint -c node_modules/yamllint-config-nick2bad4u/.yamllint .
```

The same config is exported as `yamllint.yaml` for tools that prefer a non-dotfile path.

## Verification

```sh
npm run release:verify
```
