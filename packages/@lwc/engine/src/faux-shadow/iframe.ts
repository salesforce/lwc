/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export function wrapIframeWindow(win: Window) {
    return {
        postMessage() {
            const args = arguments as unknown;
            return win.postMessage.apply(win, args as any[]);
        },
        blur() {
            const args = arguments as unknown;
            return win.blur.apply(win, args as any[]);
        },
        close() {
            const args = arguments as unknown;
            return win.close.apply(win, args as any[]);
        },
        focus() {
            const args = arguments as unknown;
            return win.focus.apply(win, args as any[]);
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
