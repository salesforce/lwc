/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, isNull } from '@lwc/shared';
import { Renderer } from '@lwc/engine-core';

import { HostNode, HostElement, HostAttribute, HostNodeType } from './types';
import { classNameToTokenList, tokenListToClassName } from './utils/classes';
import { styleTextToCssDeclaration, cssDeclarationToStyleText } from './utils/style';

function unsupportedMethod(name: string): () => never {
    return function () {
        throw new TypeError(`"${name}" is not supported in this environment`);
    };
}

function createElement(name: string, namespace?: string): HostElement {
    return {
        type: HostNodeType.Element,
        name,
        namespace,
        parent: null,
        shadowRoot: null,
        children: [],
        attributes: [],
        eventListeners: {},
    };
}

function createText(content: string): HostNode {
    return {
        type: HostNodeType.Text,
        value: content,
        parent: null,
    };
}

export const renderer: Renderer<HostNode, HostElement> = {
    syntheticShadow: false,

    tagName(element) {
        return element.name;
    },

    nextSibling() {
        // Implement this...
        return null;
    },

    createText,
    createElement,

    insert(node, parent, anchor) {
        if (node.parent !== null && node.parent !== parent) {
            const nodeIndex = node.parent.children.indexOf(node);
            node.parent.children.splice(nodeIndex, 1);
        }

        node.parent = parent;

        const anchorIndex = isNull(anchor) ? -1 : parent.children.indexOf(anchor);
        if (anchorIndex === -1) {
            parent.children.push(node);
        } else {
            parent.children.splice(anchorIndex, 0, node);
        }
    },

    remove(node, parent) {
        const nodeIndex = parent.children.indexOf(node);
        parent.children.splice(nodeIndex, 1);
    },

    attachShadow(element) {
        element.shadowRoot = {
            type: HostNodeType.ShadowRoot,
            children: [],
        };

        // TODO [#0]: Fix typings here.
        return (element.shadowRoot as any) as HostNode;
    },

    setText(node, content) {
        if (node.type === HostNodeType.Text) {
            node.value = content;
        } else if (node.type === HostNodeType.Element) {
            node.children = [
                {
                    type: HostNodeType.Text,
                    parent: node,
                    value: content,
                },
            ];
        }
    },

    getAttribute(element, name, namespace = null) {
        const attribute = element.attributes.find(
            (attr) => attr.name === name && attr.namespace === namespace
        );
        return attribute ? attribute.value : null;
    },

    setAttribute(element, name, value, namespace = null) {
        const attribute = element.attributes.find(
            (attr) => attr.name === name && attr.namespace === namespace
        );

        if (isUndefined(attribute)) {
            element.attributes.push({
                name,
                namespace,
                value: String(value),
            });
        } else {
            attribute.value = value;
        }
    },

    removeAttribute(element, name, namespace) {
        element.attributes = element.attributes.filter(
            (attr) => attr.name !== name && attr.namespace !== namespace
        );
    },

    getClassList(element) {
        function getClassAttribute(): HostAttribute {
            let classAttribute = element.attributes.find(
                (attr) => attr.name === 'class' && isNull(attr.namespace)
            );

            if (isUndefined(classAttribute)) {
                classAttribute = {
                    name: 'class',
                    namespace: null,
                    value: '',
                };
                element.attributes.push(classAttribute);
            }

            return classAttribute;
        }

        return {
            add(...names: string[]): void {
                const classAttribute = getClassAttribute();

                const tokenList = classNameToTokenList(classAttribute.value);
                names.forEach((name) => tokenList.add(name));
                classAttribute.value = tokenListToClassName(tokenList);
            },
            remove(...names: string[]): void {
                const classAttribute = getClassAttribute();

                const tokenList = classNameToTokenList(classAttribute.value);
                names.forEach((name) => tokenList.delete(name));
                classAttribute.value = tokenListToClassName(tokenList);
            },
        } as DOMTokenList;
    },

    getStyleDeclaration(element) {
        function getStyleAttribute(): HostAttribute | undefined {
            return element.attributes.find(
                (attr) => attr.name === 'style' && isNull(attr.namespace)
            );
        }

        return new Proxy(
            {},
            {
                get(target, property) {
                    const styleAttribute = getStyleAttribute();
                    if (isUndefined(styleAttribute)) {
                        return '';
                    }

                    const cssDeclaration = styleTextToCssDeclaration(styleAttribute.value);
                    return cssDeclaration[property as string] || '';
                },
                set(target, property, value) {
                    let styleAttribute = getStyleAttribute();

                    if (isUndefined(styleAttribute)) {
                        styleAttribute = {
                            name: 'style',
                            namespace: null,
                            value: '',
                        };
                        element.attributes.push(styleAttribute);
                    }

                    const cssDeclaration = styleTextToCssDeclaration(styleAttribute.value);
                    cssDeclaration[property as string] = value;
                    styleAttribute.value = cssDeclarationToStyleText(cssDeclaration);

                    return value;
                },
            }
        ) as CSSStyleDeclaration;
    },

    isConnected() {
        return true;
    },

    addEventListener() {
        /* Noop on SSR */
    },
    removeEventListener() {
        /* Noop on SSR */
    },

    dispatchEvent: unsupportedMethod('dispatchEvent'),
    getBoundingClientRect: unsupportedMethod('getBoundingClientRect'),
    querySelector: unsupportedMethod('querySelector'),
    querySelectorAll: unsupportedMethod('querySelectorAll'),
    getElementsByTagName: unsupportedMethod('getElementsByTagName'),
    getElementsByClassName: unsupportedMethod('getElementsByClassName'),
};
