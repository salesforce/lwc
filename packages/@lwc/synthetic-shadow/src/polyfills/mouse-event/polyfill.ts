/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, isNull, getOwnPropertyDescriptor } from '@lwc/shared';
import { pathComposer } from '../../3rdparty/polymer/path-composer';
import { retarget } from '../../3rdparty/polymer/retarget';
import { eventCurrentTargetGetter } from '../../env/dom';

const mouseEventRelatedTargetGetter = getOwnPropertyDescriptor(
    FocusEvent.prototype,
    'relatedTarget'
)!.get as () => EventTarget | null;

defineProperty(MouseEvent.prototype, 'relatedTarget', {
    get(this: Event): EventTarget | null | undefined {
        const currentTarget = eventCurrentTargetGetter.call(this);
        if (isNull(currentTarget)) {
            // TODO: if currentTarget is null it is because relatedTarget is accessed
            // in another turn, what should we do here? null seems safe, but probably
            // not correct.
            return null;
        }
        const relatedTarget = mouseEventRelatedTargetGetter.call(this);
        if (isNull(relatedTarget)) {
            return null;
        }
        return retarget(currentTarget, pathComposer(relatedTarget, true));
    },
    enumerable: true,
    configurable: true,
});
