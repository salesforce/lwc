/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    assign,
    create,
    isArray,
    isNull,
    isObject,
    isString,
    isUndefined,
    StringCharCodeAt,
    StringSlice,
} from '@lwc/shared';
import { RendererAPI } from '../renderer';

import { EmptyObject, SPACE_CHAR } from '../utils';
import { VBaseElement, VNodeData } from '../vnodes';

type ClassMap = Record<string, boolean>;

/**
 * Stores the computed class map from parsing the className string.
 * This avoid re-parsing the same className value between patches.
 */
const classNameToClassMap = new Map<string, ClassMap>();

/**
 * Store the classes previously applied to the element.
 *
 * VElement can objects objects as class, and the same object can be reused between patches, we need
 * to keep track of that have been previously applied to the element in case the objects has been
 * mutated between patches.
 */
const vnodeToClassMap = new WeakMap<VBaseElement, ClassMap>();

function normalizeClassMap(value: VNodeData['className']): ClassMap {
    // Intentionally using == to match undefined and null values from computed style attribute.
    if (value == null) {
        return EmptyObject;
    } else if (isArray(value)) {
        const result: ClassMap = create(null);
        for (let i = 0; i < value.length; i++) {
            const item = normalizeClassMap(value[i]);
            assign(result, item);
        }
        return result;
    } else if (isObject(value)) {
        const result: ClassMap = create(null);
        for (const key in value) {
            if (value[key]) {
                result[key] = true;
            }
        }
        return result;
    } else {
        value = isString(value) ? value : '';
        return parseStringClassName(value);
    }
}

function parseStringClassName(value: string): ClassMap {
    let classMap = classNameToClassMap.get(value);
    if (!isUndefined(classMap)) {
        return classMap;
    }

    classMap = create(null) as ClassMap;

    let start = 0;
    let current = start;
    const len = value.length;

    // Iterate through the string one character at a time and extract class names.
    for (; current < len; current++) {
        if (StringCharCodeAt.call(value, current) === SPACE_CHAR) {
            if (current > start) {
                classMap[StringSlice.call(value, start, current)] = true;
            }
            start = current + 1;
        }
    }

    // Extract the last class name from the string (if any).
    if (current > start) {
        classMap[StringSlice.call(value, start, current)] = true;
    }

    classNameToClassMap.set(value, classMap);
    return classMap;
}

export function patchClassAttribute(
    oldVnode: VBaseElement | null,
    vnode: VBaseElement,
    renderer: RendererAPI
) {
    const {
        elm,
        data: { className: newValue },
    } = vnode;

    const oldValue = oldVnode?.data.className;

    // Fast path: If both old value and new value are identical string, skip patch.
    if (oldValue === newValue && isString(oldValue) && isString(newValue)) {
        return;
    }

    const newClassMap = normalizeClassMap(newValue);
    const oldClassMap = isNull(oldVnode) ? EmptyObject : vnodeToClassMap.get(oldVnode);

    const { getClassList } = renderer;
    const classList = getClassList(elm!);

    let name: string;
    for (name in oldClassMap) {
        if (isUndefined(newClassMap[name])) {
            classList.remove(name);
        }
    }
    for (name in newClassMap) {
        if (isUndefined(oldClassMap[name])) {
            classList.add(name);
        }
    }

    vnodeToClassMap.set(vnode, newClassMap);
}
