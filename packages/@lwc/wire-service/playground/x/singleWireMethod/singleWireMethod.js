/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, api, wire, track } from 'lwc';
import { getTodo } from 'x/todoApi';

export default class SingleWireMethod extends LightningElement {
    @api todoId;

    @track error = undefined;
    @track todo = undefined;

    @wire(getTodo, { id: '$todoId' })
    function({ error, data }) {
        this.error = error;
        this.todo = data;
    }
}
