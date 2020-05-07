/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export default function detect(): boolean {
    // Don't apply polyfill when ProxyCompat is enabled.
    if ('getKey' in Proxy) {
        return false;
    }

    const proxy = new Proxy([3, 4], {});
    const res = [1, 2].concat(proxy);

    return res.length !== 4;
}
