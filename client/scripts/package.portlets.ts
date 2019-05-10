
const fs = require('fs-extra');
const concat = require('concat');

(async function build() {

  const files = [
    './dist/hello-portlet/runtime.js',
    './dist/hello-portlet/es2015-polyfills.js',
    './dist/hello-portlet/main.js',
    './dist/hello-portlet/polyfills.js',
    // './dist/hello-portlet/styles.js'
    // './dist/hello-portlet/vendor.js'

  ];

console.log('creating elements');
  await concat(files, './dist/hello-portlet/bundle.js');
})();
