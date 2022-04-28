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

//
// StyleSheet cache
//

// Global catch of style elements used for fast cloning
const styleElements: { [content: string]: HTMLStyleElement } = create(null);
// Global cache of CSSStyleSheets because these need to be unique based on content
const styleSheets: { [content: string]: CSSStyleSheet } = create(null);
// Bookkeeping to know how many components/templates are relying on a given style sheet
const stylesToUsageCount: WeakMap<ShadowRoot | Document, { [content: string]: number }> =
    new WeakMap();
// Bookkeeping of appended style elements so that we don't have to manually search the DOM to find elements we appended
const targetsToStyleElements: WeakMap<ShadowRoot | Document, HTMLStyleElement> = new WeakMap();

function isDocument(target: ShadowRoot | Document): target is Document {
    return !isUndefined((target as Document).head);
}

function createStyleElement(content: string): HTMLStyleElement {
    // This `<style>` may be repeated multiple times in the DOM, so cache it. It's a bit
    // faster to call `cloneNode()` on an existing node than to recreate it every time.
    let elm = styleElements[content];
    if (isUndefined(elm)) {
        elm = document.createElement('style');
        elm.type = 'text/css';
        elm.textContent = content;
        styleElements[content] = elm;
    } else {
        elm = elm.cloneNode(true) as HTMLStyleElement;
    }
    return elm;
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
    const count = incrementOrDecrementUsageCount(content, target, 1);
    if (count > 1) {
        // already inserted
        return;
    }
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
    const count = incrementOrDecrementUsageCount(content, target, -1);
    if (count > 0) {
        // style sheet is still in use
        return;
    }
    const styleSheet = createOrGetConstructableStyleSheet(content);
    const { adoptedStyleSheets } = target;
    if (supportsMutableAdoptedStyleSheets) {
        adoptedStyleSheets.splice(adoptedStyleSheets.indexOf(styleSheet), 1);
    } else {
        target.adoptedStyleSheets = [...adoptedStyleSheets].filter((_) => _ !== styleSheet);
    }
}

function insertStyleElement(content: string, target: ShadowRoot | Document) {
    const count = incrementOrDecrementUsageCount(content, target, 1);
    if (count > 1) {
        // already inserted
        return;
    }
    const elm = createStyleElement(content);
    const targetAnchorPoint = isDocument(target) ? target.head : target;
    targetAnchorPoint.appendChild(elm);
    targetsToStyleElements.set(target, elm);
}

function removeStyleElement(content: string, target: ShadowRoot | Document) {
    const count = incrementOrDecrementUsageCount(content, target, -1);
    if (count > 0) {
        // style sheet is still in use
        return;
    }
    const elm = targetsToStyleElements.get(target)!;
    const targetAnchorPoint = isDocument(target) ? target.head : target;
    targetAnchorPoint.removeChild(elm);
    targetsToStyleElements.delete(target);
}

function insertStyleSheet(content: string, target: ShadowRoot | Document): void {
    if (supportsConstructableStyleSheets) {
        insertConstructableStyleSheet(content, target);
    } else {
        // Fall back to <style> element
        insertStyleElement(content, target);
    }
}

function removeStyleSheet(content: string, target: ShadowRoot | Document): void {
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
