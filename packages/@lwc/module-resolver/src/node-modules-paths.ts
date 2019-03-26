/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * Adapted from Jest, which is adapted from:
 * https://github.com/browserify/resolve
 */

import path from 'path';

export default function nodeModulesPaths(basedir: string, moduleDirectory: string[] | undefined) {
    const modules: string[] = moduleDirectory ? [...moduleDirectory] : ['node_modules'];

    // ensure that `basedir` is an absolute path at this point,
    // resolving against the process' current working directory
    const basedirAbs = path.resolve(basedir);

    let prefix = '/';
    if (/^([A-Za-z]:)/.test(basedirAbs)) {
        prefix = '';
    } else if (/^\\\\/.test(basedirAbs)) {
        prefix = '\\\\';
    }

    const paths = [basedirAbs];
    let parsed = path.parse(basedirAbs);
    while (parsed.dir !== paths[paths.length - 1]) {
        paths.push(parsed.dir);
        parsed = path.parse(parsed.dir);
    }

    const dirs = paths.reduce((dirs: string[], aPath) => {
        return dirs.concat(
            modules.map(moduleDir => {
                return path.join(prefix, aPath, moduleDir);
            })
        );
    }, []);

    return dirs;
}
