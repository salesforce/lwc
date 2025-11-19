/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, getOwnPropertyDescriptor, isNull } from '@lwc/shared';

import { pathComposer } from '../3rdparty/polymer/path-composer';
import { retarget } from '../3rdparty/polymer/retarget';
import { eventCurrentTargetGetter } from '../env/dom';
import { Node } from '../env/node';
import { isNodeShadowed } from '../shared/node-ownership';
import { getOwnerDocument } from '../shared/utils';

export function retargetRelatedTarget(Ctor: typeof FocusEvent | typeof MouseEvent) {
    const relatedTargetGetter = getOwnPropertyDescriptor(Ctor.prototype, 'relatedTarget')!
        .get as () => typeof Ctor.prototype.relatedTarget;

    defineProperty(Ctor.prototype, 'relatedTarget', {
        get(this: Event) {
            const relatedTarget = relatedTargetGetter.call(this);
            if (isNull(relatedTarget)) {
                return null;
            }
            if (!(relatedTarget instanceof Node) || !isNodeShadowed(relatedTarget)) {
                return relatedTarget;
            }
            let pointOfReference = eventCurrentTargetGetter.call(this);
            if (isNull(pointOfReference)) {
                pointOfReference = getOwnerDocument(relatedTarget);
            }
            return retarget(pointOfReference, pathComposer(relatedTarget, true));
        },
        enumerable: true,
        configurable: true,
    });
}
