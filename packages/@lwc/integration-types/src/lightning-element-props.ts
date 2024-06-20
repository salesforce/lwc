/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement } from 'lwc';

export class MyComponent extends LightningElement {
    renderedCallback() {
        this.dispatchEvent(
            new CustomEvent('foo', {
                bubbles: true,
                composed: true,
                detail: {
                    foo: 'foo',
                },
            })
        );
        this.addEventListener('foo', (event) => {
            event.preventDefault();
        });
    }
}
