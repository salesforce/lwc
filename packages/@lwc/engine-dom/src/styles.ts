/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isUndefined, getOwnPropertyDescriptor, isArray, isFunction } from '@lwc/shared';

//
// Feature detection
//

// This check for constructable style sheets is similar to Fast's:
// https://github.com/microsoft/fast/blob/d49d1ec/packages/web-components/fast-element/src/dom.ts#L51-L53
// See also: https://github.com/whatwg/webidl/issues/1027#issuecomment-934510070
const supportsConstructableStylesheets =
    isFunction(CSSStyleSheet.prototype.replaceSync) && isArray(document.adoptedStyleSheets);
// The original adoptedStylesheet proposal used a frozen array. A follow-up proposal made the array mutable.
// Chromium 99+ and Firefox 101+ support mutable arrays. We check if the array is mutable, to ensure backward compat.
// (If the length is writable, then the array is mutable.) See: https://chromestatus.com/feature/5638996492288000
// TODO [#2828]: Re-evaluate this in the future once we drop support for older browser versions.
const supportsMutableAdoptedStyleSheets =
    supportsConstructableStylesheets &&
    getOwnPropertyDescriptor(document.adoptedStyleSheets, 'length')!.writable;
// Detect IE, via https://stackoverflow.com/a/9851769
const isIE11 = !isUndefined((document as any).documentMode);

//
// Style sheet cache
//

// Global cache of style elements used for fast cloning
let styleElements: Map<string, HTMLStyleElement> = new Map();
// Global cache of CSSStyleSheets because these need to be unique based on content
let stylesheets: Map<string, CSSStyleSheet> = new Map();
// Bookkeeping of targets to CSS that has already been injected into them, so we don't duplicate
let shadowRootsToInsertedStylesheets: WeakMap<ShadowRoot, Set<string>> = new WeakMap();
// Same as above, but for the global document to avoid an extra WeakMap lookup for this common case
let globalInsertedStylesheets: Set<string> = new Set();

//
// Test utilities
//

if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    window.__lwcResetGlobalStylesheets = () => {
        styleElements = new Map();
        stylesheets = new Map();
        shadowRootsToInsertedStylesheets = new WeakMap();
        globalInsertedStylesheets = new Set();
    };
}

function isDocument(target: ShadowRoot | Document): target is Document {
    return !isUndefined((target as Document).head);
}

function createFreshStyleElement(content: string) {
    const elm = document.createElement('style');
    elm.type = 'text/css';
    elm.textContent = content;
    return elm;
}

function createStyleElement(content: string) {
    // For a mysterious reason, IE11 doesn't like the way we clone <style> nodes
    // and will render the incorrect styles if we do things that way. It's just
    // a perf optimization, so we can skip it for IE11.
    if (isIE11) {
        return createFreshStyleElement(content);
    }

    let elm = styleElements.get(content);
    if (isUndefined(elm)) {
        // We don't clone every time, because that would be a perf tax on the first time
        elm = createFreshStyleElement(content);
        styleElements.set(content, elm);
    } else {
        // This `<style>` may be repeated multiple times in the DOM, so cache it. It's a bit
        // faster to call `cloneNode()` on an existing node than to recreate it every time.
        elm = elm.cloneNode(true) as HTMLStyleElement;
    }
    return elm;
}

function createOrGetConstructableStylesheet(content: string) {
    // It's important for CSSStyleSheets to be unique based on their content, so
    // that adoptedStyleSheets.indexOf(sheet) works
    let stylesheet = stylesheets.get(content);
    if (isUndefined(stylesheet)) {
        stylesheet = new CSSStyleSheet();
        stylesheet.replaceSync(content);
        stylesheets.set(content, stylesheet);
    }
    return stylesheet;
}

function insertConstructableStylesheet(content: string, target: ShadowRoot | Document) {
    const stylesheet = createOrGetConstructableStylesheet(content);
    const { adoptedStyleSheets } = target;
    // Mutable adopted stylesheets are only supported in certain browsers.
    // The reason we use it is for perf: https://github.com/salesforce/lwc/pull/2683
    if (supportsMutableAdoptedStyleSheets) {
        adoptedStyleSheets.push(stylesheet);
    } else {
        target.adoptedStyleSheets = [...adoptedStyleSheets, stylesheet];
    }
}

function insertStyleElement(content: string, target: ShadowRoot | Document) {
    const elm = createStyleElement(content);
    const targetAnchorPoint = isDocument(target) ? target.head : target;
    targetAnchorPoint.appendChild(elm);
}

function doInsertStylesheet(content: string, target: ShadowRoot | Document) {
    // Constructable stylesheets are only supported in certain browsers:
    // https://caniuse.com/mdn-api_document_adoptedstylesheets
    // The reason we use it is for perf: https://github.com/salesforce/lwc/pull/2460
    if (supportsConstructableStylesheets) {
        insertConstructableStylesheet(content, target);
    } else {
        // Fall back to <style> element
        insertStyleElement(content, target);
    }
}

function getInsertedStylesheetsForShadowRoot(target: ShadowRoot) {
    let insertedStylesheets = shadowRootsToInsertedStylesheets.get(target);
    if (isUndefined(insertedStylesheets)) {
        insertedStylesheets = new Set();
        shadowRootsToInsertedStylesheets.set(target, insertedStylesheets);
    }
    return insertedStylesheets;
}

export function insertStylesheet(content: string, target?: ShadowRoot) {
    const isGlobal = isUndefined(target);
    const insertedStylesheets = isGlobal
        ? globalInsertedStylesheets
        : getInsertedStylesheetsForShadowRoot(target);
    if (insertedStylesheets.has(content)) {
        // already inserted
        return;
    }
    insertedStylesheets.add(content);
    const documentOrShadowRoot = isGlobal ? document : target;
    doInsertStylesheet(content, documentOrShadowRoot);
}
