/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export function wrapIframeWindow(win: Window) {
    return {
        postMessage() {
            // Typescript does not like it when you treat the `arguments` object as an array
            // @ts-ignore type-mismatch
            return win.postMessage.apply(win, arguments);
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
    };
}
