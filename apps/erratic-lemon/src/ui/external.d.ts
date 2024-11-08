// external.d.ts
// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword
declare module JSX {
  type Element = string;
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}