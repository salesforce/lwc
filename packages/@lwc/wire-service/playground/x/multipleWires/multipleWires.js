/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, api, wire } from 'lwc';
import { getTodo } from 'x/todoApi';

export default class MultipleWires extends LightningElement {
    idA;
    idB;

    @api
    get todoId() {
        return this.idA;
    }

    set todoId(value) {
        value = Number.parseInt(value, 10);
        if (!Number.isInteger(value)) {
            this.idA = this.idB = undefined;
            return;
        }
        this.idA = value;
        this.idB = value + 1;
    }

    @wire(getTodo, { id: '$idA' })
    todoA;

    @wire(getTodo, { id: '$idB' })
    todoB;

    get hasError() {
        return this.todoA.error || this.todoB.error;
    }

    get error() {
        return (
            '' +
            (this.todoA.error ? this.todoA.error.message : '') +
            ' / ' +
            (this.todoB.error ? this.todoB.error.message : '')
        );
    }
}
