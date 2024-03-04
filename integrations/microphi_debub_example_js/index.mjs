import { getDebugger } from "@microphi/debug";
// import * as debug from '@microphi/debug';
// console.log({debug});

const d = getDebugger('namespace1');

d('test');
setTimeout(() => {
  d('hello there');
}, 500);
