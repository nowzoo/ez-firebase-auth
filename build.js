const fs = require('fs-extra');
const _ = require('lodash');
fs.readJson('./package.json', (err, result) => {
  const dist = _.omit(result, 'devDependencies', 'dependencies', 'scripts', 'engines', 'filename');
  const s = {
    "main": "bundles/ez-firebase-auth.umd.js",
  	"module": "@nowzoo/ez-firebase-auth.es5.js",
  	"es2015": "@nowzoo/ez-firebase-auth.js",
  	"typings": "ez-firebase-auth.d.ts",
  	"metadata": "ez-firebase-auth.metadata.json"
  }
  const pkg = _.assign({}, dist, s);
  fs.outputJson('./dist/package.json', pkg, {spaces: '\t'})
});

fs.copy('./LICENSE', './dist/LICENSE');
fs.copy('./README.md', './dist/README.md');
