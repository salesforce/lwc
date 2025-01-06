/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import type { LightningElement } from './lightning-element';

const MULTI_SPACE = /\s+/g;

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

export class ClassList implements DOMTokenList {
    el: LightningElement;

    constructor(el: LightningElement) {
        this.el = el;
    }

    add(...newClassNames: string[]) {
        const className = this.el.className;
        const set = new Set(className.split(MULTI_SPACE).filter(Boolean));
        for (const newClassName of newClassNames) {
            set.add(newClassName);
        }
        this.el.className = Array.from(set).join(' ');
    }

    contains(className: string) {
        const currentClassNameStr = this.el.className;
        return currentClassNameStr.split(MULTI_SPACE).includes(className);
    }

    remove(...classNamesToRemove: string[]) {
        const className = this.el.className;
        const set = new Set(className.split(MULTI_SPACE).filter(Boolean));
        for (const newClassName of classNamesToRemove) {
            set.delete(newClassName);
        }
        this.el.className = Array.from(set).join(' ');
    }

    replace(oldClassName: string, newClassName: string) {
        let classWasReplaced = false;
        const className = this.el.className;
        const listOfClasses = className.split(MULTI_SPACE).filter(Boolean) as string[];
        listOfClasses.forEach((value, idx) => {
            if (value === oldClassName) {
                classWasReplaced = true;
                listOfClasses[idx] = newClassName;
            }
        });
        this.el.className = listOfClasses.join(' ');
        return classWasReplaced;
    }

    toggle(classNameToToggle: string, force?: boolean) {
        const classNameStr = this.el.className;
        const set = new Set(classNameStr.split(MULTI_SPACE).filter(Boolean));
        if (!set.has(classNameToToggle) && force !== false) {
            set.add(classNameToToggle);
        } else if (set.has(classNameToToggle) && force !== true) {
            set.delete(classNameToToggle);
        }
        this.el.className = Array.from(set).join(' ');
        return set.has(classNameToToggle);
    }

    get value(): string {
        return this.el.className;
    }

    toString(): string {
        return this.el.className;
    }

    // Stubs to satisfy DOMTokenList interface
    [index: number]: never; // Can't implement arbitrary index getters without a proxy
    item(_index: number): string | null {
        throw new Error('Method "item" not implemented.');
    }
    supports(_token: string): boolean {
        throw new Error('Method "supports" not implemented.');
    }
    forEach(
        _callbackfn: (value: string, key: number, parent: DOMTokenList) => void,
        _thisArg?: any
    ): void {
        throw new Error('Method "forEach" not implemented.');
    }
    get length(): number {
        throw new Error('Property "length" not implemented.');
    }
}
