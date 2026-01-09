// Environment detection
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

// Timestamp configuration
const enableTimestamp = isNode ? process.env.LOG_TIMESTAMP === 'true' : true;

// Color palettes
const nodeColors = [
  '\x1b[34m', // blue
  '\x1b[36m', // cyan
  '\x1b[92m', // bright green
  '\x1b[93m', // bright yellow
  '\x1b[95m', // bright magenta
  '\x1b[94m', // bright blue
  '\x1b[96m', // bright cyan
  '\x1b[32m', // green
  '\x1b[33m', // yellow
  '\x1b[35m', // magenta
  '\x1b[91m', // bright red
  '\x1b[31m'  // red
];
const browserColors = [
  'color: #0000ff', // blue
  'color: #00ffff', // cyan
  'color: #00ff00', // green
  'color: #ffff00', // yellow
  'color: #ff00ff', // magenta
  'color: #4169e1', // royal blue
  'color: #00ced1', // dark turquoise
  'color: #32cd32', // lime green
  'color: #ffd700', // gold
  'color: #da70d6', // orchid
  'color: #dc143c', // crimson
  'color: #ff0000'  // red
];
const resetColor = '\x1b[0m';

// Function to get color for filename
function getColorForFilename(filename) {
  const hash = filename.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const index = hash % 12;
  return isNode ? nodeColors[index] : browserColors[index];
}

// Function to get filename without extension from a file path/URL
function getFilenameWithoutExt(file) {
  const base = file.split(/[/\\]/).pop() || file;
  const parts = base.split('.');
  return parts.length > 1 ? parts.slice(0, -1).join('.') : base;
}

// Function to get the filename of the caller (without extension)
function getCallerFile() {
  const originalFunc = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const err = new Error();
  const stack = err.stack;
  Error.prepareStackTrace = originalFunc;

  // stack[0] is getCallerFile
  // stack[1] is the console.debug override
  // stack[2] is the caller
  if (stack && stack[2]) {
    const fileName = stack[2].getFileName();
    return fileName ? getFilenameWithoutExt(fileName) : 'unknown';
  }
  return 'unknown';
}

// Save original console.debug
const originalDebug = console.debug;

// Apply decorator
console.debug = function(...args) {
  const timestamp = enableTimestamp ? new Date().toISOString() : null;
  const filename = getCallerFile();
  const color = getColorForFilename(filename);

  if (isNode) {
    // Node.js: ANSI colors
    let prefix = '';
    if (timestamp) {
      prefix += `[${timestamp}] `;
    }
    prefix += `${color}[${filename}]${resetColor} `;
    originalDebug.apply(this, [prefix, ...args]);
  } else {
    // Browser: CSS colors with %c
    if (timestamp) {
      originalDebug.apply(this, [`%c[${timestamp}] %c[${filename}] %c`, '', color, '', ...args]);
    } else {
      originalDebug.apply(this, [`%c[${filename}] %c`, color, '', ...args]);
    }
  }
};
