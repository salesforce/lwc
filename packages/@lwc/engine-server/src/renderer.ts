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
    create,
    StringToLowerCase,
    htmlPropertyToAttribute,
    noop,
    HTML_NAMESPACE,
} from '@lwc/shared';

import {
    HostNode,
    HostElement,
    HostAttribute,
    HostNodeType,
    HostChildNode,
    HostTypeAttr,
} from './types';
import { classNameToTokenList, tokenListToClassName } from './utils/classes';

function unsupportedMethod(name: string): () => never {
    return function () {
        throw new TypeError(`"${name}" is not supported in this environment`);
    };
}

function createElement(name: string, namespace?: string): HostElement {
    return {
        [HostTypeAttr]: HostNodeType.Element,
        tagName: name,
        namespace: namespace ?? HTML_NAMESPACE,
        parent: null,
        shadowRoot: null,
        children: [],
        attributes: [],
        eventListeners: {},
    };
}

const registry: Record<string, CustomElementConstructor> = create(null);
const reverseRegistry: WeakMap<CustomElementConstructor, string> = new WeakMap();

function registerCustomElement(name: string, ctor: CustomElementConstructor) {
    if (name !== StringToLowerCase.call(name) || registry[name]) {
        throw new TypeError(`Invalid Registration`);
    }
    registry[name] = ctor;
    reverseRegistry.set(ctor, name);
}

class HTMLElementImpl {
    constructor() {
        const { constructor } = this;
        const name = reverseRegistry.get(constructor as CustomElementConstructor);
        if (!name) {
            throw new TypeError(`Invalid Construction`);
        }
        return createElement(name);
    }
}

const ssr: boolean = true;

function isHydrating(): boolean {
    return false;
}

const isNativeShadowDefined: boolean = false;
const isSyntheticShadowDefined: boolean = false;

type N = HostNode;
type E = HostElement;

function insert(node: N, parent: E, anchor: N | null) {
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
}

function remove(node: N, parent: E) {
    const nodeIndex = parent.children.indexOf(node);
    parent.children.splice(nodeIndex, 1);
}

function cloneNode(node: N): N {
    return node;
}

function createFragment(html: string): HostChildNode {
    return {
        [HostTypeAttr]: HostNodeType.Raw,
        parent: null,
        value: html,
    };
}

function createText(content: string): HostNode {
    return {
        [HostTypeAttr]: HostNodeType.Text,
        value: String(content),
        parent: null,
    };
}

function createComment(content: string): HostNode {
    return {
        [HostTypeAttr]: HostNodeType.Comment,
        value: content,
        parent: null,
    };
}

function nextSibling(node: N) {
    const { parent } = node;

    if (isNull(parent)) {
        return null;
    }

    const nodeIndex = parent.children.indexOf(node);
    return (parent.children[nodeIndex + 1] as HostNode) || null;
}

function attachShadow(element: E, config: ShadowRootInit) {
    element.shadowRoot = {
        [HostTypeAttr]: HostNodeType.ShadowRoot,
        children: [],
        mode: config.mode,
        delegatesFocus: !!config.delegatesFocus,
    };

    return element.shadowRoot as any;
}

function getProperty(node: N, key: string) {
    if (key in node) {
        return (node as any)[key];
    }

    if (node[HostTypeAttr] === HostNodeType.Element) {
        const attrName = htmlPropertyToAttribute(key);

        // Handle all the boolean properties.
        if (isBooleanAttribute(attrName, node.tagName)) {
            return getAttribute(node, attrName) ?? false;
        }

        // Handle global html attributes and AOM.
        if (isGlobalHtmlAttribute(attrName) || isAriaAttribute(attrName)) {
            return getAttribute(node, attrName);
        }

        // Handle special elements live bindings. The checked property is already handled above
        // in the boolean case.
        if (node.tagName === 'input' && key === 'value') {
            return getAttribute(node, 'value') ?? '';
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(`Unexpected "${key}" property access from the renderer`);
    }
}

function setProperty(node: N, key: string, value: any): void {
    if (key in node) {
        return ((node as any)[key] = value);
    }

    if (node[HostTypeAttr] === HostNodeType.Element) {
        const attrName = htmlPropertyToAttribute(key);

        if (key === 'innerHTML') {
            node.children = [
                {
                    [HostTypeAttr]: HostNodeType.Raw,
                    parent: node,
                    value,
                },
            ];
            return;
        }

        // Handle all the boolean properties.
        if (isBooleanAttribute(attrName, node.tagName)) {
            return value === true
                ? setAttribute(node, attrName, '')
                : removeAttribute(node, attrName);
        }

        // Handle global html attributes and AOM.
        if (isGlobalHtmlAttribute(attrName) || isAriaAttribute(attrName)) {
            return setAttribute(node, attrName, value);
        }

        // Handle special elements live bindings. The checked property is already handled above
        // in the boolean case.
        if (node.tagName === 'input' && attrName === 'value') {
            return isNull(value) || isUndefined(value)
                ? removeAttribute(node, 'value')
                : setAttribute(node, 'value', value);
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(`Unexpected attempt to set "${key}=${value}" property from the renderer`);
    }
}

function setText(node: N, content: string) {
    if (node[HostTypeAttr] === HostNodeType.Text) {
        node.value = content;
    } else if (node[HostTypeAttr] === HostNodeType.Element) {
        node.children = [
            {
                [HostTypeAttr]: HostNodeType.Text,
                parent: node,
                value: content,
            },
        ];
    }
}

function getAttribute(element: E, name: string, namespace: string | null = null) {
    const attribute = element.attributes.find(
        (attr) => attr.name === name && attr.namespace === namespace
    );
    return attribute ? attribute.value : null;
}

function setAttribute(element: E, name: string, value: string, namespace: string | null = null) {
    const attribute = element.attributes.find(
        (attr) => attr.name === name && attr.namespace === namespace
    );

    if (isUndefined(namespace)) {
        namespace = null;
    }

    if (isUndefined(attribute)) {
        element.attributes.push({
            name,
            namespace,
            value: String(value),
        });
    } else {
        attribute.value = value;
    }
}

function removeAttribute(element: E, name: string, namespace?: string | null) {
    element.attributes = element.attributes.filter(
        (attr) => attr.name !== name && attr.namespace !== namespace
    );
}

function getClassList(element: E) {
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
}

function setCSSStyleProperty(element: E, name: string, value: string, important: boolean) {
    const styleAttribute = element.attributes.find(
        (attr) => attr.name === 'style' && isNull(attr.namespace)
    );

    const serializedProperty = `${name}: ${value}${important ? ' !important' : ''}`;

    if (isUndefined(styleAttribute)) {
        element.attributes.push({
            name: 'style',
            namespace: null,
            value: serializedProperty,
        });
    } else {
        styleAttribute.value += `; ${serializedProperty}`;
    }
}

function isConnected(node: HostNode) {
    return !isNull(node.parent);
}

// Noop on SSR (for now). This need to be reevaluated whenever we will implement support for
// synthetic shadow.
const insertStylesheet = noop as (content: string, target: any) => void;

// Noop on SSR.
const addEventListener = noop as (
    target: HostNode,
    type: string,
    callback: EventListener,
    options?: AddEventListenerOptions | boolean
) => void;

// Noop on SSR.
const removeEventListener = noop as (
    target: HostNode,
    type: string,
    callback: EventListener,
    options?: AddEventListenerOptions | boolean
) => void;

const dispatchEvent = unsupportedMethod('dispatchEvent') as (target: any, event: Event) => boolean;
const getBoundingClientRect = unsupportedMethod('getBoundingClientRect') as (
    element: HostElement
) => DOMRect;
const querySelector = unsupportedMethod('querySelector') as (
    element: HostElement,
    selectors: string
) => Element | null;
const querySelectorAll = unsupportedMethod('querySelectorAll') as (
    element: HostElement,
    selectors: string
) => NodeList;
const getElementsByTagName = unsupportedMethod('getElementsByTagName') as (
    element: HostElement,
    tagNameOrWildCard: string
) => HTMLCollection;
const getElementsByClassName = unsupportedMethod('getElementsByClassName') as (
    element: HostElement,
    names: string
) => HTMLCollection;
const getChildren = unsupportedMethod('getChildren') as (element: HostElement) => HTMLCollection;
const getChildNodes = unsupportedMethod('getChildNodes') as (element: HostElement) => NodeList;
const getFirstChild = unsupportedMethod('getFirstChild') as (
    element: HostElement
) => HostNode | null;
const getFirstElementChild = unsupportedMethod('getFirstElementChild') as (
    element: HostElement
) => HostElement | null;
const getLastChild = unsupportedMethod('getLastChild') as (element: HostElement) => HostNode | null;
const getLastElementChild = unsupportedMethod('getLastElementChild') as (
    element: HostElement
) => HostElement | null;

function defineCustomElement(
    name: string,
    constructor: CustomElementConstructor,
    _options?: ElementDefinitionOptions
) {
    registerCustomElement(name, constructor);
}

function getCustomElement(name: string): CustomElementConstructor | undefined {
    return registry[name];
}

const HTMLElementExported = HTMLElementImpl as typeof HTMLElement;

/* noop */
const assertInstanceOfHTMLElement = noop as (elm: any, msg: string) => void;

export const renderer = {
    ssr,
    isNativeShadowDefined,
    isSyntheticShadowDefined,
    HTMLElementExported,
    isHydrating,
    insert,
    remove,
    cloneNode,
    createFragment,
    createElement,
    createText,
    createComment,
    nextSibling,
    attachShadow,
    getProperty,
    setProperty,
    setText,
    getAttribute,
    setAttribute,
    removeAttribute,
    addEventListener,
    removeEventListener,
    dispatchEvent,
    getClassList,
    setCSSStyleProperty,
    getBoundingClientRect,
    querySelector,
    querySelectorAll,
    getElementsByTagName,
    getElementsByClassName,
    getChildren,
    getChildNodes,
    getFirstChild,
    getFirstElementChild,
    getLastChild,
    getLastElementChild,
    isConnected,
    insertStylesheet,
    assertInstanceOfHTMLElement,
    defineCustomElement,
    getCustomElement,
};
