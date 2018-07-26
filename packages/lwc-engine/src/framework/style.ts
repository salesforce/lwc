import assert from "../shared/assert";
import * as api from "./api";
import { isFunction, isUndefined, create } from "../shared/language";
import { VNode } from "../3rdparty/snabbdom/types";
import { EmptyArray } from "./utils";
import { VM } from "./vm";
import { removeAttribute, setAttribute } from "./dom-api";

export interface StyleFunction {
    /**
     * function that produces the CSS associated to the HTML if any.
     * This function will be invoked by the engine with different values depending
     * on the mode that the component is running on.
     */
    (hostSelector: string, shadowSelector: string): string;

    /**
     * HTML attribute that need to be applied to the host element.
     * This attribute is used for the `:host` pseudo class CSS selector.
     */
    hostToken: string;

    /**
     * HTML attribute that need to the applied to all the element that the template produces.
     * This attribute is used for style encapsulation when the engine runs in fallback mode.
     */
    shadowToken: string;
}

const {
    createElement,
    createDocumentFragment,
} = document;
const {
    appendChild,
} = Node.prototype;

const CachedStyleFragments: Record<string, DocumentFragment> = create(null);

function createStyleElement(styleContent: string): Element {
    const elm = createElement.call(document, 'style');
    elm.type = 'text/css';
    elm.textContent = styleContent;
    return elm;
}

function getCachedStyleElement(styleContent: string): Element {
    let fragment = CachedStyleFragments[styleContent];
    if (isUndefined(fragment)) {
        fragment = createDocumentFragment.call(document);
        const elm = createStyleElement(styleContent);
        appendChild.call(fragment, elm);
        CachedStyleFragments[styleContent] = fragment;
    }
    return fragment.cloneNode(true).firstChild as Element;
}

const globalStyleParent = document.head || document.body || document;
const InsertedGlobalStyleContent: Record<string, true> = create(null);

function insertGlobalStyle(styleContent: string) {
    // inserts the global style when needed, otherwise does nothing
    if (isUndefined(InsertedGlobalStyleContent[styleContent])) {
        InsertedGlobalStyleContent[styleContent] = true;
        const elm = createStyleElement(styleContent);
        appendChild.call(globalStyleParent, elm);
    }
}

function createStyleVNode() {
    return api.h('style', {
        key: 'style' // special key
    }, EmptyArray);
}

/**
 * Reset the styling token applied to the host element.
 */
export function resetStyleTokens(vm: VM): void {
    const { context, elm } = vm;

    const oldToken = context.hostToken;

    // Remove the token currently applied to the host element if different than the one associated
    // with the current template
    if (!isUndefined(oldToken)) {
        removeAttribute.call(elm, oldToken);
    }
    context.hostToken = context.shadowToken = undefined;
}

/**
 * Apply/Update the styling token applied to the host element.
 */
export function applyStyleTokens(vm: VM, html: StyleFunction): void {
    const { context, elm } = vm;

    const newToken = html.hostToken;

    // If the template has a token apply the token to the host element
    if (!isUndefined(newToken)) {
        setAttribute.call(elm, newToken, '');
    }
    context.hostToken = html.hostToken;
    context.shadowToken = html.shadowToken;
}

export function evaluateCSS(vm: VM, style: StyleFunction): VNode | null {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.isTrue(isFunction(style), `Invalid style function.`);
    }
    const vnode = createStyleVNode();
    const { fallback } = vm;
    if (fallback) {
        const { hostToken, shadowToken } = style;
        const hostSelector = `[${hostToken}]`;
        const shadowSelector = `[${shadowToken}]`;
        const globalStyleContent = style(hostSelector, shadowSelector);
        insertGlobalStyle(globalStyleContent);
        // inserting a placeholder for <style> to guarantee that native vs
        // synthetic shadow markup is identical
        vnode.elm = getCachedStyleElement(process.env.NODE_ENV !== 'production' ? `/* synthetic style for component ${shadowSelector} */` : '');
    } else {
        // native shadow in place, we need to act accordingly by using the `:host`
        // selector, and an empty shadow selector since it is not really needed
        const textContent = style(':host', '');
        vnode.elm = getCachedStyleElement(textContent);
    }
    return vnode;
}
