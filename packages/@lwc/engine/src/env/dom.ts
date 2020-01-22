/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor } from '@lwc/shared';

const ShadowRootInnerHTMLSetter: (this: ShadowRoot, s: string) => void = getOwnPropertyDescriptor(
    ShadowRoot.prototype,
    'innerHTML'
)!.set!;

const dispatchEvent =
    'EventTarget' in window ? EventTarget.prototype.dispatchEvent : Node.prototype.dispatchEvent; // IE11

export { dispatchEvent, ShadowRootInnerHTMLSetter };
