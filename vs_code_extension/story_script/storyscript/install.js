const fsUtils = require('./out/fileSystem/fsUtils').fsUtils;

const install = (targetPath) => {
  fsUtils.mkDirByPathSync(targetPath);
  fsUtils.copyDirectory(__dirname, targetPath);
}

module.exports = install;