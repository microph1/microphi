export const matchers = {
  toContain: (actual, expected) => {
    throw Error('Implement me!');
  },
  toEqual: (actual, expected) => {
    throw Error('Implement me!');
  }
};

export function setMatchers(toContain, toEqual) {
  matchers.toContain = toContain;
  matchers.toEqual = toEqual;
}
