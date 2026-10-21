[![CI](https://github.com/microph1/microphi/actions/workflows/main.yml/badge.svg)](https://github.com/microph1/microphi/actions/workflows/main.yml) [![lerna--lite](https://img.shields.io/badge/maintained%20with-lerna--lite-e137ff)](https://github.com/lerna-lite/lerna-lite)

# Microphi

Monorepo for the microphi (μφ) project: small, decorator-driven TypeScript libraries.

## Packages

| Package | | Description |
|---|---|---|
| [`@microphi/di`](packages/di) | [![npm](https://img.shields.io/npm/v/@microphi/di)](https://www.npmjs.com/package/@microphi/di) | Handcrafted DI container: `@Injectable`, `@Inject`, `@DI`, aspects (`@Before`, `@After`, `@Cache`) and a `TestBed` |
| [`@microphi/store`](packages/store) | [![npm](https://img.shields.io/npm/v/@microphi/store)](https://www.npmjs.com/package/@microphi/store) | Pure RxJS state manager driven by `@Effect` / `@Reduce` decorators |
| [`@microphi/flux`](packages/flux) | [![npm](https://img.shields.io/npm/v/@microphi/flux)](https://www.npmjs.com/package/@microphi/flux) | Web-component framework: `@Component`, template bindings, `fx-for` / `fx-if` |
| [`@microphi/styles`](packages/styles) | [![npm](https://img.shields.io/npm/v/@microphi/styles)](https://www.npmjs.com/package/@microphi/styles) | Flex-first SCSS utilities |
| [`@microphi/json-db`](packages/json-db) | [![npm](https://img.shields.io/npm/v/@microphi/json-db)](https://www.npmjs.com/package/@microphi/json-db) | Small file-based JSON database with full-text search ([minisearch](https://github.com/lucaong/minisearch)) |
| [`@microphi/list`](packages/list) | [![npm](https://img.shields.io/npm/v/@microphi/list)](https://www.npmjs.com/package/@microphi/list) | List with array ordering and direct lookup by id (Map + id array) |
| [`@microphi/debug`](packages/debug) | [![npm](https://img.shields.io/npm/v/@microphi/debug)](https://www.npmjs.com/package/@microphi/debug) | Namespaced `console.log` wrapper, filtered by the `DEBUG` env var |

## Development

Requires Node 24 and npm.

```sh
npm install
npm run build      # build every package (dependents need their deps' lib/ output)
npm run lint:ci
npm run test:ci    # vitest for node packages, jest for flux
```

## Releasing

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). Every push to `master` runs `lerna publish --conventional-commits`, which versions changed packages independently, tags them, creates GitHub releases and publishes to npm through trusted publishing (OIDC).

If tags were created but the npm publish failed, run the **Test - Build - Version and Deploy** workflow manually: it publishes whatever versions in `package.json` are not on npm yet.
