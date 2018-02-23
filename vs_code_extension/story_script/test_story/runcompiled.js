// runcompiled.js
// Takes an uncompiled .js file as argument and executes its pendant in .compiled folder.
// Assumes that source files in cwd are mirrored in folder .compiled.

var path = require('path');
var uncompiledFile = process.argv[2];
var compiledDir = path.resolve(process.cwd(), '.compiled');

if (!uncompiledFile) {
  process.stderr.write('filename missing');
  process.exit(1);
}

uncompiledFile = path.resolve(uncompiledFile);

if (uncompiledFile.indexOf(compiledDir) === 0) {
  process.stderr.write("file in " + compiledDir + " not allowed");
  process.exit(1);
}

var relativePath = path.relative(process.cwd(), uncompiledFile);
var dir = path.dirname(relativePath);

if (!dir || dir === '' || dir === '.') {
  process.stderr.write("files in root directory are not allowed. file " + relativePath);
  process.exit(1);
}

var compiledFile = path.join(compiledDir, relativePath);

require(compiledFile);