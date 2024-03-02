import { getDebugger } from "@microgamma/loggator";

describe('debug', () => {

  let d: unknown;

  beforeEach(() => {

    d = getDebugger('namespace');

    // @ts-ignore
    d('test');
  });

  it('should...', () => {

    expect(d).toBeTruthy();
  });



});
