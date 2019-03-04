/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, track } from 'lwc';

export default class Demo extends LightningElement {
    @track state = {
        todoId: '',
    };

    handleChange(evt) {
        const id = evt.target.value.trim();
        this.state.todoId = id;
    }
}
