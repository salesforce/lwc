/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const COMPAT_SUFFIX = "_compat";
const DEBUG_SUFFIX = "_debug";
const PROD_SUFFIX = ".min";

function generateTargetName({ prod, proddebug }){
    return [
        'engine',
        proddebug ? DEBUG_SUFFIX : '',
        prod ? '.min' : '',
        '.js'
    ].join('');
}

function ignoreCircularDependencies({ code, message }) {
    if (code !== 'CIRCULAR_DEPENDENCY') {
        throw new Error(message);
    }
}

module.exports = {
    COMPAT_SUFFIX,
    DEBUG_SUFFIX,
    PROD_SUFFIX,
    generateTargetName,
    ignoreCircularDependencies
};

