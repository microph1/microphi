import { Log, getDebugger } from './debug';

jest.mock('./get-environment-varialbles', () => {
  return {

    getEnvironmentVariables: () => {
      return { DEBUG: 'namespace' };
    }
  }

});

describe('debug', () => {

  let d: Log;
  let notD: Log;

  beforeEach(() => {
    d = getDebugger('namespace');
    notD = getDebugger('this_wont_log');
    const spy = jest.spyOn(console, 'log');
    spy.mockReset();
  });

  it('should exists', () => {
    expect(d).toBeTruthy();
  });

  it('should log', () => {
    d('test');
    expect(console.log).toHaveBeenCalled();
  });

  it('should not log', () => {
    notD('test');
    expect(console.log).not.toHaveBeenCalled();
  });

});
