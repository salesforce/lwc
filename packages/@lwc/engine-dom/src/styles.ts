/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isUndefined, create, getOwnPropertyDescriptor, isArray, isFunction } from '@lwc/shared';

//
// Feature detection
//

// This check for constructable style sheets is similar to Fast's:
// https://github.com/microsoft/fast/blob/d49d1ec/packages/web-components/fast-element/src/dom.ts#L51-L53
// See also: https://github.com/whatwg/webidl/issues/1027#issuecomment-934510070
const supportsConstructableStyleSheets =
    isFunction(CSSStyleSheet.prototype.replaceSync) && isArray(document.adoptedStyleSheets);
// If length is writable, then mutable adopted style sheets are supported. See:
// https://chromestatus.com/feature/5638996492288000
const supportsMutableAdoptedStyleSheets =
    supportsConstructableStyleSheets &&
    getOwnPropertyDescriptor(document.adoptedStyleSheets, 'length')!.writable;
// Detect IE, via https://stackoverflow.com/a/9851769
const isIE11 = !isUndefined((document as any).documentMode);

//
// Style sheet cache
//

// Global catch of style elements used for fast cloning
const styleElements: { [content: string]: HTMLStyleElement } = create(null);
// Global cache of CSSStyleSheets because these need to be unique based on content
const styleSheets: { [content: string]: CSSStyleSheet } = create(null);
// Bookkeeping to know how many components/templates are relying on a given style sheet
const stylesToUsageCount: WeakMap<ShadowRoot | Document, { [content: string]: number }> =
    new WeakMap();
// Bookkeeping of appended style elements so that we don't have to manually search the DOM to find elements we appended
const targetsToStyleElements: WeakMap<
    ShadowRoot | Document,
    { [content: string]: HTMLStyleElement }
> = new WeakMap();

function isDocument(target: ShadowRoot | Document): target is Document {
    return !isUndefined((target as Document).head);
}

function createFreshStyleElement(content: string): HTMLStyleElement {
    const elm = document.createElement('style');
    elm.type = 'text/css';
    elm.textContent = content;
    return elm;
}

function createStyleElement(content: string): HTMLStyleElement {
    // For a mysterious reason, IE11 doesn't like the way we clone <style> nodes
    // and will render the incorrect styles if we do things that way. It's just
    // a perf optimization, so we can skip it for IE11.
    if (isIE11) {
        return createFreshStyleElement(content);
    }

    let elm = styleElements[content];
    if (isUndefined(elm)) {
        // We don't clone every time, because that would be a perf tax on the first time
        elm = createFreshStyleElement(content);
        styleElements[content] = elm;
    } else {
        // This `<style>` may be repeated multiple times in the DOM, so cache it. It's a bit
        // faster to call `cloneNode()` on an existing node than to recreate it every time.
        elm = elm.cloneNode(true) as HTMLStyleElement;
    }
    return elm;
}

function setStyleElementForTarget(
    target: ShadowRoot | Document,
    content: string,
    elm: HTMLStyleElement
) {
    let contentsToStyleElements = targetsToStyleElements.get(target);
    if (isUndefined(contentsToStyleElements)) {
        contentsToStyleElements = create(null);
        targetsToStyleElements.set(target, contentsToStyleElements!);
    }
    contentsToStyleElements![content] = elm;
}

function unsetStyleElementForTarget(target: ShadowRoot | Document, content: string) {
    const contentsToStyleElements = targetsToStyleElements.get(target);
    if (!isUndefined(contentsToStyleElements)) {
        delete contentsToStyleElements![content];
    }
}

function getStyleElementForTarget(target: ShadowRoot | Document, content: string) {
    const contentsToStyleElements = targetsToStyleElements.get(target);
    if (!isUndefined(contentsToStyleElements)) {
        return contentsToStyleElements[content];
    }
}

function createOrGetConstructableStyleSheet(content: string): CSSStyleSheet {
    // It's important for CSSStyleSheets to be unique based on their content, so
    // that adoptedStyleSheets.indexOf(sheet) works
    let styleSheet = styleSheets[content];
    if (isUndefined(styleSheet)) {
        styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(content);
        styleSheets[content] = styleSheet;
    }
    return styleSheet;
}

function getStylesToUsageCounts(target: ShadowRoot | Document) {
    let stylesToCounts = stylesToUsageCount.get(target);
    if (isUndefined(stylesToCounts)) {
        stylesToCounts = create(null);
        stylesToUsageCount.set(target, stylesToCounts!);
    }
    return stylesToCounts!;
}

function incrementOrDecrementUsageCount(
    content: string,
    target: ShadowRoot | Document,
    delta: number
) {
    const stylesToCounts = getStylesToUsageCounts(target);

    let count = stylesToCounts[content];
    if (isUndefined(count)) {
        count = 0;
    }
    count += delta;
    stylesToCounts[content] = count;
    return count;
}

function insertConstructableStyleSheet(content: string, target: ShadowRoot | Document) {
    const styleSheet = createOrGetConstructableStyleSheet(content);
    const { adoptedStyleSheets } = target;
    if (supportsMutableAdoptedStyleSheets) {
        // This is only supported in later versions of Chromium:
        // https://chromestatus.com/feature/5638996492288000
        adoptedStyleSheets.push(styleSheet);
    } else {
        target.adoptedStyleSheets = [...adoptedStyleSheets, styleSheet];
    }
}

function removeConstructableStyleSheet(content: string, target: ShadowRoot | Document) {
    const styleSheet = createOrGetConstructableStyleSheet(content);
    const { adoptedStyleSheets } = target;
    if (supportsMutableAdoptedStyleSheets) {
        // If indexOf() returns -1, then splice() won't do anything
        adoptedStyleSheets.splice(adoptedStyleSheets.indexOf(styleSheet), 1);
    } else {
        target.adoptedStyleSheets = [...adoptedStyleSheets].filter((_) => _ !== styleSheet);
    }
}

function insertStyleElement(content: string, target: ShadowRoot | Document) {
    const elm = createStyleElement(content);
    const targetAnchorPoint = isDocument(target) ? target.head : target;
    targetAnchorPoint.appendChild(elm);
    setStyleElementForTarget(target, content, elm);
}

function removeStyleElement(content: string, target: ShadowRoot | Document) {
    const elm = getStyleElementForTarget(target, content);

    if (isUndefined(elm)) {
        return;
    }

    unsetStyleElementForTarget(target, content);
    const targetAnchorPoint = isDocument(target) ? target.head : target;
    if (elm.parentNode === targetAnchorPoint) {
        // It's possible for the element to no longer be attached to the target,
        // if somebody else removed it (e.g. the cleanup code in our Karma tests)
        targetAnchorPoint.removeChild(elm);
    }
}

function insertStyleSheet(content: string, target: ShadowRoot | Document): void {
    const count = incrementOrDecrementUsageCount(content, target, 1);
    if (count > 1) {
        // already inserted
        return;
    }
    if (supportsConstructableStyleSheets) {
        insertConstructableStyleSheet(content, target);
    } else {
        // Fall back to <style> element
        insertStyleElement(content, target);
    }
}

function removeStyleSheet(content: string, target: ShadowRoot | Document): void {
    const count = incrementOrDecrementUsageCount(content, target, -1);
    if (count > 0) {
        // style sheet is still in use
        return;
    }
    if (supportsConstructableStyleSheets) {
        removeConstructableStyleSheet(content, target);
    } else {
        // Fall back to <style> element
        removeStyleElement(content, target);
    }
}

export function toggleStyleSheet(content: string, insert: boolean, target?: ShadowRoot): void {
    const documentOrShadowRoot = isUndefined(target) ? document : target;
    if (insert) {
        insertStyleSheet(content, documentOrShadowRoot);
    } else {
        removeStyleSheet(content, documentOrShadowRoot);
    }
}
