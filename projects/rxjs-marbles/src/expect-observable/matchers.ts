export const matchers = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toContain: (actual, expected) => {
    throw Error('Implement me!');
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toEqual: (actual, expected) => {
    throw Error('Implement me!');
  }
};

export function setMatchers(toContain, toEqual) {
  matchers.toContain = toContain;
  matchers.toEqual = toEqual;
}
