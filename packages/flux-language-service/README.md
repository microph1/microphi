# @microphi/flux-language-service

> TypeScript language service plugin for [`@microphi/flux`](../flux) templates (work in progress, not published)

The goal is what `@angular/language-service` is for Angular: completions, diagnostics and navigation inside `@Component` templates, resolved against the component class.

## Status

Early experiment. The plugin loads into `tsserver` through [typescript-template-language-service-decorator](https://github.com/microsoft/typescript-template-language-service-decorator) and logs what it sees; the completion provider currently just echoes the line under the cursor. `src/webpack/` holds an equally early HTML preprocessor and webpack plugin for template files.

## Try it locally

```sh
npm run build -w packages/flux-language-service
```

Register the plugin in the `tsconfig.json` of a flux project:

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "@microphi/flux-language-service" }]
  }
}
```

In VS Code select **TypeScript: Select TypeScript Version → Use Workspace Version**, then restart the TS server. Plugin output goes to the TS server log, prefixed with `[@flux]`; `.vscode/launch.json` attaches a debugger to the running TS server.
