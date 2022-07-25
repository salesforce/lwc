/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, track, api } from 'lwc';

export default class TrackedComponentRow extends LightningElement {
    @track trackedRow = {}; // the whole point is to test @track
    _row;

    @api
    set row(row) {
        Object.assign(this.trackedRow, row);
        this._row = row;
    }

    get row() {
        return this._row;
    }
}
