/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// Remove padding from a string.
// From https://github.com/babel/babili/blob/56e87e6e38f02c171ea6bb75d4224c0ea06c6b23/utils/unpad.js
function unpad(str) {
    const lines = str.split('\n');
    const m = lines[1] && lines[1].match(/^\s+/);
    const spaces = m[0].length;
    return lines
        .map(line => line.slice(spaces))
        .join('\n')
        .trim();
}

module.exports = unpad;
