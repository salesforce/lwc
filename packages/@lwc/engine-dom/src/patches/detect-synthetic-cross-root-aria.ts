/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    assign,
    globalThis,
    isUndefined,
    isTrue,
    KEY__NATIVE_GET_ELEMENT_BY_ID,
    isNull,
} from '@lwc/shared';

const { setAttribute } = Element.prototype;

// These attributes take either an ID or a list of IDs as values.
export const ID_REFERENCING_ATTRIBUTES_SET: Set<string> = new Set([
    'aria-activedescendant',
    'aria-controls',
    'aria-describedby',
    'aria-details',
    'aria-errormessage',
    'aria-flowto',
    'aria-labelledby',
    'aria-owns',
    'for',
]);

function isSyntheticShadowRootInstance(shadowRoot: Node | undefined): shadowRoot is ShadowRoot {
    return !isUndefined(shadowRoot) && isTrue((shadowRoot as any).synthetic);
}

function detectCrossRootAria(elm: Element, attrName: string, attrValue: string, root: ShadowRoot) {
    const getElementById = globalThis[
        KEY__NATIVE_GET_ELEMENT_BY_ID
    ] as typeof document.getElementById;

    const ids = attrValue.replace(/^\s+/g, '').replace(/\s+$/g, '').split(/\s+/);
    for (const id of ids) {
        const target = getElementById.call(document, id);
        if (!isNull(target)) {
            // FIXME: the shadow root could contain multiple elements with the same ID,
            // or there could be an element in one root with the same ID as one in this root
            if (!root.contains(target)) {
                // eslint-disable-next-line no-console
                console.error(
                    `Element <${elm.tagName.toLowerCase()}> is using attribute "${attrName}" to reference element ` +
                        `<${target.tagName.toLowerCase()}>, which is not in the same shadow root. This will break in native shadow DOM.`
                );
            }
        }
    }
}

if (process.env.NODE_ENV !== 'production') {
    assign(Element.prototype, {
        // FIXME: detect aria properties
        // FIXME: detect setting ID via prop or attr
        setAttribute(this: Element, attrName: string, attrValue: any) {
            setAttribute.call(this, attrName, attrValue);
            if (ID_REFERENCING_ATTRIBUTES_SET.has(attrName)) {
                const root = this.getRootNode();
                if (isSyntheticShadowRootInstance(root)) {
                    detectCrossRootAria(this, attrName, attrValue, root);
                }
            }
        },
    } as Pick<Element, 'setAttribute'>);
}
