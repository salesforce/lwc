/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const { createHash } = require('node:crypto');
const path = require('node:path');
const os = require('node:os');

function createChecksum(content) {
    const hashFunc = createHash('md5');
    hashFunc.update(content);
    return hashFunc.digest('hex');
}

function getTmpFile(cacheKeys) {
    const checksum = cacheKeys.map(createChecksum).join('-');
    return path.join(os.tmpdir(), 'lwc-karma-' + checksum);
}

exports.getTmpFile = getTmpFile();
