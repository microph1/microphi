describe('console-to-file', () => {

  const originalConsoleLog = console.log;

  afterEach(() => {
    console.log = originalConsoleLog;
    jest.restoreAllMocks();
    jest.resetModules();
    delete process.env['CONSOLE_LOG_FILE'];
  });

  it('overrides console.log to append formatted output to the configured file in nodejs', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const appendSpy = jest.spyOn(fs, 'appendFileSync').mockImplementation(() => undefined);
    process.env['CONSOLE_LOG_FILE'] = '/tmp/microphi-console-to-file.test.log';

    jest.isolateModules(() => {
      // importing runs the module-level side effect that patches console.log
      require('./console-to-file');
    });

    console.log('hello', { a: 1 });

    expect(appendSpy).toHaveBeenCalledTimes(1);
    const [path, message] = appendSpy.mock.calls[0] as [string, string];
    expect(path).toBe('/tmp/microphi-console-to-file.test.log');
    expect(message).toContain('hello');
    // non-string args are serialized via util.inspect
    expect(message).toContain('a: 1');
    expect(message.endsWith('\n')).toBe(true);
  });

  it('falls back to the original console.log when the file write throws', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    jest.spyOn(fs, 'appendFileSync').mockImplementation(() => {
      throw new Error('disk full');
    });

    // capture the pre-patch console.log so we can assert the fallback path;
    // no CONSOLE_LOG_FILE set here, exercising the default-path branch too
    const fallback = jest.fn();
    console.log = fallback;

    jest.isolateModules(() => {
      require('./console-to-file');
    });

    console.log('boom');

    expect(fallback).toHaveBeenCalledWith(
      'Error writing to console log file, falling back to console:',
      expect.any(Error),
    );
    expect(fallback).toHaveBeenCalledWith('boom');
  });

});
