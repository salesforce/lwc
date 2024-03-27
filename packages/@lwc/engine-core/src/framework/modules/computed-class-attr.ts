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
import { VBaseElement, VStaticPartElement } from '../vnodes';

const classNameToClassMap = create(null);

export function getMapFromClassName(className: string | undefined): Record<string, boolean> {
    if (isUndefined(className) || isNull(className) || className === '') {
        return EmptyObject;
    }
    // computed class names must be string
    // This will throw if className is a symbol or null-prototype object
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
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
    oldVnode: VBaseElement | VStaticPartElement | null,
    vnode: VBaseElement | VStaticPartElement,
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

    const newClassMap = getMapFromClassName(newClass);
    const oldClassMap = getMapFromClassName(oldClass);

    if (oldClassMap === newClassMap) {
        // These objects are cached by className string (`classNameToClassMap`), so we can only get here if there is
        // a key collision due to types, e.g. oldClass is `undefined` and newClass is `""` (empty string), or oldClass
        // is `1` (number) and newClass is `"1"` (string).
        return;
    }

    const { getClassList } = renderer;
    const classList = getClassList(elm!);

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
