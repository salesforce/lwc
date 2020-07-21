/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    isUndefined,
    isNull,
    isBooleanAttribute,
    isGlobalHtmlAttribute,
    isAriaAttribute,
} from '@lwc/shared';
import { Renderer, getAttrNameFromPropName } from '@lwc/engine-core';

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

export const renderer: Renderer<HostNode, HostElement> = {
    ssr: true,
    syntheticShadow: false,

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

    createElement,

    createText(content: string): HostNode {
        return {
            type: HostNodeType.Text,
            value: String(content),
            parent: null,
        };
    },

    nextSibling(node) {
        const { parent } = node;

        if (isNull(parent)) {
            return null;
        }

        const nodeIndex = parent.children.indexOf(node);
        return parent.children[nodeIndex + 1] || null;
    },

    attachShadow(element, config) {
        element.shadowRoot = {
            type: HostNodeType.ShadowRoot,
            children: [],
            mode: config.mode,
            delegatesFocus: !!config.delegatesFocus,
        };

        return (element.shadowRoot as any) as HostNode;
    },

    getProperty(node, key) {
        if (key in node) {
            return (node as any)[key];
        }

        if (node.type === HostNodeType.Element) {
            const attrName = getAttrNameFromPropName(key);

            // Handle all the boolean properties.
            if (isBooleanAttribute(attrName, node.name)) {
                return this.getAttribute(node, attrName) ?? false;
            }

            // Handle global html attributes and AOM.
            if (isGlobalHtmlAttribute(attrName) || isAriaAttribute(attrName)) {
                return this.getAttribute(node, attrName);
            }

            // Handle special elements live bindings. The checked property is already handled above
            // in the boolean case.
            if (node.name === 'input' && key === 'value') {
                return this.getAttribute(node, 'value') ?? '';
            }
        }

        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.error(`Unexpected "${key}" property access from the renderer`);
        }
    },

    setProperty(node, key, value): void {
        if (key in node) {
            return ((node as any)[key] = value);
        }

        if (node.type === HostNodeType.Element) {
            const attrName = getAttrNameFromPropName(key);

            // Handle all the boolean properties.
            if (isBooleanAttribute(attrName, node.name)) {
                return value === true
                    ? this.setAttribute(node, attrName, '')
                    : this.removeAttribute(node, attrName);
            }

            // Handle global html attributes and AOM.
            if (isGlobalHtmlAttribute(attrName) || isAriaAttribute(attrName)) {
                return this.setAttribute(node, attrName, value);
            }

            // Handle special elements live bindings. The checked property is already handled above
            // in the boolean case.
            if (node.name === 'input' && attrName === 'value') {
                return isNull(value) || isUndefined(value)
                    ? this.removeAttribute(node, 'value')
                    : this.setAttribute(node, 'value', value);
            }
        }

        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.error(`Unexpected attempt to set "${key}=${value}" property from the renderer`);
        }
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
                get(target, property): string {
                    let value: string;

                    const styleAttribute = getStyleAttribute();
                    if (isUndefined(styleAttribute)) {
                        return '';
                    }

                    if (property === 'cssText') {
                        value = styleAttribute.value;
                    } else {
                        const cssDeclaration = styleTextToCssDeclaration(styleAttribute.value);
                        value = cssDeclaration[property as string] || '';
                    }

                    return value;
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

                    if (property === 'cssText') {
                        styleAttribute.value = value;
                    } else {
                        const cssDeclaration = styleTextToCssDeclaration(styleAttribute.value);
                        cssDeclaration[property as string] = value;
                        styleAttribute.value = cssDeclarationToStyleText(cssDeclaration);
                    }

                    return value;
                },
            }
        ) as CSSStyleDeclaration;
    },

    isConnected(node: HostNode) {
        return !isNull(node.parent);
    },

    insertGlobalStylesheet() {
        // Noop on SSR (for now). This need to be reevaluated whenever we will implement support for
        // synthetic shadow.
    },

    addEventListener() {
        // Noop on SSR.
    },
    removeEventListener() {
        // Noop on SSR.
    },

    dispatchEvent: unsupportedMethod('dispatchEvent'),
    getBoundingClientRect: unsupportedMethod('getBoundingClientRect'),
    querySelector: unsupportedMethod('querySelector'),
    querySelectorAll: unsupportedMethod('querySelectorAll'),
    getElementsByTagName: unsupportedMethod('getElementsByTagName'),
    getElementsByClassName: unsupportedMethod('getElementsByClassName'),
};
