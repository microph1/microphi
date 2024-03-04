import { Log, getDebugger } from './debug';

describe('debug', () => {

  let d: Log;

  beforeEach(() => {
    d = getDebugger('namespace');
  });

  it('should exists', () => {
    expect(d).toBeTruthy();
  });

  it('should log', () => {
    jest.spyOn(console, 'log');

    d('test');

    expect(console.log).toHaveBeenCalled();
  });

});
