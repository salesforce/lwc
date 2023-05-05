/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export class WireAdapter {
    callback;
    hostElementTagName;

    constructor(callback, hostContext) {
        this.callback = callback;
        this.hostElementTagName = hostContext;

        callback(this.hostElementTagName);
    }

    update(_) {
        this.callback(this.hostElementTagName);
    }

    connect() {}
    disconnect() {}
}
