/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import type { parseFragment } from 'parse5';
import type { DocumentFragment } from '@parse5/tools';

function isSingleStyleNodeContainingSingleTextNode(node: DocumentFragment) {
    if (node.childNodes.length !== 1) {
        return false;
    }

    const style = node.childNodes[0];

    if (style.nodeName !== 'style' || style.childNodes.length !== 1) {
        return false;
    }

    const textNode = style.childNodes[0];

    return textNode.nodeName === '#text';
}

/**
 * The text content inside `<style>` is a special case. It is _only_ rendered by the LWC engine itself; <style> tags
 * are disallowed inside of templates. Also, we want to avoid over-escaping, since CSS containing strings like
 * `&amp;` and `&quot;` is not valid CSS (even when inside a `<style>` element).
 *
 * However, to avoid XSS attacks, we still need to check for things like `</style><script>alert("pwned")</script>`,
 * since a user could use that inside of a *.css file to break out of a <style> element.
 * @param contents CSS source to validate
 * @param parseFragmentFunc the parseFragment function from parse5, which must be passed in
 * to avoid having parse5 as a dep of `@lwc/shared`
 * @throws Throws if the contents provided are not valid.
 * @see https://github.com/salesforce/lwc/issues/3439
 * @example
 * validateStyleTextContents('div { color: red }') // Ok
 * validateStyleTextContents('</style><script>alert("pwned")</script>') // Throws
 */
export function validateStyleTextContents(
    contents: string,
    parseFragmentFunc: typeof parseFragment
): void {
    // If parse5 parses this as more than one `<style>` tag, then it is unsafe to be rendered as-is
    const fragment = parseFragmentFunc(`<style>${contents}</style>`);

    if (!isSingleStyleNodeContainingSingleTextNode(fragment)) {
        throw new Error(
            'CSS contains unsafe characters and cannot be serialized inside a style element. ' +
                'Ensure that your CSS does not contain any HTML content.'
        );
    }
}
