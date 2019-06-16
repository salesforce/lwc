/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Event fired by wire adapters to link to a context provider
 */
export class LinkContextEvent {
    type: string;
    uid: string;
    callback: (...args: any[]) => void;
    constructor(uid, callback) {
        this.type = 'LinkContextEvent';
        this.uid = uid;
        this.callback = callback;
    }
}
