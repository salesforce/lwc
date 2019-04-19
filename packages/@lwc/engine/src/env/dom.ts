/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor } from '../shared/language';

const ShadowRootHostGetter: (this: ShadowRoot) => Element | null =
    typeof (window as any).ShadowRoot !== 'undefined'
        ? getOwnPropertyDescriptor((window as any).ShadowRoot.prototype, 'host')!.get!
        : () => {
              throw new Error('Internal Error: Missing ShadowRoot');
          };

const ShadowRootInnerHTMLSetter: (this: ShadowRoot, s: string) => void =
    typeof (window as any).ShadowRoot !== 'undefined'
        ? getOwnPropertyDescriptor((window as any).ShadowRoot.prototype, 'innerHTML')!.set!
        : () => {
              throw new Error('Internal Error: Missing ShadowRoot');
          };

const dispatchEvent =
    'EventTarget' in window ? EventTarget.prototype.dispatchEvent : Node.prototype.dispatchEvent; // IE11

const isNativeShadowRootAvailable = typeof (window as any).ShadowRoot !== 'undefined';

export {
    dispatchEvent,
    ShadowRootHostGetter,
    ShadowRootInnerHTMLSetter,
    isNativeShadowRootAvailable,
};
