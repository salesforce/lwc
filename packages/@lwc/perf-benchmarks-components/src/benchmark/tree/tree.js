/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api data = { id: 'foo' };
    @api depth = 0;
    @api breadth = 0;
    @api index = 0;

    get depthMinusOne() {
        return this.depth - 1;
    }

    get notLeaf() {
        return this.depth > 0;
    }

    get children() {
        return Array.from({ length: this.breadth }, (_, i) => i);
    }
}
