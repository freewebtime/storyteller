let fs = require('fs');
let path = require('path');
let fsUtils = require('../storyscript/out/fileSystem/fsUtils').fsUtils;

if (process.argv.length < 4) {
  return;
}

let programPath = process.argv[1];
let fromPath = process.argv[2];
let toPath = process.argv[3];

let rootPath = path.dirname(programPath);
let fromPathAbs = rootPath + '/' + fromPath;
let toPathAbs = rootPath + '/' + toPath;

fromPathAbs = path.normalize(fromPathAbs);
toPathAbs = path.normalize(toPathAbs);

console.log('copying directory ' + fromPathAbs + ' to ' + toPathAbs);
fsUtils.copyDirectory(fromPathAbs, toPathAbs);
