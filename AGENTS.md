# AGENTS.md

Playbook for automated contributors working inside the Microphi monorepo. Follow every section in order—skipping steps creates drift that is painful to unwind later.

## Quick Orientation
- Monorepo uses Angular CLI + custom TypeScript packages managed via Lerna workspaces (`packages/*`, `apps/www.dcsoftware.io`).
- Toolchain expects Node 24 with npm; the lockfile is `package-lock.json`.
- TypeScript is strict (`tsconfig.json` enforces `strict`, `noImplicitOverride`, `forceConsistentCasingInFileNames`).
- RxJS, custom stores, and decorators power most runtime behavior—prefer extending existing abstractions instead of inventing new ones.
- There are no Cursor or GitHub Copilot rule files in this repo; this document is the single source of truth for agent guidance.

## Build, Lint, Test Commands
- `npm run build` — orchestrates `lerna run build` for every package/app; default target is dev.
- `npm run build:ci` — runs CI-safe build pipeline (`lerna run build:ci`) with production configs (Angular apps use `production` configurations defined in `angular.json`).
- `npm run start` — proxied to `ng serve`; `flux` (the Angular app in `apps/flux`) is the only Angular CLI project left.
- `npm run lint:ci` — runs `lerna run lint --parallel`; lint before opening PRs or staging large diffs.
- `npm run test` — root entry: Jest for `flux` (jsdom, listed in `jest.config.ts`), then Vitest for the node packages (`debug`, `di`, `list`, `store`, `json-db`, listed via `vitest.config.mts` projects).
- `npm run test:ci` — `lerna run test:ci` fan-out; required pre-commit.

## Running a Single Test
- For a specific spec in a Vitest package, run it from the package: `cd packages/store && npx vitest run src/lib/store/store.spec.ts`; for `flux` use Jest: `npx jest packages/flux/src/lib/... --runTestsByPath`.
- Narrow to a single test name with `--testNamePattern "should update loading state"` (regex friendly).
- When debugging a package script, target it with Lerna scope: `npx lerna run test --scope @microphi/store --stream -- --watch`.
- Angular component tests follow the same Jest harness because `jest-preset-angular` is wired globally—no `ng test` wrappers exist.
- Snapshot updates must be run through `npx jest <path> -u`; never edit `.snap` files manually.

## Project Layout
- `packages/store`, `packages/flux`, `packages/debug`, etc. house publishable libraries; each exposes a `src/lib` entry and a generated `lib/esm` output for consumers via path aliases in `tsconfig.json`.
- `apps/*` folders are frontends: `www.dcsoftware.io` (consulting site, deployed to Deno Deploy by `deploy_dcsoftware.yml`), `flux` (Angular loudspeaker-design app), `metronoman-flux` (flux metronome experiment).
- `dist/`, `coverage/`, `lerna-debug.log`, `node_modules/` are artifacts—never edit by hand.

## Toolchain Reference
- Angular CLI config lives in `angular.json`; prefer `ng g` schematics for components/services.
- Lerna-lite handles versioning (`npm run release`) and deployment (`npm run deploy:ci`).
- Testing: Vitest (`vitest.config.mts` per package, v8 coverage) for the node packages; Jest + `ts-jest` + `jest-preset-angular` for `flux`. New packages need a `vitest.config.mts` (or a Jest project entry in `jest.config.ts`).
- Linting: `.eslintrc.js` enforces `eslint:recommended` + `@typescript-eslint/recommended` with repo-specific rules (2-space indent, single quotes, mandatory semicolons).
- RxJS is ubiquitous; use `rxjs/operators` imports to keep tree-shaking effective.

## TypeScript & Imports
- Use path aliases declared in `tsconfig.json` (`@microphi/store`, `@microphi/debug`, etc.) for intra-repo references—avoid deep relative paths across packages.
- Always enable strict types in new `tsconfig` extends; do not opt out of `strictTemplates` or `strictInjectionParameters` for Angular features.
- Favor interfaces over type aliases for contracts shared across packages; align exported names with folder names (e.g., `CacheSymbol` in `operators/cache.ts`).
- Barrel files (`src/index.ts`) should only re-export stable APIs; keep private helpers within their module tree.
- Observables should be typed (`Observable<MyType>`); never use `Observable<any>` except where legacy code already uses disabled lint rules.

## Formatting & Structure
- Use 2-space indentation, Unix line endings, single quotes, and required semicolons; ESLint will reject deviations.
- Keep imports ordered: Node/Angular modules first, third-party libs next, path aliases last; separate sections with blank lines when mixing runtime and type-only imports.
- Avoid default exports—project prefers named exports for treeshaking and clarity.
- Multi-line method chains should align operators vertically (see `Store.select` in `packages/store/src/lib/store/store.ts`).
- JSON config files must remain minified/compact unless human readability is critical (e.g., `tsconfig.json`).

## Naming & API Design
- Actions/reducers follow the `dispatch('loadData')` + `onLoadData` convention documented in `packages/store`; preserve the `on + PascalCase(action)` rule so the store can derive reducer names.
- Observables end with `$` (`loading$`, `state$`), BehaviorSubjects use `_` prefix to indicate privacy.
- Public Angular components/directives/services use PascalCase; selectors remain kebab-case.
- File names mirror their primary export (e.g., `operators/cache.ts` defines `CacheSymbol`).
- When adding CLI scripts, keep names hyphenated and verbs first (`sync-translations.mjs`).

## Error Handling & Logging
- Follow `Store.swallowError` pattern: log via `console.log` (or `console.error` for critical paths) with the action key, then emit a `LoadingState` event so subscribers stop waiting.
- Never throw raw errors from Observables that feed UI—return `EMPTY` or fallback values and surface errors through dedicated streams.
- For REST/GraphQL clients, wrap fetch failures in domain-specific error classes and include retry strategy hooks.
- Do not silence errors in deploy scripts; let Serverless/Angular CLI exit codes bubble up so CI can fail fast.
- When adding logging, keep it server-friendly (structured objects) and gate verbose logs behind environment checks.

## Angular & RxJS Patterns
- Templates should be `OnPush` by default; if you must use default strategy justify it in the MR description.
- Use `async` pipe in templates; avoid manual `subscribe` in components unless you unsubscribe in `ngOnDestroy` via `takeUntil`.
- Prefer `store.select((state) => state.foo)` for derived data; selectors should be pure functions.
- Debounce/delay behavior is configured via decorators in `operators/debounce` and `operators/delay`; reuse them instead of inline `setTimeout` or manual timers.
- Keep effect strategies explicit by passing `EffectStrategy` values (`mergeMap`, `concatMap`, `switchMap`)—do not rely on defaults when racing network calls.

## State Store Conventions
- Initial state must be serializable; the store clones it with `JSON.parse(JSON.stringify(initialState))` to prevent shared references.
- Cache heavy selectors via `CacheSymbol` (a `Map<string, { timestamp; value }>`); invalidate entries when inputs change.
- Always expose loading helpers like `getLoadingFor` so UIs poll the `loading$` stream instead of duplicating status flags.
- Reducers should be pure and synchronous; side effects belong in effects returning Observables.
- Dispatchers must validate actions before pushing (see `dispatch` guard that throws when the action name is unknown).

## Testing Guidelines
- Unit tests live beside implementation (`*.spec.ts`); integration/e2e tests should go under `apps/*/e2e` when needed.
- Mock RxJS streams with marble helpers or `of`/`Subject`—never rely on real timers; use `fakeSchedulers` where appropriate.
- Snapshot tests are acceptable for presentational components only; stores/services should assert emitted values explicitly.
- Use `vi.spyOn(console, 'log')` (or `jest.spyOn` in Jest packages) when verifying logging behavior to keep output clean.
- Generated code (Angular schematics) should still have smoke tests; run `ng g` components with `--skip-tests=false`.

## Documentation & Comments
- Keep high-level package docs under `packages/<name>/README.md`; update them when surface APIs change.
- Comments should explain *why*, not *what*; prefer function-level docblocks to inline remarks unless the logic is non-obvious.
- When referencing equations/Greek letters (e.g., μφ branding), stick to ASCII unless marketing copy already uses Unicode.
- Package changelogs (`packages/<name>/CHANGELOG.md`) are generated by lerna from conventional commits on release; never edit them by hand.

## Git & Commit Workflow
- Follow Conventional Commits: `type(scope): description` using scopes such as package names (`feat(json-db): ...`), components (`fix(flux): ...`), or `microphi` for repo-wide changes.
- Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`. Emojis are allowed but optional.
- Commit process: 1) `git add <files>`; 2) `npm run lint:ci`; 3) `npm run test:ci`; 4) `git commit -m "type(scope): summary"`; 5) push only when the user explicitly asks.
- Split unrelated work into separate commits; never mix formatting-only and behavior changes.
- Keep branches rebased on the default branch; avoid force pushes unless the user explicitly instructs otherwise.

## Pre-flight Checklist Before Opening PRs
- ✅ Clean `git status` (no unstaged files, no generated artifacts).
- ✅ Lint + tests green locally (`npm run lint:ci && npm run test:ci`).
- ✅ Updated READMEs for public packages whose APIs changed.
- ✅ Verified builds for affected apps/packages (`npm run build` or `npm run build:ci`).
- ✅ Noted any feature flags, environment variables, or follow-up tasks in the PR description.

## Dependency Management
- Align package versions via workspace `package.json`; run `npm install` from the repo root so lockfiles stay in sync.
- External deps should target the Angular/Node majors already in use; avoid introducing experimental releases without ADR discussion.
- When adding a dependency for a single package, update that package's `package.json` and rerun the relevant `lerna run build` to ensure typings emit correctly.
- Keep devDependencies lightweight inside packages; favor root-level tooling unless the package is published independently.
- Never edit `package-lock.json` by hand—re-run the npm command that generated it instead.

## Environment & Configuration
- Angular environment settings live under `apps/*/src/environments`; avoid hardcoding secrets in code—use environment tokens or Serverless parameters.
- Feature flags belong in typed config objects; add interfaces describing each flag so tree-shaking works across packages.
- Browser-only globals should be guarded with `isPlatformBrowser` or `typeof window !== 'undefined'` checks to protect SSR builds.
- Keep `.env` files out of the repo; sample values go into `README.md` or `docs/`.

## Performance & Accessibility
- Favor pure pipes and memoized selectors for computed data to minimize template churn.
- Use Angular CDK Observers (Intersection, Resize) instead of manual DOM observers when possible for cross-browser parity.
- Ensure new UI controls meet WCAG AA: include aria labels, focus states, and minimum contrast of 4.5:1 as verified in design tokens.
- Bundle size regressions should be caught by comparing `dist/` output; run `npm run build:ci` when touching shared libs.
- Image/media assets belong in `assets/`; compress SVG/PNG resources before committing.

## Automation Guardrails
- Do not run destructive git commands (`reset --hard`, force pushes) without explicit user instruction; automate via safe scripts only.
- When scripting repetitive edits, prefer codemods (TS transformers, `ts-node`) over regex replacements to keep AST-aware changes.
- Record any one-off automation output under `notes/` or the PR description so reviewers can reproduce when necessary.
- For migrations touching many packages, stage incrementally and run `npm run lint:ci` after each logical chunk to keep diffs reviewable.
- Log automation decisions (flags, environment variables) inside commit bodies when they influence behavior.

## Support Scripts & Utilities
- Investigate `.github/workflows/` before writing new deployment scripts—most scaffolding already exists there.
- Prefer `npx lerna list --scope <pkg>` to confirm package names before targeting them in commands.
- Capture repeatable local workflows inside `scripts/` with descriptive filenames instead of ad-hoc shell snippets.

## Additional Tooling Notes
- There are no Cursor `.cursor/rules` or Copilot instruction files to honor; if one is added later, surface it in this document immediately.
- Respect `.gitignore`; never commit `dist`, `coverage`, `lerna-debug.log`, or local env files.
- Prefer `npm` over `yarn`/`pnpm` to avoid mismatched lockfiles.
