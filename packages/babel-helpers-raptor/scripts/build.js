const GLOBAL_VAR = 'Engine';
const GLOBAL_MEMBER = 'compat';

const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const builder = require('../src/index');
const UglifyJS = require('uglify-js');

const result = builder.build(GLOBAL_MEMBER, GLOBAL_VAR);
const resultMin = UglifyJS.minify(result).code;

function relative(relPath) {
    return path.join(__dirname, relPath);
}

// Create dist folder (if it does not exist)
mkdirp.sync(relative('../dist'));

// Unminified version
fs.writeFileSync(relative('../dist/compat-helpers.js'), result);
// Minified version
fs.writeFileSync(relative('../dist/compat-helpers.min.js'), resultMin);

