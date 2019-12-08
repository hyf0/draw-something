const path = require('path');

const ROOT_PATH = path.resolve(__dirname, '../');

const paths = {
  rootPath: ROOT_PATH,
  srcPath: path.join(ROOT_PATH, 'src'),
  outputPath: path.join(ROOT_PATH, '../docs'),
};

module.exports = paths;
