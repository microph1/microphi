# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.7.3](https://github.com/microph1/microphi/compare/v2.7.2...v2.7.3) (2024-09-11)

### Bug Fixes

* **json-db:** when updating a document its created field was getting lost ([3808128](https://github.com/microph1/microphi/commit/3808128151828fee578fb7a3d83fc5fa6ecddee2))

## [2.7.2](https://github.com/microph1/microphi/compare/v2.7.1...v2.7.2) (2024-05-14)

### Bug Fixes

* remove exports field in package json ([3044b3e](https://github.com/microph1/microphi/commit/3044b3e6d20e026240f63cc2272823105950af22))

## [2.7.1](https://github.com/microph1/microphi/compare/v2.7.0...v2.7.1) (2024-05-14)

### Bug Fixes

* publish step was failing after switch to hybrid packages ([dd621e3](https://github.com/microph1/microphi/commit/dd621e356954de1a0f58cd6043c7e29a9a7c9743))

# [2.7.0](https://github.com/microph1/microphi/compare/v2.6.0...v2.7.0) (2024-05-14)

### Features

* allow other packages to publish cjs ([692700c](https://github.com/microph1/microphi/commit/692700c703db8105e51455b578adbcc2f8c0075f))

# [2.6.0](https://github.com/microph1/microphi/compare/v2.5.1...v2.6.0) (2024-05-13)

### Bug Fixes

* **json-db:** get and getAll should not possibily return undefined ([a8ee1f2](https://github.com/microph1/microphi/commit/a8ee1f29e38f676ce813426f95e406c5244e97e5))
* **json-db:** should not compile to commonjs as this generates errors on minisearch ([858bc36](https://github.com/microph1/microphi/commit/858bc364f5b2363d806b38e68571f9e3dc70ac1c))

### Reverts

* Revert "fix(json-db): get and getAll should not possibily return undefined" ([def9136](https://github.com/microph1/microphi/commit/def9136b066ebcf34f03582b974237e5ead69354))

## [2.5.1](https://github.com/microph1/microphi/compare/v2.5.0...v2.5.1) (2024-04-26)

### Bug Fixes

* revert changes in building extra commonjs and default to build commonjs for some packages ([5ebd9f7](https://github.com/microph1/microphi/commit/5ebd9f72ec43171495d709f09deaf507c08bfdc7))

# [2.5.0](https://github.com/microph1/microphi/compare/v2.4.0...v2.5.0) (2024-04-26)

### Features

* enable publishing of commonjs builds ([db32abe](https://github.com/microph1/microphi/commit/db32abe5c1680b83ecd886b382011d834ed2006f))

# [2.4.0](https://github.com/microph1/microphi/compare/v2.3.1...v2.4.0) (2024-04-05)

**Note:** Version bump only for package @microphi/json-db

# [2.3.0](https://github.com/microph1/microphi/compare/v2.2.3...v2.3.0) (2024-03-29)

### Features

* **json-db:** add json-storage class with test ([f5d4faf](https://github.com/microph1/microphi/commit/f5d4faf5cb43b28e286be40950e1b455ead1567b))
* **json-db:** move list from store to json-db ([14b0587](https://github.com/microph1/microphi/commit/14b0587d01750005c0a763a0bcc66e2056010fc2))
