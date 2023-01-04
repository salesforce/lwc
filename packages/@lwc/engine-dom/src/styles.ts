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

interface CacheData {
    // Global cache of CSSStyleSheets is used because these need to be unique based on content, so the browser
    // can optimize repeated usages across multiple shadow roots.
    element: HTMLStyleElement | undefined;
    // Global cache of style elements is used for fast cloning.
    stylesheet: CSSStyleSheet | undefined;
    // Bookkeeping of shadow roots that have already had this CSS injected into them, so we don't duplicate stylesheets.
    // Note this will never be used by IE11 (because it only uses global styles), so WeakSet support is not important.
    roots: WeakSet<ShadowRoot> | undefined;
    // Same as above, but for the global document to avoid an extra WeakMap lookup for this common case.
    global: boolean;
    // Keep track of whether the <style> element has been used already, so we know if we need to clone it.
    // Note that this has no impact on constructable stylesheets, only <style> elements.
    usedElement: boolean;
}

interface ConstructableStylesheetCacheData extends CacheData {
    stylesheet: CSSStyleSheet;
}

interface StyleElementCacheData extends CacheData {
    element: HTMLStyleElement;
}

const stylesheetCache: Map<String, CacheData> = new Map();

//
// Test utilities
//

// Only used in LWC's Karma tests
if (process.env.NODE_ENV === 'test-karma-lwc') {
    // @ts-ignore
    window.__lwcResetGlobalStylesheets = () => {
        stylesheetCache.clear();
    };
}

function createFreshStyleElement(content: string) {
    const elm = document.createElement('style');
    elm.type = 'text/css';
    elm.textContent = content;
    return elm;
}

function createStyleElement(content: string, cacheData: StyleElementCacheData) {
    const { element, usedElement } = cacheData;
    // If the <style> was already used, then we should clone it. We cannot insert
    // the same <style> in two places in the DOM.
    if (usedElement) {
        // For a mysterious reason, IE11 doesn't like the way we clone <style> nodes
        // and will render the incorrect styles if we do things that way. It's just
        // a perf optimization, so we can skip it for IE11.
        if (isIE11) {
            return createFreshStyleElement(content);
        }
        // This `<style>` may be repeated multiple times in the DOM, so cache it. It's a bit
        // faster to call `cloneNode()` on an existing node than to recreate it every time.
        return element.cloneNode(true) as HTMLStyleElement;
    }
    // We don't clone every time, because that would be a perf tax on the first time
    cacheData.usedElement = true;
    return element;
}

function createConstructableStylesheet(content: string) {
    const stylesheet = new CSSStyleSheet();
    stylesheet.replaceSync(content);
    return stylesheet;
}

function insertConstructableStylesheet(
    content: string,
    target: ShadowRoot | Document,
    cacheData: ConstructableStylesheetCacheData
) {
    const { adoptedStyleSheets } = target;
    const { stylesheet } = cacheData;
    // Mutable adopted stylesheets are only supported in certain browsers.
    // The reason we use it is for perf: https://github.com/salesforce/lwc/pull/2683
    if (supportsMutableAdoptedStyleSheets) {
        adoptedStyleSheets.push(stylesheet);
    } else {
        target.adoptedStyleSheets = [...adoptedStyleSheets, stylesheet];
    }
}

function insertStyleElement(
    content: string,
    target: ShadowRoot | HTMLHeadElement,
    cacheData: StyleElementCacheData
) {
    const elm = createStyleElement(content, cacheData);
    target.appendChild(elm);
}

function getCacheData(content: string, useConstructableStylesheet: boolean): CacheData {
    let cacheData = stylesheetCache.get(content);
    if (isUndefined(cacheData)) {
        cacheData = {
            stylesheet: undefined,
            element: undefined,
            roots: undefined,
            global: false,
            usedElement: false,
        };
        stylesheetCache.set(content, cacheData);
    }

    // Create <style> elements or CSSStyleSheets on-demand, as needed
    if (useConstructableStylesheet && isUndefined(cacheData.stylesheet)) {
        cacheData.stylesheet = createConstructableStylesheet(content);
    } else if (!useConstructableStylesheet && isUndefined(cacheData.element)) {
        cacheData.element = createFreshStyleElement(content);
    }
    return cacheData;
}

function insertGlobalStylesheet(content: string) {
    // Force a <style> element for global stylesheets. See comment below.
    const cacheData = getCacheData(content, false);
    if (cacheData.global) {
        // already inserted
        return;
    }
    cacheData.global = true; // mark inserted

    // TODO [#2922]: use document.adoptedStyleSheets in supported browsers. Currently we can't, due to backwards compat.
    insertStyleElement(content, document.head, cacheData as StyleElementCacheData);
}

function insertLocalStylesheet(content: string, target: ShadowRoot) {
    const cacheData = getCacheData(content, supportsConstructableStylesheets);
    let { roots } = cacheData;
    if (isUndefined(roots)) {
        roots = cacheData.roots = new WeakSet(); // lazily initialize (not needed for global styles)
    } else if (roots.has(target)) {
        // already inserted
        return;
    }
    roots.add(target); // mark inserted

    // Constructable stylesheets are only supported in certain browsers:
    // https://caniuse.com/mdn-api_document_adoptedstylesheets
    // The reason we use it is for perf: https://github.com/salesforce/lwc/pull/2460
    if (supportsConstructableStylesheets) {
        insertConstructableStylesheet(
            content,
            target,
            cacheData as ConstructableStylesheetCacheData
        );
    } else {
        // Fall back to <style> element
        insertStyleElement(content, target, cacheData as StyleElementCacheData);
    }
}

export function insertStylesheet(content: string, target?: ShadowRoot) {
    if (isUndefined(target)) {
        // global
        insertGlobalStylesheet(content);
    } else {
        // local
        insertLocalStylesheet(content, target);
    }
}
