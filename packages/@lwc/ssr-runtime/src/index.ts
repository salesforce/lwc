/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const MULTI_SPACE = /\s+/g;

type Attributes = Record<string, string | true>;

type LightningElementConstructor = typeof LightningElement;

class ClassList {
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
        const listOfClasses = className.split(MULTI_SPACE).filter(Boolean);
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
}

export class LightningElement {
    static renderMode?: 'light' | 'shadow';

    isConnected = false;
    className = '';
    // TODO [W-14977927]: protect internals from userland
    __attrs?: Attributes;
    __classList: ClassList | null = null;

    constructor(propsAvailableAtConstruction: Record<string, any>) {
        Object.assign(this, propsAvailableAtConstruction);
    }

    // TODO [W-14977927]: protect internals from userland
    __internal__setState(
        props: Record<string, any>,
        reflectedProps: string[],
        attrs: Record<string, any>
    ) {
        Object.assign(this, props);
        this.__attrs = attrs;

        // Whenever a reflected prop changes, we'll update the original props object
        // that was passed in. That'll be referenced when the attrs are rendered later.
        for (const reflectedPropName of reflectedProps) {
            Object.defineProperty(this, reflectedPropName, {
                get() {
                    return props[reflectedPropName] ?? null;
                },
                set(newValue) {
                    props[reflectedPropName] = newValue;
                },
                enumerable: true,
            });
        }

        Object.defineProperty(this, 'className', {
            get() {
                return props.class ?? '';
            },
            set(newVal) {
                props.class = newVal;
                attrs.class = newVal;
            },
        });
    }

    get classList() {
        if (this.__classList) {
            return this.__classList;
        }
        return (this.__classList = new ClassList(this));
    }

    getAttribute(attrName: string): string | null {
        const value = this.__attrs?.[attrName];
        return value === true ? '' : (value ?? null);
    }
}

const escapeAttrVal = (attrVal: string) =>
    attrVal.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

export function* renderAttrs(attrs: Attributes) {
    if (!attrs) {
        return;
    }
    for (const [key, val] of Object.entries(attrs)) {
        if (val) {
            if (typeof val === 'string') {
                yield ` ${key}="${escapeAttrVal(val)}"`;
            } else {
                yield ` ${key}`;
            }
        }
    }
}

export function* fallbackTmpl(
    _props: unknown,
    _attrs: unknown,
    _slotted: unknown,
    Cmp: LightningElementConstructor,
    _instance: unknown
) {
    if (Cmp.renderMode !== 'light') {
        yield '<template shadowrootmode="open"></template>';
    }
}

export type GenerateMarkupFn = (
    tagName: string,
    props: Record<string, any> | null,
    attrs: Attributes | null,
    slotted: Record<number | string, AsyncGenerator<string>> | null
) => AsyncGenerator<string>;

export async function serverSideRenderComponent(
    tagName: string,
    compiledGenerateMarkup: GenerateMarkupFn,
    props: Record<string, any>
): Promise<string> {
    let markup = '';

    for await (const segment of compiledGenerateMarkup(tagName, props, null, null)) {
        markup += segment;
    }

    return markup;
}
