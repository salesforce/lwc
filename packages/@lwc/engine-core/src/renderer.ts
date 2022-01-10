/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export type HostNode = any;
export type HostElement = any;

type N = HostNode;
type E = HostElement;

//
// Primitives
//

export let ssr: boolean;
export function setSsr(ssrImpl: boolean) {
    ssr = ssrImpl;
}

export let isNativeShadowDefined: boolean;
export function setIsNativeShadowDefined(isNativeShadowDefinedImpl: boolean) {
    isNativeShadowDefined = isNativeShadowDefinedImpl;
}

export let isSyntheticShadowDefined: boolean;
export function setIsSyntheticShadowDefined(isSyntheticShadowDefinedImpl: boolean) {
    isSyntheticShadowDefined = isSyntheticShadowDefinedImpl;
}

type HTMLElementType = typeof HTMLElement;
let HTMLElementExported: HTMLElementType;
export { HTMLElementExported as HTMLElement };
export function setHTMLElement(HTMLElementImpl: HTMLElementType) {
    HTMLElementExported = HTMLElementImpl;
}

//
// Functions
//

type isHydratingFunc = () => boolean;
export let isHydrating: isHydratingFunc;
export function setIsHydrating(isHydratingImpl: isHydratingFunc) {
    isHydrating = isHydratingImpl;
}

type insertFunc = (node: N, parent: E, anchor: N | null) => void;
export let insert: insertFunc;
export function setInsert(insertImpl: insertFunc) {
    insert = insertImpl;
}

type removeFunc = (node: N, parent: E) => void;
export let remove: removeFunc;
export function setRemove(removeImpl: removeFunc) {
    remove = removeImpl;
}

type createElementFunc = (tagName: string, namespace?: string) => E;
export let createElement: createElementFunc;
export function setCreateElement(createElementImpl: createElementFunc) {
    createElement = createElementImpl;
}

type createTextFunc = (content: string) => N;
export let createText: createTextFunc;
export function setCreateText(createTextImpl: createTextFunc) {
    createText = createTextImpl;
}

type createCommentFunc = (content: string) => N;
export let createComment: createCommentFunc;
export function setCreateComment(createCommentImpl: createCommentFunc) {
    createComment = createCommentImpl;
}

type nextSiblingFunc = (node: N) => N | null;
export let nextSibling: nextSiblingFunc;
export function setNextSibling(nextSiblingImpl: nextSiblingFunc) {
    nextSibling = nextSiblingImpl;
}

type attachShadowFunc = (element: E, options: ShadowRootInit) => N;
export let attachShadow: attachShadowFunc;
export function setAttachShadow(attachShadowImpl: attachShadowFunc) {
    attachShadow = attachShadowImpl;
}

type getPropertyFunc = (node: N, key: string) => any;
export let getProperty: getPropertyFunc;
export function setGetProperty(getPropertyImpl: getPropertyFunc) {
    getProperty = getPropertyImpl;
}

type setPropertyFunc = (node: N, key: string, value: any) => void;
export let setProperty: setPropertyFunc;
export function setSetProperty(setPropertyImpl: setPropertyFunc) {
    setProperty = setPropertyImpl;
}

type setTextFunc = (node: N, content: string) => void;
export let setText: setTextFunc;
export function setSetText(setTextImpl: setTextFunc) {
    setText = setTextImpl;
}

type getAttributeFunc = (element: E, name: string, namespace?: string | null) => string | null;
export let getAttribute: getAttributeFunc;
export function setGetAttribute(getAttributeImpl: getAttributeFunc) {
    getAttribute = getAttributeImpl;
}

type setAttributeFunc = (
    element: E,
    name: string,
    value: string,
    namespace?: string | null
) => void;
export let setAttribute: setAttributeFunc;
export function setSetAttribute(setAttributeImpl: setAttributeFunc) {
    setAttribute = setAttributeImpl;
}

type removeAttributeFunc = (element: E, name: string, namespace?: string | null) => void;
export let removeAttribute: removeAttributeFunc;
export function setRemoveAttribute(removeAttributeImpl: removeAttributeFunc) {
    removeAttribute = removeAttributeImpl;
}

type addEventListenerFunc = (
    target: N,
    type: string,
    callback: (event: Event) => any,
    options?: AddEventListenerOptions | boolean
) => void;
export let addEventListener: addEventListenerFunc;
export function setAddEventListener(addEventListenerImpl: addEventListenerFunc) {
    addEventListener = addEventListenerImpl;
}

type removeEventListenerFunc = (
    target: N,
    type: string,
    callback: (event: Event) => any,
    options?: EventListenerOptions | boolean
) => void;
export let removeEventListener: removeEventListenerFunc;
export function setRemoveEventListener(removeEventListenerImpl: removeEventListenerFunc) {
    removeEventListener = removeEventListenerImpl;
}

type dispatchEventFunc = (target: N, event: Event) => boolean;
export let dispatchEvent: dispatchEventFunc;
export function setDispatchEvent(dispatchEventImpl: dispatchEventFunc) {
    dispatchEvent = dispatchEventImpl;
}

type getClassListFunc = (element: E) => DOMTokenList;
export let getClassList: getClassListFunc;
export function setGetClassList(getClassListImpl: getClassListFunc) {
    getClassList = getClassListImpl;
}

type setCSSStylePropertyFunc = (
    element: E,
    name: string,
    value: string,
    important: boolean
) => void;
export let setCSSStyleProperty: setCSSStylePropertyFunc;
export function setSetCSSStyleProperty(setCSSStylePropertyImpl: setCSSStylePropertyFunc) {
    setCSSStyleProperty = setCSSStylePropertyImpl;
}

type getBoundingClientRectFunc = (element: E) => ClientRect;
export let getBoundingClientRect: getBoundingClientRectFunc;
export function setGetBoundingClientRect(getBoundingClientRectImpl: getBoundingClientRectFunc) {
    getBoundingClientRect = getBoundingClientRectImpl;
}

type querySelectorFunc = (element: E, selectors: string) => E | null;
export let querySelector: querySelectorFunc;
export function setQuerySelector(querySelectorImpl: querySelectorFunc) {
    querySelector = querySelectorImpl;
}

type querySelectorAllFunc = (element: E, selectors: string) => NodeList;
export let querySelectorAll: querySelectorAllFunc;
export function setQuerySelectorAll(querySelectorAllImpl: querySelectorAllFunc) {
    querySelectorAll = querySelectorAllImpl;
}

type getElementsByTagNameFunc = (element: E, tagNameOrWildCard: string) => HTMLCollection;
export let getElementsByTagName: getElementsByTagNameFunc;
export function setGetElementsByTagName(getElementsByTagNameImpl: getElementsByTagNameFunc) {
    getElementsByTagName = getElementsByTagNameImpl;
}

type getElementsByClassNameFunc = (element: E, names: string) => HTMLCollection;
export let getElementsByClassName: getElementsByClassNameFunc;
export function setGetElementsByClassName(getElementsByClassNameImpl: getElementsByClassNameFunc) {
    getElementsByClassName = getElementsByClassNameImpl;
}

type getChildrenFunc = (element: E) => HTMLCollection;
export let getChildren: getChildrenFunc;
export function setGetChildren(getChildrenImpl: getChildrenFunc) {
    getChildren = getChildrenImpl;
}

type getChildNodesFunc = (element: E) => NodeList;
export let getChildNodes: getChildNodesFunc;
export function setGetChildNodes(getChildNodesImpl: getChildNodesFunc) {
    getChildNodes = getChildNodesImpl;
}

type getFirstChildFunc = (element: E) => N | null;
export let getFirstChild: getFirstChildFunc;
export function setGetFirstChild(getFirstChildImpl: getFirstChildFunc) {
    getFirstChild = getFirstChildImpl;
}

type getFirstElementChildFunc = (element: E) => E | null;
export let getFirstElementChild: getFirstElementChildFunc;
export function setGetFirstElementChild(getFirstElementChildImpl: getFirstElementChildFunc) {
    getFirstElementChild = getFirstElementChildImpl;
}

type getLastChildFunc = (element: E) => N | null;
export let getLastChild: getLastChildFunc;
export function setGetLastChild(getLastChildImpl: getLastChildFunc) {
    getLastChild = getLastChildImpl;
}

type getLastElementChildFunc = (element: E) => E | null;
export let getLastElementChild: getLastElementChildFunc;
export function setGetLastElementChild(getLastElementChildImpl: getLastElementChildFunc) {
    getLastElementChild = getLastElementChildImpl;
}

type isConnectedFunc = (node: N) => boolean;
export let isConnected: isConnectedFunc;
export function setIsConnected(isConnectedImpl: isConnectedFunc) {
    isConnected = isConnectedImpl;
}

type insertGlobalStylesheetFunc = (content: string) => void;
export let insertGlobalStylesheet: insertGlobalStylesheetFunc;
export function setInsertGlobalStylesheet(insertGlobalStylesheetImpl: insertGlobalStylesheetFunc) {
    insertGlobalStylesheet = insertGlobalStylesheetImpl;
}

type insertStylesheetFunc = (content: string, target: N) => void;
export let insertStylesheet: insertStylesheetFunc;
export function setInsertStylesheet(insertStylesheetImpl: insertStylesheetFunc) {
    insertStylesheet = insertStylesheetImpl;
}

type assertInstanceOfHTMLElementFunc = (elm: any, msg: string) => void;
export let assertInstanceOfHTMLElement: assertInstanceOfHTMLElementFunc;
export function setAssertInstanceOfHTMLElement(
    assertInstanceOfHTMLElementImpl: assertInstanceOfHTMLElementFunc
) {
    assertInstanceOfHTMLElement = assertInstanceOfHTMLElementImpl;
}

type defineCustomElementFunc = (
    name: string,
    constructor: CustomElementConstructor,
    options?: ElementDefinitionOptions
) => void;
export let defineCustomElement: defineCustomElementFunc;
export function setDefineCustomElement(defineCustomElementImpl: defineCustomElementFunc) {
    defineCustomElement = defineCustomElementImpl;
}

type getCustomElementFunc = (name: string) => CustomElementConstructor | undefined;
export let getCustomElement: getCustomElementFunc;
export function setGetCustomElement(getCustomElementImpl: getCustomElementFunc) {
    getCustomElement = getCustomElementImpl;
}
