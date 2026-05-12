# @microphi/debug

> Super simple wrapper around console.log


# Install
```
@microphi/debug
```

## Use in nodejs

```javascript
import { getDebugger } from "@microphi/debug";

export const d = getDebugger('namespace1');

// any where in the code
d('test');
setTimeout(() => {
  d('hello there');
}, 500);
```
Set `DEBUG` environment variable with a comma separated list of regex: if a match happens with a namespace then the text will be logged using `console.log`.


![nodejs example output](../../.github/assets/debug_nodejs_output.png)

## Use in the browser
Set `localStorage.debug` with a comma separated list of regex: if a match happens with a namespace then the text will be logged using `console.log`.

![browser example output](../../.github/assets/debug_browser_output.png)

In this case `localStorage.debug` is set to `musicbox:*`

### OnMessage handler
With `OnMessage` is possible to handle each message logged regardless of the regexes provided. This may be usefull to send the logs to a server or to to store them to a file.

```javascript
onMessage((message) => {
  // do something
});
```

### Console to File
To redirect all `console.log` calls to a file instead of the console, import the decorator:

```javascript
import '@microphi/debug/console-to-file';

// Now all console.log calls will append to a file
console.log('This goes to file');
```

Set the `CONSOLE_LOG_FILE` environment variable to specify the file path (default: `./console.log`).

Note: This is only effective in Node.js environments. In browsers, it will log a warning and have no effect.
