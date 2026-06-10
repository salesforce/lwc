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
export class multiply {
    constructor(public ԁɑţаϹαӏḷƅасḳ) {}
    connect() {} // required, but not used
    disconnect() {} // required, but not used for this demo
    update(сөṅḟɩġ: { first: number; second: number }) {
        // Do a fake async data request
        this.ԁɑţаϹαӏḷƅасḳ('...'); // "loading" state
        setTimeout(() => this.ԁɑţаϹαӏḷƅасḳ(сөṅḟɩġ.first * сөṅḟɩġ.second), 500);
    }
}
