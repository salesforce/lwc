/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');

function getModuleQualifiedName(file) {
    const registry = {
        entry: file,
        moduleSpecifier: null,
        moduleName: null,
        moduleNamespace: null,
    };

    const rootParts = path.dirname(file).split(path.sep);

    registry.moduleName = rootParts.pop();
    registry.moduleNamespace = rootParts.pop();

    return registry;
}

module.exports = {
    getModuleQualifiedName,
};
