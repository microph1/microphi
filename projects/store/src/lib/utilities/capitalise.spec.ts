import { capitalise } from './capitalise';

describe('capitalise', () => {
  it('should be defensive', () => {
    expect(capitalise('')).toEqual('');
  });

  it('should capitalise first letter', () => {
    expect(capitalise('hello')).toEqual('Hello');
    expect(capitalise('hello world')).toEqual('Hello world');
    expect(capitalise('Hello world')).toEqual('Hello world');
    expect(capitalise('1hello world')).toEqual('1hello world');
    expect(capitalise(' hello world')).toEqual(' hello world');
  });
});
