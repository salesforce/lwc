/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import * as parse5 from 'parse5';
import { DocumentFragment } from '@parse5/tools';

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

// The text content inside `<style>` is a special case. It is _only_ rendered by the LWC engine itself; <style> tags
// are disallowed inside of templates. Also, we want to avoid over-escaping, since CSS containing strings like
// `&amp;` and `&quot;` is not valid CSS (even when inside a `<style>` element).
//
// However, to avoid XSS attacks, we still need to check for things like `</style><script>alert("pwned")</script>`,
// since a user could use that inside of a *.css file to break out of a <style> element.
// See: https://github.com/salesforce/lwc/issues/3439
export function validateStyleTextContents(contents: string): void {
    // If parse5 parses this as more than one `<style>` tag, then it is unsafe to be rendered as-is
    const fragment = parse5.parseFragment(`<style>${contents}</style>`);

    if (!isSingleStyleNodeContainingSingleTextNode(fragment)) {
        throw new Error(
            'CSS contains unsafe characters and cannot be serialized inside a style element'
        );
    }
}
