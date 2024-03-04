declare const process: object;

export function isNodejs() {
  return process !== undefined;
}
