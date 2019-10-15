/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperties, isNull, isUndefined } from '@lwc/shared';
import { pathComposer } from '../../3rdparty/polymer/path-composer';
import { retarget } from '../../3rdparty/polymer/retarget';
import { getNodeOwnerKey } from '../../shared/node-ownership';
import { getOwnerDocument } from '../../shared/utils';
import { eventTargetGetter, eventCurrentTargetGetter } from '../../env/dom';
import { getEventContext, EventListenerContext } from '../../shared/event-context';
import { getShadowRoot } from '../../faux-shadow/shadow-root';

function targetGetter(this: Event): EventTarget | null {
    // currentTarget is always defined
    const originalCurrentTarget = eventCurrentTargetGetter.call(this);
    const originalTarget = eventTargetGetter.call(this);
    const composedPath = pathComposer(originalTarget, this.composed);
    const doc = getOwnerDocument(originalTarget as Node);

    // Handle cases where the currentTarget is null (for async events),
    // and when an event has been added to Window
    if (!(originalCurrentTarget instanceof Node)) {
        // TODO: issue #1511 - Special escape hatch to support legacy behavior. Should be fixed.
        // If the event's target is being accessed async and originalTarget is not a keyed element, do not retarget
        if (isNull(originalCurrentTarget) && isUndefined(getNodeOwnerKey(originalTarget as Node))) {
            return originalTarget;
        }
        return retarget(doc, composedPath);
    } else if (originalCurrentTarget === doc || originalCurrentTarget === doc.body) {
        // TODO: issue #1530 - If currentTarget is document or document.body (Third party libraries that have global event listeners)
        // and the originalTarget is not a keyed element, do not retarget
        if (isUndefined(getNodeOwnerKey(originalTarget as Node))) {
            return originalTarget;
        }
        return retarget(doc, composedPath);
    }

    const eventContext = getEventContext(this);
    const currentTarget =
        eventContext === EventListenerContext.SHADOW_ROOT_LISTENER
            ? getShadowRoot(originalCurrentTarget as HTMLElement)
            : originalCurrentTarget;
    return retarget(currentTarget, composedPath);
}

function composedPathValue(this: Event): EventTarget[] {
    const originalTarget: EventTarget = eventTargetGetter.call(this);
    const originalCurrentTarget = eventCurrentTargetGetter.call(this);
    // if the dispatch phase is done, the composedPath should be empty array
    // TODO: in closed mode the path does not include shadowed objects from the currentTarget,
    // should the following line call pathComposed() with this.currentTarget instead?
    return isNull(originalCurrentTarget) ? [] : pathComposer(originalTarget as Node, this.composed);
}

defineProperties(Event.prototype, {
    target: {
        get: targetGetter,
        enumerable: true,
        configurable: true,
    },
    composedPath: {
        value: composedPathValue,
        writable: true,
        enumerable: true,
        configurable: true,
    },
    // non-standard but important accessor
    srcElement: {
        get: targetGetter,
        enumerable: true,
        configurable: true,
    },
    path: {
        get: composedPathValue,
        enumerable: true,
        configurable: true,
    },
});
