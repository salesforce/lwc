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
    htmlPropertyToAttribute,
    noop,
    isFunction,
} from '@lwc/shared';

import { HostNode, HostElement, HostAttribute, HostNodeType, HostChildNode } from './types';
import { classNameToTokenList, tokenListToClassName } from './utils/classes';

function unsupportedMethod(name: string): () => never {
    return function () {
        throw new TypeError(`"${name}" is not supported in this environment`);
    };
}

function createElement(name: string): HostElement {
    return {
        type: HostNodeType.Element,
        name,
        parent: null,
        shadowRoot: null,
        children: [],
        attributes: [],
        eventListeners: {},
    };
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
        type: HostNodeType.Raw,
        parent: null,
        value: html,
    };
}

function createText(content: string): HostNode {
    return {
        type: HostNodeType.Text,
        value: String(content),
        parent: null,
    };
}

function createComment(content: string): HostNode {
    return {
        type: HostNodeType.Comment,
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
        type: HostNodeType.ShadowRoot,
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

    if (node.type === HostNodeType.Element) {
        const attrName = htmlPropertyToAttribute(key);

        // Handle all the boolean properties.
        if (isBooleanAttribute(attrName, node.name)) {
            return getAttribute(node, attrName) ?? false;
        }

        // Handle global html attributes and AOM.
        if (isGlobalHtmlAttribute(attrName) || isAriaAttribute(attrName)) {
            return getAttribute(node, attrName);
        }

        // Handle special elements live bindings. The checked property is already handled above
        // in the boolean case.
        if (node.name === 'input' && key === 'value') {
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

    if (node.type === HostNodeType.Element) {
        const attrName = htmlPropertyToAttribute(key);

        if (key === 'innerHTML') {
            node.children = [
                {
                    type: HostNodeType.Raw,
                    parent: node,
                    value,
                },
            ];
            return;
        }

        // Handle all the boolean properties.
        if (isBooleanAttribute(attrName, node.name)) {
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
        if (node.name === 'input' && attrName === 'value') {
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

/* noop */
const assertInstanceOfHTMLElement = noop as (elm: any, msg: string) => void;

type UpgradeCallback = (elm: HostElement) => void;
type CreateElementAndUpgrade = (upgradeCallback: UpgradeCallback) => HostElement;

const localRegistryRecord: Map<string, CreateElementAndUpgrade> = new Map();

function createUpgradableElementConstructor(tagName: string) {
    return function Ctor(upgradeCallback: UpgradeCallback) {
        const elm = createElement(tagName);
        if (isFunction(upgradeCallback)) {
            upgradeCallback(elm); // nothing to do with the result for now
        }
        return elm;
    };
}

function getUpgradableElement(tagName: string): CreateElementAndUpgrade {
    let ctor = localRegistryRecord.get(tagName);
    if (!isUndefined(ctor)) {
        return ctor;
    }

    ctor = createUpgradableElementConstructor(tagName);
    localRegistryRecord.set(tagName, ctor);
    return ctor;
}

function defineCustomElement(tagName: string, upgradeCallback: UpgradeCallback): HostElement {
    const UpgradableConstructor = getUpgradableElement(tagName);
    // @ts-ignore
    return new UpgradableConstructor(upgradeCallback);
}

export const renderer = {
    ssr,
    isNativeShadowDefined,
    isSyntheticShadowDefined,
    isHydrating,
    insert,
    remove,
    cloneNode,
    createFragment,
    createElement,
    createText,
    createComment,
    defineCustomElement,
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
};
