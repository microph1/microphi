# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.9.0](https://github.com/microph1/microphi/compare/v2.8.2...v2.9.0) (2024-11-04)

### Features

* **store:** add delay decorator ([0c1ff5d](https://github.com/microph1/microphi/commit/0c1ff5d6c5feaa777d613a7ba52118c5e2e7f210))

## [2.8.2](https://github.com/microph1/microphi/compare/v2.8.1...v2.8.2) (2024-11-03)

**Note:** Version bump only for package microphi

## [2.8.1](https://github.com/microph1/microphi/compare/v2.8.0...v2.8.1) (2024-11-03)

### Bug Fixes

* **store:** add new stuff to public API ([0065ac6](https://github.com/microph1/microphi/commit/0065ac6b51893951a1ff5b835713b2ac9e73f6ea))

# [2.8.0](https://github.com/microph1/microphi/compare/v2.7.4...v2.8.0) (2024-11-03)

### Features

* **@microphi/socket.io-rpc:** scaffold package ([079a461](https://github.com/microph1/microphi/commit/079a4612da899602fad2210cd4d0275466fcd657))
* **store:** add @Cache decorator ([30a8905](https://github.com/microph1/microphi/commit/30a89058e5b734d120d759f1a8e66ef5113a6c2f))
* **store:** add debounce decorator for effects ([ea3872c](https://github.com/microph1/microphi/commit/ea3872ca5201abcc85e08478db17dc4aebd754ae))

## [2.7.4](https://github.com/microph1/microphi/compare/v2.7.3...v2.7.4) (2024-09-11)

**Note:** Version bump only for package microphi

## [2.7.3](https://github.com/microph1/microphi/compare/v2.7.2...v2.7.3) (2024-09-11)

### Bug Fixes

* **json-db:** when updating a document its created field was getting lost ([3808128](https://github.com/microph1/microphi/commit/3808128151828fee578fb7a3d83fc5fa6ecddee2))

## [2.7.2](https://github.com/microph1/microphi/compare/v2.7.1...v2.7.2) (2024-05-14)

### Bug Fixes

* **di:** in cjs exporting testing modules causes troubles ([fda9722](https://github.com/microph1/microphi/commit/fda972251d32dcf055837afb04d318dc76a72610))
* **di:** remove exports field ([257eea7](https://github.com/microph1/microphi/commit/257eea7b80190babccf4c46dde844c120735e425))
* publish step was failing after switch to hybrid packages ([9be11cf](https://github.com/microph1/microphi/commit/9be11cf7a2d97218c8bf5a850003003e80f13578))
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

### Features

* **debug:** Publish commonjs version ([e3a800f](https://github.com/microph1/microphi/commit/e3a800f2aa73c4f30aacc282c00376f262624400))

### Reverts

* Revert "fix(json-db): get and getAll should not possibily return undefined" ([def9136](https://github.com/microph1/microphi/commit/def9136b066ebcf34f03582b974237e5ead69354))

## [2.5.1](https://github.com/microph1/microphi/compare/v2.5.0...v2.5.1) (2024-04-26)

### Bug Fixes

* revert changes in building extra commonjs and default to build commonjs for some packages ([5ebd9f7](https://github.com/microph1/microphi/commit/5ebd9f72ec43171495d709f09deaf507c08bfdc7))

# [2.5.0](https://github.com/microph1/microphi/compare/v2.4.0...v2.5.0) (2024-04-26)

### Features

* enable publishing of commonjs builds ([db32abe](https://github.com/microph1/microphi/commit/db32abe5c1680b83ecd886b382011d834ed2006f))

# [2.4.0](https://github.com/microph1/microphi/compare/v2.3.1...v2.4.0) (2024-04-05)

**Note:** Version bump only for package microphi

## [2.3.1](https://github.com/microph1/microphi/compare/v2.3.0...v2.3.1) (2024-03-29)

**Note:** Version bump only for package microphi

# [2.3.0](https://github.com/microph1/microphi/compare/v2.2.3...v2.3.0) (2024-03-29)

### Features

* **json-db:** add json-storage class with test ([f5d4faf](https://github.com/microph1/microphi/commit/f5d4faf5cb43b28e286be40950e1b455ead1567b))
* **json-db:** move list from store to json-db ([14b0587](https://github.com/microph1/microphi/commit/14b0587d01750005c0a763a0bcc66e2056010fc2))

## [2.2.3](https://github.com/microph1/microphi/compare/v2.2.2...v2.2.3) (2024-03-27)

**Note:** Version bump only for package microphi

## [2.2.2](https://github.com/microph1/microphi/compare/v2.2.1...v2.2.2) (2024-03-27)

**Note:** Version bump only for package microphi

## [2.2.1](https://github.com/microph1/microphi/compare/v2.2.0...v2.2.1) (2024-03-27)

### Bug Fixes

* **di:** it should build typings ([1c203c1](https://github.com/microph1/microphi/commit/1c203c1dec314642cc2d86f1876ee3038cc216e6))

# [2.2.0](https://github.com/microph1/microphi/compare/v1.2.0...v2.2.0) (2024-03-18)

### Bug Fixes

* merge errors ([e4535a7](https://github.com/microph1/microphi/commit/e4535a77c882a0d70851c4de600c948c1c2f3718))

### Features

* **@flux/core:** new `@Hydrated` decorator, some changes on when lifecyle hooks take place ([026be18](https://github.com/microph1/microphi/commit/026be18099ff792f41fd6918dad026c9a602973f))
* **flux/core:** WIP many fronts ([d7069d9](https://github.com/microph1/microphi/commit/d7069d975892eb774353b3348b6229cd020a38b0))
* **marbles:** add new marbles project ([0e76a8e](https://github.com/microph1/microphi/commit/0e76a8e3a825cea3686fc2e69803d2b3af4416a1))
* **metronoman-flux:** several changes here see below ([e3ea754](https://github.com/microph1/microphi/commit/e3ea754b0bc7eccad3701a20ee1b4312e5b50061))
* migrate @microgamma/digator to @microphi/di ([e2e71e1](https://github.com/microph1/microphi/commit/e2e71e117411efdb6f2372fee086caaa31f0d234))
* start migration of flux ([9f6c6d5](https://github.com/microph1/microphi/commit/9f6c6d5c1259b24519e17461b301e2a87901e1db))
* **web-components:** experimenting with non shadow dom components ([3172061](https://github.com/microph1/microphi/commit/31720612c046252a1c7d1dbad912d027a916a383))

# [1.2.0](https://github.com/microph1/microphi/compare/v1.1.7...v1.2.0) (2024-03-15)

### Features

* **debug:** add onMessage handle so that user can ([05b79ec](https://github.com/microph1/microphi/commit/05b79ecd9345e2b9fe3f81a11ae80099b2a4db72))

## [1.1.7](https://github.com/microph1/microphi/compare/v1.1.6...v1.1.7) (2024-03-04)

**Note:** Version bump only for package microphi

## [1.1.6](https://github.com/microph1/microphi/compare/v1.1.5...v1.1.6) (2024-03-04)

### Bug Fixes

* **debug:** avoid referencing directly process or window. use try catch instead ([7131495](https://github.com/microph1/microphi/commit/7131495c4deccf974f2062bfbba0698a5dcfb348))
* **debug:** use assertive logic to dectec environment ([79fe9e6](https://github.com/microph1/microphi/commit/79fe9e6da757f98dd3ac7468ea04e13817feb3cb))
* **debug:** use ES6 and nodenext to build the project to allow nodejs compatibility ([ffd4740](https://github.com/microph1/microphi/commit/ffd4740235bb0047052145dbc252c8f8505a6df7))

## [1.1.5](https://github.com/microph1/microphi/compare/v1.1.4...v1.1.5) (2024-03-04)

### Bug Fixes

* need to run prepack lifecycle ([4dec0e7](https://github.com/microph1/microphi/commit/4dec0e7a269e963448c8b74a141891bd2f39e021))

## [1.1.4](https://github.com/microph1/microphi/compare/v16.4.0...v1.1.4) (2024-03-04)

**Note:** Version bump only for package microphi

# [16.4.0](https://github.com/microph1/microphi/compare/v16.3.0...v16.4.0) (2024-03-04)

### Features

* **debug:** have only one color palette. add colors for nodejs ([2409069](https://github.com/microph1/microphi/commit/240906954abe0ed24d8941e94c01d1be7245156b))

# [16.3.0](https://github.com/microph1/microphi/compare/v1.1.3...v16.3.0) (2024-03-02)

### Bug Fixes

* refactor copied files ([8991a71](https://github.com/microph1/microphi/commit/8991a719bfc2955e03a06674d66a62049ececa68))

### Features

* **ci:** add github workflows ([180d2ce](https://github.com/microph1/microphi/commit/180d2ce0b188dc07e18fd0d8e2d249eeb0e46028))
* **debug:** add debug package ([0e7d497](https://github.com/microph1/microphi/commit/0e7d4976a36b9dd83a8ec0f50593fd7f5b0b4b59))

## [1.1.3](https://github.com/microph1/microphi/compare/v1.1.2...v1.1.3) (2023-09-07)

**Note:** Version bump only for package microphi

## [1.1.2](https://github.com/microph1/microphi/compare/v1.1.0...v1.1.2) (2023-09-07)

### Bug Fixes

* **store:** effects is an array, we need to `find` on that by name ([a184432](https://github.com/microph1/microphi/commit/a1844325e3833f04d27171d2f09d80e19c7f1159))

# [1.1.0](https://github.com/microph1/microphi/compare/v0.2.10...v1.1.0) (2023-01-16)

### Bug Fixes

* **microphi:** fix microphi website dev build ([38733b3](https://github.com/microph1/microphi/commit/38733b3a29fc2370b371f918ab08b0ca579e2d29))
* **microphi:** remove ssr init ([566dece](https://github.com/microph1/microphi/commit/566decee77a782cebd6f93ec3d1cf699043e6875))

### Features

* **flux:** add new applicatino ([e0ad8ad](https://github.com/microph1/microphi/commit/e0ad8ad4602afae30af7f9b8c24d061464dbc418))
* scaffold experimental flux-language-service ([25d196c](https://github.com/microph1/microphi/commit/25d196c7660727641f10215d33e201a594c9ff73))
* **store:** complete new design for the store ([4621dbe](https://github.com/microph1/microphi/commit/4621dbe731587cb693bde768b631b22b6ccb2c1c))
* **store:** import latest vestion of store ([af858af](https://github.com/microph1/microphi/commit/af858af501fb39f8185d226b032629e5cb9fc19d))
* **store:** store should not implements angular hooks ([3bfca03](https://github.com/microph1/microphi/commit/3bfca03979f2e8858558c306fefe17534b5410d1))
* **test:** add expect-observable ([8dc3267](https://github.com/microph1/microphi/commit/8dc326788bbe154ff90adf67d7c5db63cb076ae6))
* **test:** wrap rxjs `TestScheduler` ([7e8166d](https://github.com/microph1/microphi/commit/7e8166d08d3f4406fa993ed02d2a3832978ba311))
* **web-components:** add basic mechanism for directives and pipes ([159db24](https://github.com/microph1/microphi/commit/159db2487107000de9d070070d38d3eb8eb7c3b8))
* **web-components:** adding sample web-components app: ([bc7f874](https://github.com/microph1/microphi/commit/bc7f87425d67eb7ff49944d1f00b6068dd8f96f0))
