// Environment detection
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

// Timestamp configuration
const enableTimestamp = isNode ? process.env.LOG_TIMESTAMP === 'true' : true;

// Color palettes (with bold)
const nodeColors = [
  '\x1b[1;34m', // bold blue
  '\x1b[1;36m', // bold cyan
  '\x1b[1;92m', // bold bright green
  '\x1b[1;93m', // bold bright yellow
  '\x1b[1;95m', // bold bright magenta
  '\x1b[1;94m', // bold bright blue
  '\x1b[1;96m', // bold bright cyan
  '\x1b[1;32m', // bold green
  '\x1b[1;33m', // bold yellow
  '\x1b[1;35m', // bold magenta
  '\x1b[1;91m', // bold bright red
  '\x1b[1;31m'  // bold red
];
const browserColors = [
  'color: #0000ff; font-weight: bold;', // bold blue
  'color: #00ffff; font-weight: bold;', // bold cyan
  'color: #00ff00; font-weight: bold;', // bold green
  'color: #ffff00; font-weight: bold;', // bold yellow
  'color: #ff00ff; font-weight: bold;', // bold magenta
  'color: #4169e1; font-weight: bold;', // bold royal blue
  'color: #00ced1; font-weight: bold;', // bold dark turquoise
  'color: #32cd32; font-weight: bold;', // bold lime green
  'color: #ffd700; font-weight: bold;', // bold gold
  'color: #da70d6; font-weight: bold;', // bold orchid
  'color: #dc143c; font-weight: bold;', // bold crimson
  'color: #ff0000; font-weight: bold;'  // bold red
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
