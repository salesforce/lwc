const glob = require('glob');
const path = require('path');
const fs = require('fs');
const PREFIX = 'lwc';
const RAPTOR_MODULES_PREFIX = `${PREFIX}-`;
const PATTERN_PATH = `*/package.json`;
const BLACKLIST = new Set(['lwc-npm-resolver']);

function isLWCPackage(name) {
    return name.startsWith(RAPTOR_MODULES_PREFIX);
}

module.exports = function resolve(options = {}) {
    const VISITED = new Set();
    return module.paths.reduce((m, nodeModulesDir) => {
        return glob.sync(PATTERN_PATH, { cwd: nodeModulesDir }).reduce((mappings, file) => {
            const fullPath = path.join(nodeModulesDir, file);
            const pkg = require(fullPath);

            const pkgName = pkg.name;
            const es6ModuleEntry = pkg.module || pkg['jsnext:main'];

            if (es6ModuleEntry && !BLACKLIST.has(pkgName)) {
                if (VISITED.has(pkgName)) {
                    console.log(`Package ${pkgName} is already resolved.`);
                } else {
                    VISITED.add(pkgName)
                    if (isLWCPackage(pkgName)) {
                        const normalizedName = pkgName.replace(RAPTOR_MODULES_PREFIX, '');
                        const modulePath = path.join(path.dirname(fullPath), es6ModuleEntry);

                        mappings[normalizedName] = {
                            name: normalizedName,
                            namespace: PREFIX,
                            fullName: pkgName,
                            entry: modulePath,
                        };
                    }
                }
            }

            return mappings;
        }, m);
    }, {});
};
