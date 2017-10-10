const glob = require('glob');
const path = require('path');
const fs = require('fs');
const RAPTOR_MODULES_PREFIX = 'raptor-';
const PATTERN_PATH = `node_modules/${RAPTOR_MODULES_PREFIX}*/package.json`;
const BLACKLIST = new Set(['raptor-npm-resolver']);

module.exports = function resolve(options = {}) {
    return glob.sync(PATTERN_PATH).reduce((mapping, file) => {
        const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
        const es6ModuleEntry = pkg.module || pkg['jsnext:main'];

        if (es6ModuleEntry) {
            const modulePath = path.join(path.dirname(file), es6ModuleEntry);
            const moduleName = pkg.name.replace(RAPTOR_MODULES_PREFIX, '');

            if (!BLACKLIST.has(moduleName)) {
                mapping[moduleName] = modulePath;
            }
        }

        return mapping;
    }, {});
}