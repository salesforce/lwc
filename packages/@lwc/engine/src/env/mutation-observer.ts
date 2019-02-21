/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

let MO = (window as any).MutationObserver;

// MutationObserver is not yet implemented in jsdom:
// https://github.com/jsdom/jsdom/issues/639
if (typeof MO === 'undefined') {
    /* eslint-disable-next-line no-inner-declarations */
    function MutationObserverMock() {}

    MutationObserverMock.prototype = {
        observe() {
            if (process.env.NODE_ENV !== 'production') {
                if (process.env.NODE_ENV !== 'test') {
                    throw new Error(`MutationObserver should not be mocked outside of the jest test environment`);
                }
            }
        }
    };
    MO = (window as any).MutationObserver = MutationObserverMock;
}

const MutationObserver = MO;

// Eventually, import the patched MutationObserver polyfill here
// to ensure rest of the framework uses the patched version

let MutationObserverObserve = MutationObserver.prototype.observe;
export {
    MutationObserver,
    MutationObserverObserve
};
