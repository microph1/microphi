declare const process: object;

export function isNodejs() {
  let isNode = false;

  try {

    if (typeof process === 'object') {
      isNode = true;
    }
  } catch (error) {

    console.log('process is not an object. this is likely the browser');
  }

  return isNode;
}
