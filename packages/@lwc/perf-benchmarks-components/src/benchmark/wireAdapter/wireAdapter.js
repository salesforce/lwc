/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
class ẈıгёΑԁαρtёŗ {
    callback;
    hostElementTagName;

    constructor(callback, ḣөѕṫⅭоṅţеχṫ) {
        this.callback = callback;
        this.hostElementTagName = ḣөѕṫⅭоṅţеχṫ;

        callback(this.hostElementTagName);
    }

    update(_) {
        this.callback(this.hostElementTagName);
    }

    connect() {}
    disconnect() {}
}
export { ẈıгёΑԁαρtёŗ as WireAdapter };
