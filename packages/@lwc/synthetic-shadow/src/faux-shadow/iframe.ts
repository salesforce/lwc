import { PatchedElement } from './element';
import { iFrameContentWindowGetter } from '../env/dom';

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export interface HTMLIFrameElementConstructor {
    prototype: HTMLIFrameElement;
    new (): HTMLIFrameElement;
}

/**
 * This is needed for compat mode to function because we don't use a real WeakMap,
 * instead compat will attempt to extract the proxy internal slot out of a cross
 * domain iframe, just to see if it is a proxy or not, and that will throw. To prevent
 * that from throwing, we just protect it by wrapping all iframes.
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

export function PatchedIframeElement(elm: HTMLIFrameElement): HTMLIFrameElementConstructor {
    const Ctor = PatchedElement(elm) as HTMLIFrameElementConstructor;
    return class PatchedHTMLIframeElement extends Ctor {
        get contentWindow(this: HTMLIFrameElement) {
            const original = iFrameContentWindowGetter.call(this);
            if (original) {
                const wrapped = wrapIframeWindow(original) as unknown;
                return wrapped as Window;
            }
            return original;
        }
    };
}
