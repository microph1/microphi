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
  const timestamp = new Date().toISOString();
  const filename = getCallerFile();
  originalDebug.apply(this, [`[${timestamp}] [${filename}]`].concat(args));
};
