/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperties, isNull, isUndefined } from '@lwc/shared';

import { pathComposer } from '../../3rdparty/polymer/path-composer';
import { retarget } from '../../3rdparty/polymer/retarget';
import {
    composedPath as originalComposedPath,
    eventTargetGetter,
    eventCurrentTargetGetter,
} from '../../env/dom';
import { Node } from '../../env/node';
import {
    eventToShadowRootMap,
    getShadowRoot,
    hasInternalSlot,
    isSyntheticShadowHost,
} from '../../faux-shadow/shadow-root';
import { EventListenerContext, eventToContextMap } from '../../faux-shadow/events';
import { getNodeOwnerKey } from '../../shared/node-ownership';
import { getOwnerDocument } from '../../shared/utils';

function patchedCurrentTargetGetter(this: Event): EventTarget | null {
    const currentTarget = eventCurrentTargetGetter.call(this);
    if (isNull(currentTarget)) {
        return null;
    }
    if (eventToContextMap.get(this) === EventListenerContext.SHADOW_ROOT_LISTENER) {
        return getShadowRoot(currentTarget as Element);
    }
    return currentTarget;
}

function patchedTargetGetter(this: Event): EventTarget | null {
    const originalTarget = eventTargetGetter.call(this);
    if (!(originalTarget instanceof Node)) {
        return originalTarget;
    }

    const doc = getOwnerDocument(originalTarget);
    const composedPath = pathComposer(originalTarget, this.composed);
    const originalCurrentTarget = eventCurrentTargetGetter.call(this);

    // Handle cases where the currentTarget is null (for async events), and when an event has been
    // added to Window
    if (!(originalCurrentTarget instanceof Node)) {
        // TODO [#1511]: Special escape hatch to support legacy behavior. Should be fixed.
        // If the event's target is being accessed async and originalTarget is not a keyed element, do not retarget
        if (isNull(originalCurrentTarget) && isUndefined(getNodeOwnerKey(originalTarget))) {
            return originalTarget;
        }
        return retarget(doc, composedPath);
    } else if (originalCurrentTarget === doc || originalCurrentTarget === doc.body) {
        // TODO [#1530]: If currentTarget is document or document.body (Third party libraries that have global event listeners)
        // and the originalTarget is not a keyed element, do not retarget
        if (isUndefined(getNodeOwnerKey(originalTarget))) {
            return originalTarget;
        }
        return retarget(doc, composedPath);
    }

    let actualCurrentTarget = originalCurrentTarget;
    let actualPath = composedPath;

    // Address the possibility that `currentTarget` is a shadow root
    if (isSyntheticShadowHost(originalCurrentTarget)) {
        const context = eventToContextMap.get(this);
        if (context === EventListenerContext.SHADOW_ROOT_LISTENER) {
            actualCurrentTarget = getShadowRoot(originalCurrentTarget);
        }
    }

    // Address the possibility that `target` is a shadow root
    if (isSyntheticShadowHost(originalTarget) && eventToShadowRootMap.has(this)) {
        actualPath = pathComposer(getShadowRoot(originalTarget), this.composed);
    }

    return retarget(actualCurrentTarget, actualPath);
}

function patchedComposedPathValue(this: Event): EventTarget[] {
    const originalTarget = eventTargetGetter.call(this);

    // Account for events with targets that are not instances of Node (e.g., when a readystatechange
    // handler is listening on an instance of XMLHttpRequest).
    if (!(originalTarget instanceof Node)) {
        return [];
    }

    // If the original target is inside a native shadow root, then just call the native
    // composePath() method. The event is already retargeted and this causes our composedPath()
    // polyfill to compute the wrong value. This is only an issue when you have a native web
    // component inside an LWC component (see test in same commit) but this scenario is unlikely
    // because we don't yet support that. Workaround specifically for W-9846457. Mixed mode solution
    // will likely be more involved.
    const hasShadowRoot = Boolean((originalTarget as any).shadowRoot);
    const hasSyntheticShadowRootAttached = hasInternalSlot(originalTarget);
    if (hasShadowRoot && !hasSyntheticShadowRootAttached) {
        return originalComposedPath.call(this);
    }

    const originalCurrentTarget = eventCurrentTargetGetter.call(this);

    // If the event has completed propagation, the composedPath should be an empty array.
    if (isNull(originalCurrentTarget)) {
        return [];
    }

    // Address the possibility that `target` is a shadow root
    let actualTarget = originalTarget;
    if (isSyntheticShadowHost(originalTarget) && eventToShadowRootMap.has(this)) {
        actualTarget = getShadowRoot(originalTarget);
    }

    return pathComposer(actualTarget, this.composed);
}

defineProperties(Event.prototype, {
    target: {
        get: patchedTargetGetter,
        enumerable: true,
        configurable: true,
    },
    currentTarget: {
        get: patchedCurrentTargetGetter,
        enumerable: true,
        configurable: true,
    },
    composedPath: {
        value: patchedComposedPathValue,
        writable: true,
        enumerable: true,
        configurable: true,
    },
    // Non-standard but widely supported for backwards-compatibility
    srcElement: {
        get: patchedTargetGetter,
        enumerable: true,
        configurable: true,
    },
    // Non-standard but implemented in Chrome and continues to exist for backwards-compatibility
    // https://source.chromium.org/chromium/chromium/src/+/master:third_party/blink/renderer/core/dom/events/event.idl;l=58?q=event.idl&ss=chromium
    path: {
        get: patchedComposedPathValue,
        enumerable: true,
        configurable: true,
    },
});
