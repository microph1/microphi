# @microphi/workos — notes for coding agents

WorkOS AuthKit for APIs and Angular apps, and a fake WorkOS. Full docs: [README.md](README.md).

## Rules

- ESM only, three entries: root (server, framework-free), `/angular`, `/testing`. The root must not import Angular or the browser SDK.
- Relative imports carry `.js`: the output runs in plain Node ESM.
- No Angular decorators anywhere: the package is built by `tsc`, not ng-packagr. Provide classes with `useFactory`, write guards/interceptors as functions, use guards instead of components.
- `WorkosVerifier` throws `WorkosAuthError` with an HTTP `status`; never a framework error.
- `/testing` must stay loadable in a browser (the fake client is lazy-loaded by `AuthKit` when the config says `fake`) and in Node (`TestIssuer`).
- Tests never touch the network: stub `fetch` with `TestIssuer.fetch`. Angular specs start with `// @vitest-environment jsdom`, import `@angular/compiler` and init `BrowserTestingModule`; don't use `provideAuthKit()` in specs that call `init()` themselves (TestBed runs the initializer).
