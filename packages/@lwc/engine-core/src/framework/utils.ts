/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayPush,
    create,
    isArray,
    isFunction,
    keys,
    seal,
    isAPIFeatureEnabled,
    APIFeature,
    isUndefined,
    isNull,
} from '@lwc/shared';
import { logWarnOnce } from '../shared/logger';
import { StylesheetFactory, TemplateStylesheetFactories } from './stylesheet';
import { getComponentAPIVersion, getComponentRegisteredName } from './component';
import { LightningElementConstructor } from './base-lightning-element';
import { VElementData } from './vnodes';

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
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
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

export function shouldUseNativeCustomElementLifecycle(ctor: LightningElementConstructor) {
    if (lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
        // temporary "kill switch"
        return false;
    }

    const apiVersion = getComponentAPIVersion(ctor);

    return isAPIFeatureEnabled(APIFeature.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE, apiVersion);
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

// Throw an error if we're running in prod mode. Ensures code is truly removed from prod mode.
export function assertNotProd() {
    /* istanbul ignore if */
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
}

// Temporary fix for when the LWC v5 compiler is used in conjunction with a v6+ engine
// The old compiler format used the "slot" attribute in the `data` bag, whereas the new
// format uses the special `slotAssignment` key.
// This should be removed when the LWC v5 compiler is not used anywhere where it could be mismatched
// with another LWC engine version.
// TODO [#3974]: remove temporary logic to support v5 compiler + v6+ engine
export function applyTemporaryCompilerV5SlotFix(data: VElementData) {
    if (lwcRuntimeFlags.DISABLE_TEMPORARY_V5_COMPILER_SUPPORT) {
        return data;
    }
    const { attrs } = data;
    if (!isUndefined(attrs)) {
        const { slot } = attrs;
        if (!isUndefined(slot) && !isNull(slot)) {
            return {
                ...data,
                attrs: cloneAndOmitKey(attrs, 'slot'),
                slotAssignment: String(slot),
            };
        }
    }
    return data;
}

export function shouldBeFormAssociated(Ctor: LightningElementConstructor) {
    const ctorFormAssociated = Boolean(Ctor.formAssociated);
    const apiVersion = getComponentAPIVersion(Ctor);
    const apiFeatureEnabled = isAPIFeatureEnabled(
        APIFeature.ENABLE_ELEMENT_INTERNALS_AND_FACE,
        apiVersion
    );

    if (process.env.NODE_ENV !== 'production' && ctorFormAssociated && !apiFeatureEnabled) {
        const tagName = getComponentRegisteredName(Ctor);
        logWarnOnce(
            `Component <${tagName}> set static formAssociated to true, but form ` +
                `association is not enabled because the API version is ${apiVersion}. To enable form association, ` +
                `update the LWC component API version to 61 or above. https://lwc.dev/guide/versioning`
        );
    }

    return ctorFormAssociated && apiFeatureEnabled;
}
