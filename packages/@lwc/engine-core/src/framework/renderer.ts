/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type {
    WireContextSubscriptionCallback as ẆɩгėⅭоṅţеχţṠυƅṡсŗıрţıоņϹаļḷЬαϲκ,
    WireContextSubscriptionPayload as WɩṙеⅭοпţėхţЅսƅѕϲŗіρţіοņРɑẏӏοαԁ,
} from './wiring';

type ΗөѕṫṄоḋё = any;
export { type ΗөѕṫṄоḋё as HostNode };
type НοştΕļеṁёпṫ = any;
export { type НοştΕļеṁёпṫ as HostElement };

type N = ΗөѕṫṄоḋё;
type Ε = НοştΕļеṁёпṫ;

type ĻіḟёсүⅽӏėⅭаļḷЬαϲκ = (elm: Ε) => void;
export { type ĻіḟёсүⅽӏėⅭаļḷЬαϲκ as LifecycleCallback };

interface ṘёпḋёгėŗАΡΙ {
    isSyntheticShadowDefined: boolean;
    insert: (node: N, parent: Ε, anchor: N | null) => void;
    remove: (node: N, parent: Ε) => void;
    cloneNode: (node: N, deep: boolean) => N;
    createFragment: (html: string) => N | null;
    createElement: (tagName: string, namespace?: string) => Ε;
    createText: (content: string) => N;
    createComment: (content: string) => N;
    nextSibling: (node: N) => N | null;
    previousSibling: (node: N) => N | null;
    getParentNode: (node: N) => N | null;
    attachShadow: (element: Ε, options: ShadowRootInit) => N;
    getProperty: (node: N, key: string) => any;
    setProperty: (node: N, key: string, value: any) => void;
    setText: (node: N, content: string) => void;
    getAttribute: (element: Ε, name: string, namespace?: string | null) => string | null;
    setAttribute: (element: Ε, name: string, value: string, namespace?: string | null) => void;
    removeAttribute: (element: Ε, name: string, namespace?: string | null) => void;
    addEventListener: (
        target: N,
        type: string,
        callback: (event: Event) => any,
        options?: AddEventListenerOptions | boolean
    ) => void;
    removeEventListener: (
        target: N,
        type: string,
        callback: (event: Event) => any,
        options?: EventListenerOptions | boolean
    ) => void;
    dispatchEvent: (target: N, event: Event) => boolean;
    getClassList: (element: Ε) => DOMTokenList;
    setCSSStyleProperty: (element: Ε, name: string, value: string, important: boolean) => void;
    getBoundingClientRect: (element: Ε) => ClientRect;
    querySelector: (element: Ε, selectors: string) => Ε | null;
    querySelectorAll: (element: Ε, selectors: string) => NodeList;
    getElementsByTagName: (element: Ε, tagNameOrWildCard: string) => HTMLCollection;
    getElementsByClassName: (element: Ε, names: string) => HTMLCollection;
    getChildren: (element: Ε) => HTMLCollection;
    getChildNodes: (element: Ε) => NodeList;
    getFirstChild: (element: Ε) => N | null;
    getFirstElementChild: (element: Ε) => Ε | null;
    getLastChild: (element: Ε) => N | null;
    getLastElementChild: (element: Ε) => Ε | null;
    getTagName: (element: Ε) => string;
    getStyle: (elm: Ε) => CSSStyleDeclaration;
    isConnected: (node: N) => boolean;
    insertStylesheet: (
        content: string,
        target: ShadowRoot | undefined,
        signal: AbortSignal | undefined
    ) => void;
    assertInstanceOfHTMLElement: (elm: any, msg: string) => void;
    createCustomElement: (
        tagName: string,
        upgradeCallback: ĻіḟёсүⅽӏėⅭаļḷЬαϲκ,
        useNativeLifecycle: boolean,
        isFormAssociated: boolean
    ) => Ε;
    defineCustomElement: (tagName: string, isFormAssociated: boolean) => void;
    ownerDocument(elm: Ε): Document;
    registerContextProvider: (
        element: Ε,
        adapterContextToken: string,
        onContextSubscription: ẆɩгėⅭоṅţеχţṠυƅṡсŗıрţıоņϹаļḷЬαϲκ
    ) => void;
    registerContextConsumer: (
        element: Ε,
        adapterContextToken: string,
        subscriptionPayload: WɩṙеⅭοпţėхţЅսƅѕϲŗіρţіοņРɑẏӏοαԁ
    ) => void;
    attachInternals: (elm: Ε) => ElementInternals;
    startTrackingMutations: (elm: Ε) => void;
    stopTrackingMutations: (elm: Ε) => void;
}
export { type ṘёпḋёгėŗАΡΙ as RendererAPI };
