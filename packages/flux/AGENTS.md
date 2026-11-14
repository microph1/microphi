# @microphi/flux — notes for coding agents

Experimental web-component framework. Full docs: [README.md](README.md); every error code: [ERRORS.md](ERRORS.md).

## Rules

- It is **not Angular**: there are no modules, no `ngIf`/`ngFor`, no change detection zones. Use `<fx-if [condition]="...">` and `<fx-for let="item" [of]="items">`.
- Requires `"experimentalDecorators": true`; components are resolved through `@microphi/di`.
- A component is `@Component({ selector, template })` on a class; the selector must contain a dash (custom element rule).
- Every component used in a template must be listed in `@App({ declarations })` (or imported before the parent renders), otherwise `[input]` bindings on it fail with `FLUX002`.
- Template syntax: `{{expr}}`, `{{value | pipe}}` (pipes via `registerPipe`), `(event)="method(arg, $event)"`, `[prop]="expr"`, `#ref`.
- Event bindings call methods on the component, or on the parent controller inside `fx-for` (`FLUX001` when neither has it).
- Inputs are `@Input()` properties; react to them in `fxOnChanges(changes)`. Lifecycle: `fxOnInit`, `fxOnViewInit`, `fxOnChanges`, `fxOnDestroy`.
- Styles in the template are scoped by the shadow DOM; use `registerGlobalStyles(...urls)` for shared CSS.

## Testing

Tests run in jsdom (jest-environment-jsdom): create the element with `document.createElement(selector)`, append it to `document.body`, and wait for rendering before asserting on its `shadowRoot`.
