/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArraySlice } from '../shared/language';

export function wrapIframeWindow(win: Window) {
    return {
        postMessage() {
            return win.postMessage.apply(win, ArraySlice.call(arguments));
        },
        blur() {
            return win.blur.apply(win, ArraySlice.call(arguments));
        },
        close() {
            return win.close.apply(win, ArraySlice.call(arguments));
        },
        focus() {
            return win.focus.apply(win, ArraySlice.call(arguments));
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
