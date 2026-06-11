/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// This code is inspired by Polymer ShadyDOM Polyfill

import { tagNameGetter } from '../../env/element';
import {
    ELEMENT_NODE,
    TEXT_NODE,
    CDATA_SECTION_NODE,
    PROCESSING_INSTRUCTION_NODE,
    COMMENT_NODE,
} from '../../env/node';

import { getInnerHTML } from './inner-html';

// http://www.whatwg.org/specs/web-apps/current-work/multipage/the-end.html#escapingString
const escapeAttrRegExp = /[&\u00A0"]/g;
const escapeDataRegExp = /[&\u00A0<>]/g;
const { replace, toLowerCase } = String.prototype;

function escapeReplace(c: string): string {
    switch (c) {
        case '&':
            return '&amp;';
        case '<':
            return '&lt;';
        case '>':
            return '&gt;';
        case '"':
            return '&quot;';
        case '\u00A0':
            return '&nbsp;';
        default:
            return '';
    }
}

function escapeAttr(s: string): string {
    return replace.call(s, escapeAttrRegExp, escapeReplace);
}

function escapeData(s: string): string {
    return replace.call(s, escapeDataRegExp, escapeReplace);
}

// http://www.whatwg.org/specs/web-apps/current-work/#void-elements
const voidElements = new Set([
    'AREA',
    'BASE',
    'BR',
    'COL',
    'COMMAND',
    'EMBED',
    'HR',
    'IMG',
    'INPUT',
    'KEYGEN',
    'LINK',
    'META',
    'PARAM',
    'SOURCE',
    'TRACK',
    'WBR',
]);

const plaintextParents = new Set([
    'STYLE',
    'SCRIPT',
    'XMP',
    'IFRAME',
    'NOEMBED',
    'NOFRAMES',
    'PLAINTEXT',
    'NOSCRIPT',
]);

export function getOuterHTML(node: Node): string {
    switch (node.nodeType) {
        case ELEMENT_NODE: {
            const { attributes: attrs } = node as Element;
            const tagName = tagNameGetter.call(node as Element);
            let s = '<' + toLowerCase.call(tagName);
            for (let i = 0, attr; (attr = attrs[i]); i++) {
                s += ' ' + attr.name + '="' + escapeAttr(attr.value) + '"';
            }
            s += '>';
            if (voidElements.has(tagName)) {
                return s;
            }
            return s + getInnerHTML(node) + '</' + toLowerCase.call(tagName) + '>';
        }
        case TEXT_NODE: {
            const { data, parentNode } = node as Text;
            if (
                parentNode instanceof Element &&
                plaintextParents.has(tagNameGetter.call(parentNode))
            ) {
                return data;
            }
            return escapeData(data);
        }
        case CDATA_SECTION_NODE: {
            return `<!CDATA[[${(node as CDATASection).data}]]>`;
        }
        case PROCESSING_INSTRUCTION_NODE: {
            return `<?${(node as ProcessingInstruction).target} ${
                (node as ProcessingInstruction).data
            }?>`;
        }
        case COMMENT_NODE: {
            return `<!--${(node as Comment).data}-->`;
        }
        default: {
            // intentionally ignoring unknown node types
            // Note: since this routine is always invoked for childNodes
            // we can safety ignore type 9, 10 and 99 (document, fragment and doctype)
            return '';
        }
    }
}
