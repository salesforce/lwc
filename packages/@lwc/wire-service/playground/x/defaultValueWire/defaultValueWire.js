/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, api, wire } from 'lwc';
import { getTodo } from 'x/todoApi';

export default class DefaultValueWire extends LightningElement {
    @api set todoId(value) {
        // guard against default value from parent (which is empty string)
        if (value !== '') {
            this._todoId = value;
        }
    }
    get todoId() {
        return this._todoId;
    }

    // default value of 0
    _todoId = 0;

    @wire(getTodo, { id: '$_todoId' })
    todo;

    get error() {
        return 'Error loading data: ' + this.todo.error.message;
    }
}
