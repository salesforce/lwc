/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export class NodeRefProxy {
    instance: any;
    target: any;

    constructor(target: unknown) {
        this.target = target;
        this.instance = new Proxy(
            {},
            {
                has: (dummy: any, property: PropertyKey) => {
                    return property in this.target;
                },

                get: (dummy: any, property: PropertyKey) => {
                    return this.target[property];
                },

                set: (dummy: any, property: PropertyKey, value: any) => {
                    this.target[property] = value;
                    return true;
                },
            }
        );
    }

    swap(newTarget: any) {
        this.target = newTarget;
    }
}
