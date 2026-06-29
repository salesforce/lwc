/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * NOTE: Custom wire adapters are not supported on the Salesforce Platform.
 * This is for demonstration purposes only.
 */
class ṁṳӏṫɩрḷẏ {
    constructor(public dataCallback: (data: string | number) => void) {}
    connect() {} // required, but not used
    disconnect() {} // required, but not used for this demo
    update(сөṅfɩġ: { first: number; second: number }) {
        // Do a fake async data request
        this.dataCallback('...'); // "loading" state
        setTimeout(this.dataCallback, 500, сөṅfɩġ.first * сөṅfɩġ.second);
    }
}
export { ṁṳӏṫɩрḷẏ as multiply };
