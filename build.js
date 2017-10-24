const fs = require('fs-extra');
const _ = require('lodash');
fs.readJson('./package.json', (err, result) => {
  const dist = _.omit(result, 'devDependencies', 'scripts', 'engines');
  const s = {
    "main": "bundles/simple-firebase-auth.umd.js",
  	"module": "@nowzoo/simple-firebase-auth.es5.js",
  	"es2015": "@nowzoo/simple-firebase-auth.js",
  	"typings": "simple-firebase-auth.d.ts",
  	"metadata": "simple-firebase-auth.metadata.json"
  }
  const pkg = _.assign({}, dist, s);
  fs.outputJson('./dist/package.json', pkg, {spaces: '\t'})
})
