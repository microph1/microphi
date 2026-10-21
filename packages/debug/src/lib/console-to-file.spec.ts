describe('console-to-file', () => {

  const originalConsoleLog = console.log;

  afterEach(() => {
    console.log = originalConsoleLog;
    vi.restoreAllMocks();
    vi.resetModules();
    delete process.env['CONSOLE_LOG_FILE'];
  });

  it('overrides console.log to append formatted output to the configured file in nodejs', async () => {
    const fs = (await import('node:fs')).default;
    const appendSpy = vi.spyOn(fs, 'appendFileSync').mockImplementation(() => undefined);
    process.env['CONSOLE_LOG_FILE'] = '/tmp/microphi-console-to-file.test.log';

    // importing runs the module-level side effect that patches console.log
    await import('./console-to-file');

    console.log('hello', { a: 1 });

    expect(appendSpy).toHaveBeenCalledTimes(1);
    const [path, message] = appendSpy.mock.calls[0] as [string, string];
    expect(path).toBe('/tmp/microphi-console-to-file.test.log');
    expect(message).toContain('hello');
    // non-string args are serialized via util.inspect
    expect(message).toContain('a: 1');
    expect(message.endsWith('\n')).toBe(true);
  });

  it('falls back to the original console.log when the file write throws', async () => {
    const fs = (await import('node:fs')).default;
    vi.spyOn(fs, 'appendFileSync').mockImplementation(() => {
      throw new Error('disk full');
    });

    // capture the pre-patch console.log so we can assert the fallback path;
    // no CONSOLE_LOG_FILE set here, exercising the default-path branch too
    const fallback = vi.fn();
    console.log = fallback;

    await import('./console-to-file');

    console.log('boom');

    expect(fallback).toHaveBeenCalledWith(
      'Error writing to console log file, falling back to console:',
      expect.any(Error),
    );
    expect(fallback).toHaveBeenCalledWith('boom');
  });

});
