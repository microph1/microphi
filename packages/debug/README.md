# @microphi/debug

> Super simple wrapper around console.log

# Install
```
@microphi/debug
```

# Log

```javascript
import { getDebugger } from "@microphi/debug";

export const d = getDebugger('namespace1');

// any where in the code
d('test');
setTimeout(() => {
  d('hello there');
}, 500);
```
You need to set the `DEBUG` environment variable if running on nodejs or `localStorage.debug` if running in the browser.
In any case its value is a comma separated list of regex: if a match happens with the namespace then the text will be logged using `console.log`.

On each line a timestap is printed and if two or more line from the same namespace are printed out in less the one second then they will show `+ xxx ms` to indicate their offset.

![nodejs example output](../../.github/assets/debug_nodejs_output.png)
