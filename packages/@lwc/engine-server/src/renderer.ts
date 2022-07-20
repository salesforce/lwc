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
    HostTypeKey,
    HostNamespaceKey,
    HostParentKey,
    HostEventListenersKey,
    HostShadowRootKey,
    HostAttributesKey,
    HostChildrenKey,
    HostValueKey,
} from './types';
import { classNameToTokenList, tokenListToClassName } from './utils/classes';

function unsupportedMethod(name: string): () => never {
    return function () {
        throw new TypeError(`"${name}" is not supported in this environment`);
    };
}

function createElement(tagName: string, namespace?: string): HostElement {
    return {
        [HostTypeKey]: HostNodeType.Element,
        tagName,
        [HostNamespaceKey]: namespace ?? HTML_NAMESPACE,
        [HostParentKey]: null,
        [HostShadowRootKey]: null,
        [HostChildrenKey]: [],
        [HostAttributesKey]: [],
        [HostEventListenersKey]: {},
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
        const tagName = reverseRegistry.get(constructor as CustomElementConstructor);
        if (!tagName) {
            throw new TypeError(`Invalid Construction`);
        }
        return createElement(tagName);
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
    const nodeParent = node[HostParentKey];
    if (nodeParent !== null && nodeParent !== parent) {
        const nodeIndex = nodeParent[HostChildrenKey].indexOf(node);
        nodeParent[HostChildrenKey].splice(nodeIndex, 1);
    }

    node[HostParentKey] = parent;

    const anchorIndex = isNull(anchor) ? -1 : parent[HostChildrenKey].indexOf(anchor);
    if (anchorIndex === -1) {
        parent[HostChildrenKey].push(node);
    } else {
        parent[HostChildrenKey].splice(anchorIndex, 0, node);
    }
}

function remove(node: N, parent: E) {
    const nodeIndex = parent[HostChildrenKey].indexOf(node);
    parent[HostChildrenKey].splice(nodeIndex, 1);
}

function cloneNode(node: N): N {
    return node;
}

function createFragment(html: string): HostChildNode {
    return {
        [HostTypeKey]: HostNodeType.Raw,
        [HostParentKey]: null,
        [HostValueKey]: html,
    };
}

function createText(content: string): HostNode {
    return {
        [HostTypeKey]: HostNodeType.Text,
        [HostValueKey]: String(content),
        [HostParentKey]: null,
    };
}

function createComment(content: string): HostNode {
    return {
        [HostTypeKey]: HostNodeType.Comment,
        [HostValueKey]: content,
        [HostParentKey]: null,
    };
}

function nextSibling(node: N) {
    const parent = node[HostParentKey];

    if (isNull(parent)) {
        return null;
    }

    const nodeIndex = parent[HostChildrenKey].indexOf(node);
    return (parent[HostChildrenKey][nodeIndex + 1] as HostNode) || null;
}

function attachShadow(element: E, config: ShadowRootInit) {
    element[HostShadowRootKey] = {
        [HostTypeKey]: HostNodeType.ShadowRoot,
        [HostChildrenKey]: [],
        mode: config.mode,
        delegatesFocus: !!config.delegatesFocus,
    };

    return element[HostShadowRootKey] as any;
}

function getProperty(node: N, key: string) {
    if (key in node) {
        return (node as any)[key];
    }

    if (node[HostTypeKey] === HostNodeType.Element) {
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

    if (node[HostTypeKey] === HostNodeType.Element) {
        const attrName = htmlPropertyToAttribute(key);

        if (key === 'innerHTML') {
            node[HostChildrenKey] = [
                {
                    [HostTypeKey]: HostNodeType.Raw,
                    [HostParentKey]: node,
                    [HostValueKey]: value,
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
    if (node[HostTypeKey] === HostNodeType.Text) {
        node[HostValueKey] = content;
    } else if (node[HostTypeKey] === HostNodeType.Element) {
        node[HostChildrenKey] = [
            {
                [HostTypeKey]: HostNodeType.Text,
                [HostParentKey]: node,
                [HostValueKey]: content,
            },
        ];
    }
}

function getAttribute(element: E, name: string, namespace: string | null = null) {
    const attribute = element[HostAttributesKey].find(
        (attr) => attr.name === name && attr[HostNamespaceKey] === namespace
    );
    return attribute ? attribute.value : null;
}

function setAttribute(element: E, name: string, value: string, namespace: string | null = null) {
    const attribute = element[HostAttributesKey].find(
        (attr) => attr.name === name && attr[HostNamespaceKey] === namespace
    );

    if (isUndefined(namespace)) {
        namespace = null;
    }

    if (isUndefined(attribute)) {
        element[HostAttributesKey].push({
            name,
            [HostNamespaceKey]: namespace,
            value: String(value),
        });
    } else {
        attribute.value = value;
    }
}

function removeAttribute(element: E, name: string, namespace?: string | null) {
    element[HostAttributesKey] = element[HostAttributesKey].filter(
        (attr) => attr.name !== name && attr[HostNamespaceKey] !== namespace
    );
}

function getClassList(element: E) {
    function getClassAttribute(): HostAttribute {
        let classAttribute = element[HostAttributesKey].find(
            (attr) => attr.name === 'class' && isNull(attr[HostNamespaceKey])
        );

        if (isUndefined(classAttribute)) {
            classAttribute = {
                name: 'class',
                [HostNamespaceKey]: null,
                value: '',
            };
            element[HostAttributesKey].push(classAttribute);
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
    const styleAttribute = element[HostAttributesKey].find(
        (attr) => attr.name === 'style' && isNull(attr[HostNamespaceKey])
    );

    const serializedProperty = `${name}: ${value}${important ? ' !important' : ''}`;

    if (isUndefined(styleAttribute)) {
        element[HostAttributesKey].push({
            name: 'style',
            [HostNamespaceKey]: null,
            value: serializedProperty,
        });
    } else {
        styleAttribute.value += `; ${serializedProperty}`;
    }
}

function isConnected(node: HostNode) {
    return !isNull(node[HostParentKey]);
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
