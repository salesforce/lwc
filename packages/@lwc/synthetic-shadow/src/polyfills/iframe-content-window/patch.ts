/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor, defineProperty, isNull, isUndefined } from '@lwc/shared';
import { getNodeOwnerKey } from '../../shared/node-ownership';

export default function apply() {
    // the iframe property descriptor for `contentWindow` should always be available, otherwise this method should never be called
    const desc = getOwnPropertyDescriptor(
        HTMLIFrameElement.prototype,
        'contentWindow'
    ) as PropertyDescriptor;
    const { get: originalGetter } = desc;
    desc.get = function(this: HTMLIFrameElement): WindowProxy | null {
        const original = (originalGetter as any).call(this);
        // If the original iframe element is not a keyed node, then do not wrap it
        if (isNull(original) || isUndefined(getNodeOwnerKey(this))) {
            return original;
        }
        // only if the element is an iframe inside a shadowRoot, we care about this problem
        // because in that case, the code that is accessing the iframe, is very likely code
        // compiled with proxy-compat transformation. It is true that other code without those
        // transformations might also access an iframe from within a shadowRoot, but in that,
        // case, which is more rare, we still return the wrapper, and it should work the same,
        // this part is just an optimization.
        return wrapIframeWindow(original);
    };
    defineProperty(HTMLIFrameElement.prototype, 'contentWindow', desc);
}

function wrapIframeWindow(win: WindowProxy): WindowProxy {
    return {
        addEventListener() {
            // Typescript does not like it when you treat the `arguments` object as an array
            // @ts-ignore type-mismatch
            return win.addEventListener.apply(win, arguments);
        },
        blur() {
            // Typescript does not like it when you treat the `arguments` object as an array
            // @ts-ignore type-mismatch
            return win.blur.apply(win, arguments);
        },
        close() {
            // Typescript does not like it when you treat the `arguments` object as an array
            // @ts-ignore type-mismatch
            return win.close.apply(win, arguments);
        },
        focus() {
            // Typescript does not like it when you treat the `arguments` object as an array
            // @ts-ignore type-mismatch
            return win.focus.apply(win, arguments);
        },
        postMessage() {
            // Typescript does not like it when you treat the `arguments` object as an array
            // @ts-ignore type-mismatch
            return win.postMessage.apply(win, arguments);
        },
        removeEventListener() {
            // Typescript does not like it when you treat the `arguments` object as an array
            // @ts-ignore type-mismatch
            return win.removeEventListener.apply(win, arguments);
        },
        get closed() {
            return win.closed;
        },
        get frames() {
            return win.frames;
        },
        get length() {
            return win.length;
        },
        get location() {
            return win.location;
        },
        set location(value) {
            (win.location as any) = value;
        },
        get opener() {
            return win.opener;
        },
        get parent() {
            return win.parent;
        },
        get self() {
            return win.self;
        },
        get top() {
            return win.top;
        },
        get window() {
            return win.window;
        },
    } as any; // this is limited
}
