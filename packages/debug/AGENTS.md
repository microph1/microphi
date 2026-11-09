# @microphi/debug — notes for coding agents

Namespaced logger. Full docs: [README.md](README.md).

## Rules

- `const d = getDebugger('app:module'); d('message', data);` — one debugger per module, namespaces separated by `:`.
- Output is off unless enabled: `DEBUG=app:.*` (comma-separated regexes) in Node, `localStorage.debug = 'app:.*'` in the browser. If logs are missing, check that first.
- `onMessage(cb)` receives every message (while `DEBUG` is set), to ship logs elsewhere.
- `import '@microphi/debug/console-to-file'` redirects `console.log` to `CONSOLE_LOG_FILE` (Node only, global side effect: import it once at the entry point).
