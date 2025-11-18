/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    ArrayFilter,
    ArrayFrom,
    ArrayIncludes,
    ArrayJoin,
    ArrayMap,
    forEach,
    StringSplit,
    StringTrim,
} from '@lwc/shared';
import type { LightningElement } from './lightning-element';

// Copied from lib.dom
interface DOMTokenList {
    readonly length: number;
    value: string;
    toString(): string;
    add(...tokens: string[]): void;
    contains(token: string): boolean;
    item(index: number): string | null;
    remove(...tokens: string[]): void;
    replace(token: string, newToken: string): boolean;
    supports(token: string): boolean;
    toggle(token: string, force?: boolean): boolean;
    forEach(
        callbackfn: (value: string, key: number, parent: DOMTokenList) => void,
        thisArg?: any
    ): void;
    [index: number]: string;
}

const MULTI_SPACE = /\s+/g;

function parseClassName(className: string | null): string[] {
    return ArrayFilter.call<string[]>(
        ArrayMap.call(StringSplit.call(className ?? '', MULTI_SPACE), (item) =>
            StringTrim.call(item)
        ) as string[],
        Boolean
    );
}

export class ClassList implements DOMTokenList {
    el: LightningElement;

    constructor(el: LightningElement) {
        this.el = el;
    }

    add(...newClassNames: string[]) {
        const set = new Set(parseClassName(this.el.className));
        for (const newClassName of newClassNames) {
            set.add(newClassName);
        }
        this.el.className = ArrayJoin.call(ArrayFrom(set), ' ');
    }

    contains(className: string) {
        return ArrayIncludes.call(parseClassName(this.el.className), className);
    }

    remove(...classNamesToRemove: string[]) {
        const set = new Set(parseClassName(this.el.className));
        for (const newClassName of classNamesToRemove) {
            set.delete(newClassName);
        }
        this.el.className = ArrayJoin.call(ArrayFrom(set), ' ');
    }

    replace(oldClassName: string, newClassName: string) {
        let classWasReplaced = false;
        const listOfClasses = parseClassName(this.el.className);
        forEach.call(listOfClasses, (value, idx) => {
            if (value === oldClassName) {
                classWasReplaced = true;
                listOfClasses[idx] = newClassName;
            }
        });
        this.el.className = ArrayJoin.call(listOfClasses, ' ');
        return classWasReplaced;
    }

    toggle(classNameToToggle: string, force?: boolean) {
        const set = new Set(parseClassName(this.el.className));
        if (!set.has(classNameToToggle) && force !== false) {
            set.add(classNameToToggle);
        } else if (set.has(classNameToToggle) && force !== true) {
            set.delete(classNameToToggle);
        }
        this.el.className = ArrayJoin.call(ArrayFrom(set), ' ');
        return set.has(classNameToToggle);
    }

    get value(): string {
        return this.el.className;
    }

    toString(): string {
        return this.el.className;
    }

    get length(): number {
        return parseClassName(this.el.className).length;
    }

    // Stubs to satisfy DOMTokenList interface
    [index: number]: never; // Can't implement arbitrary index getters without a proxy

    item(index: number): string | null {
        return parseClassName(this.el.className ?? '')[index] ?? null;
    }

    forEach(
        callbackFn: (value: string, key: number, parent: DOMTokenList) => void,
        thisArg?: any
    ): void {
        forEach.call(parseClassName(this.el.className), (value, index) =>
            callbackFn.call(thisArg, value, index, this)
        );
    }

    // This method is present on DOMTokenList but throws an error in the browser when used
    // in connection with Element#classList.
    supports(_token: string): boolean {
        throw new TypeError('DOMTokenList has no supported tokens.');
    }
}
