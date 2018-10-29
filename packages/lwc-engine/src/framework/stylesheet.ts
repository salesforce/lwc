import assert from "../shared/assert";
import { isString, isFunction, isUndefined, create, emptyString, isArray } from "../shared/language";
import { VNode } from "../3rdparty/snabbdom/types";

import * as api from "./api";
import { EmptyArray } from "./utils";
import { VM } from "./vm";
import { removeAttribute, setAttribute } from "./dom-api";
/**
 * Function producing style based on a host and a shadow selector. This function is invoked by
 * the engine with different values depending on the mode that the component is running on.
 */
type StyleFactory = (hostSelector: string, shadowSelector: string, nativeShadow: boolean) => string;

export interface Stylesheet {
    /**
     * The factory associated with the stylesheet.
     */
    stylesheets: StyleFactory[];

    /**
     * HTML attribute that need to be applied to the host element. This attribute is used for the
     * `:host` pseudo class CSS selector.
     */
    hostAttribute: string;

    /**
     * HTML attribute that need to the applied to all the element that the template produces.
     * This attribute is used for style encapsulation when the engine runs in fallback mode.
     */
    shadowAttribute: string;
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

function getCachedStyleElement(styleContent: string): HTMLStyleElement {
    let fragment = CachedStyleFragments[styleContent];

    if (isUndefined(fragment)) {
        fragment = createDocumentFragment.call(document);
        const elm = createStyleElement(styleContent);
        appendChild.call(fragment, elm);
        CachedStyleFragments[styleContent] = fragment;
    }

    return fragment.cloneNode(true).firstChild as HTMLStyleElement;
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

function noop() {
    /** do nothing */
}

function createStyleVNode(elm: HTMLStyleElement) {
    const vnode = api.h('style', {
        key: 'style', // special key
        create: noop,
        update: noop,
    }, EmptyArray);
    // Force the diffing algo to use the cloned style.
    vnode.elm = elm;
    return vnode;
}

/**
 * Reset the styling token applied to the host element.
 */
export function resetStyleAttributes(vm: VM): void {
    const { context, elm } = vm;

    // Remove the style attribute currently applied to the host element.
    const oldHostAttribute = context.hostAttribute;
    if (!isUndefined(oldHostAttribute)) {
        removeAttribute.call(elm, oldHostAttribute);
    }

    // Reset the scoping attributes associated to the context.
    context.hostAttribute = context.shadowAttribute = undefined;
}

/**
 * Apply/Update the styling token applied to the host element.
 */
export function applyStyleAttributes(vm: VM, stylesheet: Stylesheet): void {
    const { context, elm } = vm;
    const { hostAttribute, shadowAttribute } = stylesheet;

    // Remove the style attribute currently applied to the host element.
    setAttribute.call(elm, hostAttribute, '');

    context.hostAttribute = hostAttribute;
    context.shadowAttribute = shadowAttribute;
}

export function evaluateCSS(vm: VM, stylesheetsObj: Stylesheet): VNode | null {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);

        assert.isTrue(isArray(stylesheetsObj.stylesheets), `Invalid stylesheets.`);
        assert.isTrue(isString(stylesheetsObj.hostAttribute), `Invalid stylesheet host attribute.`);
        assert.isTrue(isString(stylesheetsObj.shadowAttribute), `Invalid stylesheet shadow attribute.`);
    }

    const { fallback } = vm;
    const { stylesheets, hostAttribute, shadowAttribute } = stylesheetsObj;

    if (fallback) {
        const hostSelector = `[${hostAttribute}]`;
        const shadowSelector = `[${shadowAttribute}]`;

        stylesheets.forEach(stylesheet => {
            const textContent = stylesheet(hostSelector, shadowSelector, false);
            insertGlobalStyle(textContent);
        });

        return null;

    } else {
        // Native shadow in place, we need to act accordingly by using the `:host` selector, and an
        // empty shadow selector since it is not really needed.
        const textContent = stylesheets.reduce((buffer, stylesheet) => {
            return buffer + stylesheet(emptyString, emptyString, true);
        }, '');
        return createStyleVNode(getCachedStyleElement(textContent));
    }
}
