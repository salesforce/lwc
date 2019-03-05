/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const deasync = require('deasync');

function waitForPromise(promise) {
    let resolved = false;
    let err;
    let res;

    promise.then(result => (res = result), error => (err = error)).then(() => (resolved = true));

    deasync.loopWhile(() => !resolved);

    if (err) {
        throw err;
    }

    return res;
}

module.exports = {
    waitForPromise,
};
