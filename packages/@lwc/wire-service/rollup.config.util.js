/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/* eslint-env node */

function generateTargetName({ prod, proddebug }) {
    return ['wire', proddebug ? '_debug' : '', prod ? '.min' : '', '.js'].join('');
}

module.exports = {
    generateTargetName: generateTargetName,
};
