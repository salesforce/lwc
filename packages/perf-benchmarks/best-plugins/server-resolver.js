/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = function () {
    return {
        name: 'server-resolver',
        resolveId(src) {
            if (src === 'lwc') {
                return require.resolve('@lwc/engine-server/dist/engine-server.js');
            }

            return null;
        },
    };
};
