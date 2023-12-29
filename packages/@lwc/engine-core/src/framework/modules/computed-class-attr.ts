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

// Cache the classes computed from parsing the className string.
// This avoid re-parsing the same className value between patches.
const classMapCache = new Map<string, ClassMap>();

function getClassMap(value: VNodeData['className']): ClassMap {
    // Intentionally using == to match undefined and null values from computed style attribute.
    if (value == null) {
        return EmptyObject;
    }
    if (isArray(value)) {
        const result: ClassMap = create(null);
        for (let i = 0; i < value.length; i++) {
            const item = getClassMap(value[i]);
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
    let classMap = classMapCache.get(value);
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

    classMapCache.set(value, classMap);
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

    // TODO [#000]: Ensure it works correctly when mutating the property on the same object.
    const oldValue = oldVnode?.data.className;
    if (oldValue === newValue) {
        return;
    }

    const { getClassList } = renderer;
    const classList = getClassList(elm!);
    const newClassMap = getClassMap(newValue);
    const oldClassMap = getClassMap(oldValue);

    let name: string;
    for (name in oldClassMap) {
        // remove only if it is not in the new class collection and it is not set from within the instance
        if (isUndefined(newClassMap[name])) {
            classList.remove(name);
        }
    }
    for (name in newClassMap) {
        if (isUndefined(oldClassMap[name])) {
            classList.add(name);
        }
    }
}
