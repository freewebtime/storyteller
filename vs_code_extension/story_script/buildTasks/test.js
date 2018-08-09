let fs = require('fs');
let path = require('path');

if (process.argv.length < 4) {
  return;
}

const copyFiles = (fromPath, toPath) => {
  if (!fs.existsSync(fromPath)) {
    console.log('directory ' + toPath + ' does not exists');
    return;
  }

  if (!fs.statSync(fromPath).isDirectory()) {
    console.log(fromPath, 'is not a directory');
    return;
  }

  if (!fs.existsSync(toPath)) {
    console.log('directory ' + toPath + ' does not exists. creating it');
    mkDirByPathSync(toPath);
    // fs.mkdirSync(toPath);
  }

  let itemNames = fs.readdirSync(fromPath);
  if (!itemNames || itemNames.length <= 0) {
    console.log(fromPath + 'does not have subitems');
    return;
  }

  console.log('found ' + itemNames.length + ' subitems', itemNames);

  itemNames.forEach((subitem) => {
    let subitemPath = fromPath + '/' + subitem;
    let targetSubitemPath = toPath + '/' + subitem;
    console.log('reading subitem ' + subitemPath + ' (copy to ' + targetSubitemPath + ')');

    if (fs.statSync(subitemPath).isDirectory()) {
      console.log(subitemPath + ' is directory');
      copyFiles(subitemPath, targetSubitemPath);
      return;
    }

    console.log(subitemPath + ' is file. copying it to ' + targetSubitemPath);
    fs.writeFileSync(targetSubitemPath, fs.readFileSync(subitemPath));
  });
} 

function mkDirByPathSync(targetDir, {
  isRelativeToScript = false
} = {}) {
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  const baseDir = isRelativeToScript ? __dirname : '.';

  return targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir);
    try {
      fs.mkdirSync(curDir);
    } catch (err) {
      if (err.code === 'EEXIST') { // curDir already exists!
        return curDir;
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
      }

      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
      if (!caughtErr || caughtErr && targetDir === curDir) {
        throw err; // Throw if it's just the last created dir.
      }
    }

    return curDir;
  }, initDir);
}

let programPath = process.argv[1];
let fromPath = process.argv[2];
let toPath = process.argv[3];

let rootPath = path.dirname(programPath);
let fromPathAbs = rootPath + '/' + fromPath;
let toPathAbs = rootPath + '/' + toPath;

fromPathAbs = path.normalize(fromPathAbs);
toPathAbs = path.normalize(toPathAbs);

console.log('execution params are ', {programPath, fromPath, toPath, rootPath, fromPathAbs, toPathAbs});

console.log('copying directory ' + fromPathAbs + ' to ' + toPathAbs);
copyFiles(fromPathAbs, toPathAbs);
