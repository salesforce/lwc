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
import { isNodeShadowed } from '../../shared/node-ownership';
import { getOwnerDocument } from '../../shared/utils';

const mouseEventRelatedTargetGetter = getOwnPropertyDescriptor(
    FocusEvent.prototype,
    'relatedTarget'
)!.get as () => EventTarget | null;

defineProperty(MouseEvent.prototype, 'relatedTarget', {
    get(this: Event): EventTarget | null | undefined {
        const relatedTarget = mouseEventRelatedTargetGetter.call(this);
        if (isNull(relatedTarget)) {
            return null;
        }
        if (!(relatedTarget instanceof Node) || !isNodeShadowed(relatedTarget as Node)) {
            return relatedTarget;
        }
        let pointOfReference = eventCurrentTargetGetter.call(this);
        if (isNull(pointOfReference)) {
            pointOfReference = getOwnerDocument(relatedTarget as Node);
        }
        return retarget(pointOfReference, pathComposer(relatedTarget, true));
    },
    enumerable: true,
    configurable: true,
});
