import { isNodejs } from './is_nodejs';

if (isNodejs()) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const util = require('util');

  const originalLog = console.log;
  const filePath = process.env['CONSOLE_LOG_FILE'] || './console.log';

  console.log = (...args: unknown[]) => {
    try {
      const message = args.map(arg => (typeof arg === 'string' ? arg : util.inspect(arg, { depth: 2 }))).join(' ') + '\n';
      fs.appendFileSync(filePath, message);
    } catch (error) {
      // Fallback to original console.log on error
      originalLog('Error writing to console log file, falling back to console:', error);
      originalLog(...args);
    }
  };
} else {
  console.warn('@microphi/debug/console-to-file: File logging not supported in browser environment');
}