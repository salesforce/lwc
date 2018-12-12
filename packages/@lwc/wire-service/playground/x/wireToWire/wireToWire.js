/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, api, wire } from 'lwc';
import { getTodo } from 'x/todoApi';

export default class WireToWire extends LightningElement {
    @api
    todoId;

    @wire(getTodo, { id: '$todoId' })
    todo;

    @wire(getTodo, { id: '$todo.data.nextId' })
    todoDependent;
}
