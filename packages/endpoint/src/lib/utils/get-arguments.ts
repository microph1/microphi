export type FunctionArg = string;

/**
 * Returns an array of arguments' name of the given function
 *
 * I.E.:
 * function test(arg1, arg2, arg3) { }
 *
 * const args = getArguments(fn);
 * d(args);
 *
 * // ['arg1', 'arg2', 'arg3']
 *
 * @param fn
 * @returns {string[]}
 */
export function getArguments(fn: (...args) => any): FunctionArg[] {

  const FN_ARGS = /^[a-zA_Z]\s*[^(]*\(\s*([^)]*)\)/m;
  const FN_ARG_SPLIT = /,/;
  const FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
  const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;


  const $inject: string[] = [];
  let fnText;
  let argDecl;

  if (typeof fn === 'function') {
    fnText = fn.toString().replace(STRIP_COMMENTS, '');
    argDecl = fnText.match(FN_ARGS);
    argDecl[1].split(FN_ARG_SPLIT).forEach(function (arg: any) {
      arg.replace(FN_ARG, function (all: any, underscore: any, name: any) {
        // d(all, underscore);
        $inject.push(name);
      });
    });
  } else {
    throw Error(`${fn} is not a function`);
  }

  return $inject;
}
