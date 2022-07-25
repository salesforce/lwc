/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    create,
    freeze,
    isNull,
    isString,
    isUndefined,
    StringCharCodeAt,
    StringSlice,
} from '@lwc/shared';
import { RendererAPI } from '../renderer';

import { EmptyObject, SPACE_CHAR } from '../utils';
import { VBaseElement } from '../vnodes';

const classNameToClassMap = create(null);

function getMapFromClassName(className: string | undefined): Record<string, boolean> {
    // Intentionally using == to match undefined and null values from computed style attribute
    if (className == null) {
        return EmptyObject;
    }
    // computed class names must be string
    className = isString(className) ? className : className + '';

    let map = classNameToClassMap[className];
    if (map) {
        return map;
    }
    map = create(null);
    let start = 0;
    let o;
    const len = className.length;
    for (o = 0; o < len; o++) {
        if (StringCharCodeAt.call(className, o) === SPACE_CHAR) {
            if (o > start) {
                map[StringSlice.call(className, start, o)] = true;
            }
            start = o + 1;
        }
    }

    if (o > start) {
        map[StringSlice.call(className, start, o)] = true;
    }
    classNameToClassMap[className] = map;
    if (process.env.NODE_ENV !== 'production') {
        // just to make sure that this object never changes as part of the diffing algo
        freeze(map);
    }
    return map;
}

export function patchClassAttribute(
    oldVnode: VBaseElement | null,
    vnode: VBaseElement,
    renderer: RendererAPI
) {
    const {
        elm,
        data: { className: newClass },
    } = vnode;

    const oldClass = isNull(oldVnode) ? undefined : oldVnode.data.className;
    if (oldClass === newClass) {
        return;
    }

    const { getClassList } = renderer;
    const classList = getClassList(elm!);
    const newClassMap = getMapFromClassName(newClass);
    const oldClassMap = getMapFromClassName(oldClass);

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
