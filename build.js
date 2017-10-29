
const _ = require('lodash');
const keysFromBuilt = ["main", "module", "es2015", "typings", "metadata"];
const keysToOmitFromMain = ['devDependencies', 'dependencies', 'scripts', 'engines', 'filename']
const fs = require('fs-extra');
fs.readJson('./package.json', (err, result) => {
  let main = _.omit(result, keysToOmitFromMain);
  fs.readJson('./dist/package.json', (err, result) => {
    let dist = result;
    _.each(keysFromBuilt, key => {
      main[key] = dist[key];
    })
    fs.outputJson('./dist/package.json', main, {spaces: '\t'})
  });
});

fs.copy('./LICENSE', './dist/LICENSE');
fs.copy('./README.md', './dist/README.md');
