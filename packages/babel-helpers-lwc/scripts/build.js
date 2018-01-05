const GLOBAL_VAR = 'EngineHelpers';
const GLOBAL_MEMBER = 'babelHelpers';

const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const builder = require('../src/index');
const UglifyJS = require('uglify-es');

const result = builder.build(GLOBAL_MEMBER, GLOBAL_VAR);
const resultMin = UglifyJS.minify(result).code;

function relative(relPath) {
    return path.join(__dirname, relPath);
}

// Create dist folder (if it does not exist)
mkdirp.sync(relative('../dist'));

// Unminified version
fs.writeFileSync(relative('../dist/engine-helpers.js'), result);
// Minified version
fs.writeFileSync(relative('../dist/engine-helpers.min.js'), resultMin);
