/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const composedDescriptor = Object.getOwnPropertyDescriptor(Event.prototype, 'composed');

export default function detect(): boolean {
    if (!composedDescriptor) {
        // No need to apply this polyfill if this client completely lacks
        // support for the composed property.
        return false;
    }

    // Assigning a throwaway click event here to suppress a ts error when we
    // pass clickEvent into the composed getter below. The error is:
    // [ts] Variable 'clickEvent' is used before being assigned.
    let clickEvent: Event = new Event('click');

    const button = document.createElement('button');
    button.addEventListener('click', event => (clickEvent = event));
    button.click();

    return !composedDescriptor.get!.call(clickEvent);
}
