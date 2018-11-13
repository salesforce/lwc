/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { getRootNode } from '../../faux-shadow/node';
import { windowRemoveEventListener, windowAddEventListener } from '../../env/window';
import {
    removeEventListener as nativeRemoveEventListener,
    addEventListener as nativeAddEventListener,
} from '../../env/element';
import { SyntheticShadowRoot } from '../../faux-shadow/shadow-root';

// TODO: We should probably change this logic to work with native shadow as well
function isShadyRoot(nodeRef) {
    return nodeRef instanceof SyntheticShadowRoot;
}

function copyOwnProperty(name, source, target) {
    let pd = Object.getOwnPropertyDescriptor(source, name);
    if (pd) {
        Object.defineProperty(target, name, pd);
    }
}

function extend(target, source) {
    if (target && source) {
        let n$ = Object.getOwnPropertyNames(source);
        for (let i = 0, n; (i < n$.length) && (n = n$[i]); i++) {
            copyOwnProperty(n, source, target);
        }
    }
    return target || source;
}

const hasDescriptors = Object.getOwnPropertyDescriptor(Node.prototype, 'firstChild');

/*
Make this name unique so it is unlikely to conflict with properties on objects passed to `addEventListener`
https://github.com/webcomponents/shadydom/issues/173
*/
const /** string */ eventWrappersName = `__eventWrappers${Date.now()}`;

/** @type {?function(!Event): boolean} */
const composedGetter = (() => {
    const composedProp = Object.getOwnPropertyDescriptor(Event.prototype, 'composed');
    return composedProp ? (ev) => composedProp.get.call(ev) : null;
})();

// https://github.com/w3c/webcomponents/issues/513#issuecomment-224183937
const alwaysComposed = {
    'blur': true,
    'focus': true,
    'focusin': true,
    'focusout': true,
    'click': true,
    'dblclick': true,
    'mousedown': true,
    'mouseenter': true,
    'mouseleave': true,
    'mousemove': true,
    'mouseout': true,
    'mouseover': true,
    'mouseup': true,
    'wheel': true,
    'beforeinput': true,
    'input': true,
    'keydown': true,
    'keyup': true,
    'compositionstart': true,
    'compositionupdate': true,
    'compositionend': true,
    'touchstart': true,
    'touchend': true,
    'touchmove': true,
    'touchcancel': true,
    'pointerover': true,
    'pointerenter': true,
    'pointerdown': true,
    'pointermove': true,
    'pointerup': true,
    'pointercancel': true,
    'pointerout': true,
    'pointerleave': true,
    'gotpointercapture': true,
    'lostpointercapture': true,
    'dragstart': true,
    'drag': true,
    'dragenter': true,
    'dragleave': true,
    'dragover': true,
    'drop': true,
    'dragend': true,
    'DOMActivate': true,
    'DOMFocusIn': true,
    'DOMFocusOut': true,
    'keypress': true
};

const unpatchedEvents = {
    'DOMAttrModified': true,
    'DOMAttributeNameChanged': true,
    'DOMCharacterDataModified': true,
    'DOMElementNameChanged': true,
    'DOMNodeInserted': true,
    'DOMNodeInsertedIntoDocument': true,
    'DOMNodeRemoved': true,
    'DOMNodeRemovedFromDocument': true,
    'DOMSubtreeModified': true
}

function pathComposer(startNode, composed) {
    let composedPath = [];
    let current = startNode;
    let startRoot = startNode === window ? window : startNode.getRootNode();
    while (current) {
        composedPath.push(current);
        if (current.assignedSlot) {
            current = current.assignedSlot;
        } else if (current.nodeType === Node.DOCUMENT_FRAGMENT_NODE && current.host && (composed || current !== startRoot)) {
            current = current.host;
        } else {
            current = current.parentNode;
        }
    }
    // event composedPath includes window when startNode's ownerRoot is document
    if (composedPath[composedPath.length - 1] === document) {
        composedPath.push(window);
    }
    return composedPath;
}

function retarget(refNode, path) {
    // if (!isShadyRoot(refNode)) {
    //     return refNode;
    // }
    // If ANCESTOR's root is not a shadow root or ANCESTOR's root is BASE's
    // shadow-including inclusive ancestor, return ANCESTOR.
    let refNodePath = pathComposer(refNode, true);
    let p$ = path;
    for (let i = 0, ancestor, lastRoot, root, rootIdx; i < p$.length; i++) {
        ancestor = p$[i];
        root = ancestor === window ? window : ancestor.getRootNode();
        if (root !== lastRoot) {
            rootIdx = refNodePath.indexOf(root);
            lastRoot = root;
        }
        if (!isShadyRoot(root) || rootIdx > -1) {
            return ancestor;
        }
    }
}

let eventMixin = {

    /**
     * @this {Event}
     */
    get composed() {
        if (this.__composed === undefined) {
            // if there's an original `composed` getter on the Event prototype, use that
            if (composedGetter) {
                // TODO(web-padawan): see https://github.com/webcomponents/shadydom/issues/275
                this.__composed = this.type === 'focusin' || this.type === 'focusout' || composedGetter(this);
                // If the event is trusted, or `isTrusted` is not supported, check the list of always composed events
            } else if (this.isTrusted !== false) {
                this.__composed = alwaysComposed[this.type];
            }
        }
        return this.__composed || false;
    },

    /**
     * @this {Event}
     */
    composedPath() {
        if (!this.__composedPath) {
            this.__composedPath = pathComposer(this['__target'], this.composed);
        }
        return this.__composedPath;
    },

    /**
     * @this {Event}
     */
    get target() {
        return retarget(this.currentTarget || this['__previousCurrentTarget'], this.composedPath());
    },

    // http://w3c.github.io/webcomponents/spec/shadow/#event-relatedtarget-retargeting
    /**
     * @this {Event}
     */
    get relatedTarget() {
        if (!this.__relatedTarget) {
            return null;
        }
        if (!this.__relatedTargetComposedPath) {
            this.__relatedTargetComposedPath = pathComposer(this.__relatedTarget, true);
        }
        // find the deepest node in relatedTarget composed path that is in the same root with the currentTarget
        return retarget(this.currentTarget || this['__previousCurrentTarget'], this.__relatedTargetComposedPath);
    },
    /**
     * @this {Event}
     */
    stopPropagation() {
        Event.prototype.stopPropagation.call(this);
        this.__propagationStopped = true;
    },
    /**
     * @this {Event}
     */
    stopImmediatePropagation() {
        Event.prototype.stopImmediatePropagation.call(this);
        this.__immediatePropagationStopped = true;
        this.__propagationStopped = true;
    }

};

function mixinComposedFlag(Base) {
    // NOTE: avoiding use of `class` here so that transpiled output does not
    // try to do `Base.call` with a dom construtor.
    let klazz = function (type, options) {
        let event = new Base(type, options);
        event.__composed = options && Boolean(options['composed']);
        return event;
    }
    // put constructor properties on subclass
    for (var i in Base) {
        klazz[i] = Base[i];
    }
    klazz.prototype = Base.prototype;
    return klazz;
}

let nonBubblingEventsToRetarget = {
    'focus': true,
    'blur': true
};


/**
 * Check if the event has been retargeted by comparing original `target`, and calculated `target`
 * @param {Event} event
 * @return {boolean} True if the original target and calculated target are the same
 */
function hasRetargeted(event) {
    return event['__target'] !== event.target || event.__relatedTarget !== event.relatedTarget;
}

/**
 *
 * @param {Event} event
 * @param {Node} node
 * @param {string} phase
 */
function fireHandlers(event, node, phase) {
    let hs = node.__handlers && node.__handlers[event.type] &&
        node.__handlers[event.type][phase];
    if (hs) {
        for (let i = 0, fn; (fn = hs[i]); i++) {
            if (hasRetargeted(event) && event.target === event.relatedTarget) {
                return;
            }
            fn.call(node, event);
            if (event.__immediatePropagationStopped) {
                return;
            }
        }
    }
}

function retargetNonBubblingEvent(e) {
    let path = e.composedPath();
    let node;
    // override `currentTarget` to let patched `target` calculate correctly
    Object.defineProperty(e, 'currentTarget', {
        get: function () {
            return node;
        },
        configurable: true
    });
    for (let i = path.length - 1; i >= 0; i--) {
        node = path[i];
        // capture phase fires all capture handlers
        fireHandlers(e, node, 'capture');
        if (e.__propagationStopped) {
            return;
        }
    }

    // set the event phase to `AT_TARGET` as in spec
    Object.defineProperty(e, 'eventPhase', { get() { return Event.AT_TARGET } });

    // the event only needs to be fired when owner roots change when iterating the event path
    // keep track of the last seen owner root
    let lastFiredRoot;
    for (let i = 0; i < path.length; i++) {
        node = path[i];
        // TODO: not sure if this condition makes sense, what is the root of window?
        const root = node !== window ? node.getRootNode() : null;
        if (i === 0 || (root && root === lastFiredRoot)) {
            fireHandlers(e, node, 'bubble');
            // don't bother with window, it doesn't have `getRootNode` and will be last in the path anyway
            if (node !== window) {
                lastFiredRoot = node.getRootNode();
            }
            if (e.__propagationStopped) {
                return;
            }
        }
    }
}

function listenerSettingsEqual(savedListener, node, type, capture, once, passive) {
    let {
        node: savedNode,
        type: savedType,
        capture: savedCapture,
        once: savedOnce,
        passive: savedPassive
    } = savedListener;
    return node === savedNode &&
        type === savedType &&
        capture === savedCapture &&
        once === savedOnce &&
        passive === savedPassive;
}

export function findListener(wrappers, node, type, capture, once, passive) {
    for (let i = 0; i < wrappers.length; i++) {
        if (listenerSettingsEqual(wrappers[i], node, type, capture, once, passive)) {
            return i;
        }
    }
    return -1;
}

/**
 * Firefox can throw on accessing eventWrappers inside of `removeEventListener` during a selenium run
 * Try/Catch accessing eventWrappers to work around
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1353074
 */
function getEventWrappers(eventLike) {
    let wrappers = null;
    try {
        wrappers = eventLike[eventWrappersName];
    } catch (e) { } // eslint-disable-line no-empty
    return wrappers;
}

/**
 * @this {Event}
 */
export function addEventListener(type, fnOrObj, optionsOrCapture) {
    if (!fnOrObj) {
        return;
    }

    const handlerType = typeof fnOrObj;

    // bail if `fnOrObj` is not a function, not an object
    if (handlerType !== 'function' && handlerType !== 'object') {
        return;
    }

    // bail if `fnOrObj` is an object without a `handleEvent` method
    if (handlerType === 'object' && (!fnOrObj.handleEvent || typeof fnOrObj.handleEvent !== 'function')) {
        return;
    }

    const ael = this instanceof Window ? windowAddEventListener :
        nativeAddEventListener;

    if (unpatchedEvents[type]) {
        return ael.call(this, type, fnOrObj, optionsOrCapture);
    }

    // The callback `fn` might be used for multiple nodes/events. Since we generate
    // a wrapper function, we need to keep track of it when we remove the listener.
    // It's more efficient to store the node/type/options information as Array in
    // `fn` itself rather than the node (we assume that the same callback is used
    // for few nodes at most, whereas a node will likely have many event listeners).
    // NOTE(valdrin) invoking external functions is costly, inline has better perf.
    let capture, once, passive;
    if (optionsOrCapture && typeof optionsOrCapture === 'object') {
        capture = Boolean(optionsOrCapture.capture);
        once = Boolean(optionsOrCapture.once);
        passive = Boolean(optionsOrCapture.passive);
    } else {
        capture = Boolean(optionsOrCapture);
        once = false;
        passive = false;
    }
    // hack to let ShadyRoots have event listeners
    // event listener will be on host, but `currentTarget`
    // will be set to shadyroot for event listener
    let target = (optionsOrCapture && optionsOrCapture.__shadyTarget) || this;

    let wrappers = fnOrObj[eventWrappersName];
    if (wrappers) {
        // Stop if the wrapper function has already been created.
        if (findListener(wrappers, target, type, capture, once, passive) > -1) {
            return;
        }
    } else {
        fnOrObj[eventWrappersName] = [];
    }

    /**
     * @this {HTMLElement}
     * @param {Event} e
     */
    const wrapperFn = function (e) {
        // Support `once` option.
        if (once) {
            this.removeEventListener(type, fnOrObj, optionsOrCapture);
        }
        if (!e['__target']) {
            patchEvent(e);
        }
        let lastCurrentTargetDesc;
        if (target !== this) {
            // replace `currentTarget` to make `target` and `relatedTarget` correct for inside the shadowroot
            lastCurrentTargetDesc = Object.getOwnPropertyDescriptor(e, 'currentTarget');
            Object.defineProperty(e, 'currentTarget', { get() { return target }, configurable: true });
        }
        e['__previousCurrentTarget'] = e['currentTarget'];
        // Always check if a shadowRoot is in the current event path.
        // If it is not, the event was generated on either the host of the shadowRoot
        // or a children of the host.
        if (isShadyRoot(target) && e.composedPath().indexOf(target) == -1) {
            return;
        }
        // There are two critera that should stop events from firing on this node
        // 1. the event is not composed and the current node is not in the same root as the target
        // 2. when bubbling, if after retargeting, relatedTarget and target point to the same node
        if (e.composed || e.composedPath().indexOf(target) > -1) {
            if (hasRetargeted(e) && e.target === e.relatedTarget) {
                if (e.eventPhase === Event.BUBBLING_PHASE) {
                    e.stopImmediatePropagation();
                }
                return;
            }
            // prevent non-bubbling events from triggering bubbling handlers on shadowroot, but only if not in capture phase
            if (e.eventPhase !== Event.CAPTURING_PHASE && !e.bubbles && e.target !== target && !(target instanceof Window)) {
                return;
            }
            let ret = handlerType === 'function' ?
                fnOrObj.call(target, e) :
                (fnOrObj.handleEvent && fnOrObj.handleEvent(e));
            if (target !== this) {
                // replace the "correct" `currentTarget`
                if (lastCurrentTargetDesc) {
                    Object.defineProperty(e, 'currentTarget', lastCurrentTargetDesc);
                    lastCurrentTargetDesc = null;
                } else {
                    delete e['currentTarget'];
                }
            }
            return ret;
        }
    };
    // Store the wrapper information.
    fnOrObj[eventWrappersName].push({
        // note: use target here which is either a shadowRoot
        // (when the host element is proxy'ing the event) or this element
        node: target,
        type: type,
        capture: capture,
        once: once,
        passive: passive,
        wrapperFn: wrapperFn
    });

    if (nonBubblingEventsToRetarget[type]) {
        this.__handlers = this.__handlers || {};
        this.__handlers[type] = this.__handlers[type] ||
            { 'capture': [], 'bubble': [] };
        this.__handlers[type][capture ? 'capture' : 'bubble'].push(wrapperFn);
    } else {
        ael.call(this, type, wrapperFn, optionsOrCapture);
    }
}

/**
 * @this {Event}
 */
export function removeEventListener(type, fnOrObj, optionsOrCapture) {
    if (!fnOrObj) {
        return;
    }
    const rel = this instanceof Window ? windowRemoveEventListener :
        nativeRemoveEventListener;
    if (unpatchedEvents[type]) {
        return rel.call(this, type, fnOrObj, optionsOrCapture);
    }
    // NOTE(valdrin) invoking external functions is costly, inline has better perf.
    let capture, once, passive;
    if (optionsOrCapture && typeof optionsOrCapture === 'object') {
        capture = Boolean(optionsOrCapture.capture);
        once = Boolean(optionsOrCapture.once);
        passive = Boolean(optionsOrCapture.passive);
    } else {
        capture = Boolean(optionsOrCapture);
        once = false;
        passive = false;
    }
    let target = (optionsOrCapture && optionsOrCapture.__shadyTarget) || this;
    // Search the wrapped function.
    let wrapperFn = undefined;
    let wrappers = getEventWrappers(fnOrObj);
    if (wrappers) {
        let idx = findListener(wrappers, target, type, capture, once, passive);
        if (idx > -1) {
            wrapperFn = wrappers.splice(idx, 1)[0].wrapperFn;
            // Cleanup.
            if (!wrappers.length) {
                fnOrObj[eventWrappersName] = undefined;
            }
        }
    }
    rel.call(this, type, wrapperFn || fnOrObj, optionsOrCapture);
    if (wrapperFn && nonBubblingEventsToRetarget[type] &&
        this.__handlers && this.__handlers[type]) {
        const arr = this.__handlers[type][capture ? 'capture' : 'bubble'];
        const idx = arr.indexOf(wrapperFn);
        if (idx > -1) {
            arr.splice(idx, 1);
        }
    }
}

function activateFocusEventOverrides() {
    for (let ev in nonBubblingEventsToRetarget) {
        window.addEventListener(ev, function (e) {
            if (!e['__target']) {
                patchEvent(e);
                retargetNonBubblingEvent(e);
            }
        }, true);
    }
}

function patchEvent(event) {
    event['__target'] = event.target;
    event.__relatedTarget = event.relatedTarget;
    // patch event prototype if we can
    if (hasDescriptors) {
        patchPrototype(event, eventMixin);
        // and fallback to patching instance
    } else {
        extend(event, eventMixin);
    }
}

function patchPrototype(obj, mixin) {
    let proto = Object.getPrototypeOf(obj);
    if (!proto.hasOwnProperty('__patchProto')) {
        let patchProto = Object.create(proto);
        patchProto.__sourceProto = proto;
        extend(patchProto, mixin);
        proto['__patchProto'] = patchProto;
    }
    // old browsers don't have setPrototypeOf
    obj.__proto__ = proto['__patchProto'];
}

let PatchedEvent = mixinComposedFlag(window.Event);
let PatchedCustomEvent = mixinComposedFlag(window.CustomEvent);
let PatchedMouseEvent = mixinComposedFlag(window.MouseEvent);

export default function patchEvents() {
    window.Node.prototype.addEventListener = window.Window.prototype.addEventListener = addEventListener;
    window.Node.prototype.removeEventListener = window.Window.prototype.removeEventListener = removeEventListener;
    window.Node.prototype.getRootNode = getRootNode;
    window.Event = PatchedEvent;
    window.CustomEvent = PatchedCustomEvent;
    window.MouseEvent = PatchedMouseEvent;
    activateFocusEventOverrides();
}
