/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayPush, create, isArray, isFunction, isUndefined, keys, seal } from '@lwc/shared';
import { StylesheetFactory, TemplateStylesheetFactories } from './stylesheet';
import { RefVNodes, VM } from './vm';
import { VBaseElement, VStatic } from './vnodes';

type Callback = () => void;

let nextTickCallbackQueue: Callback[] = [];
export const SPACE_CHAR = 32;

export const EmptyObject = seal(create(null));
export const EmptyArray = seal([]);

function flushCallbackQueue() {
    if (process.env.NODE_ENV !== 'production') {
        if (nextTickCallbackQueue.length === 0) {
            throw new Error(
                `Internal Error: If callbackQueue is scheduled, it is because there must be at least one callback on this pending queue.`
            );
        }
    }
    const callbacks: Callback[] = nextTickCallbackQueue;
    nextTickCallbackQueue = []; // reset to a new queue
    for (let i = 0, len = callbacks.length; i < len; i += 1) {
        callbacks[i]();
    }
}

export function addCallbackToNextTick(callback: Callback) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isFunction(callback)) {
            throw new Error(
                `Internal Error: addCallbackToNextTick() can only accept a function callback`
            );
        }
    }
    if (nextTickCallbackQueue.length === 0) {
        Promise.resolve().then(flushCallbackQueue);
    }
    ArrayPush.call(nextTickCallbackQueue, callback);
}

export function guid(): string {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// Borrowed from Vue template compiler.
// https://github.com/vuejs/vue/blob/531371b818b0e31a989a06df43789728f23dc4e8/src/platforms/web/util/style.js#L5-L16
const DECLARATION_DELIMITER = /;(?![^(]*\))/g;
const PROPERTY_DELIMITER = /:(.+)/;

export function parseStyleText(cssText: string): { [name: string]: string } {
    const styleMap: { [name: string]: string } = {};

    const declarations = cssText.split(DECLARATION_DELIMITER);
    for (const declaration of declarations) {
        if (declaration) {
            const [prop, value] = declaration.split(PROPERTY_DELIMITER);

            if (prop !== undefined && value !== undefined) {
                styleMap[prop.trim()] = value.trim();
            }
        }
    }

    return styleMap;
}

// Make a shallow copy of an object but omit the given key
export function cloneAndOmitKey(object: { [key: string]: any }, keyToOmit: string) {
    const result: { [key: string]: any } = {};
    for (const key of keys(object)) {
        if (key !== keyToOmit) {
            result[key] = object[key];
        }
    }
    return result;
}

export function flattenStylesheets(stylesheets: TemplateStylesheetFactories): StylesheetFactory[] {
    const list: StylesheetFactory[] = [];
    for (const stylesheet of stylesheets) {
        if (!isArray(stylesheet)) {
            list.push(stylesheet);
        } else {
            list.push(...flattenStylesheets(stylesheet));
        }
    }
    return list;
}

// Set a ref (lwc:ref) on a VM, from a template API
export function setRefVNode(vm: VM, ref: string, vnode: VBaseElement | VStatic) {
    if (process.env.NODE_ENV !== 'production' && isUndefined(vm.refVNodes)) {
        throw new Error('refVNodes must be defined when setting a ref');
    }

    // If this method is called, then vm.refVNodes is set as the template has refs.
    // If not, then something went wrong and we threw an error above.
    const refVNodes: RefVNodes = vm.refVNodes!;

    // In cases of conflict (two elements with the same ref), prefer, the last one,
    // in depth-first traversal order.
    if (!(ref in refVNodes) || refVNodes[ref].key < vnode.key) {
        refVNodes[ref] = vnode;
    }
}

// Throw an error if we're running in prod mode. Ensures code is truly removed from prod mode.
export function assertNotProd() {
    /* istanbul ignore if */
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
}
