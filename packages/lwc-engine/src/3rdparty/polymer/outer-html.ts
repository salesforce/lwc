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

import { getInnerHTML } from "./inner-html";

// http://www.whatwg.org/specs/web-apps/current-work/multipage/the-end.html#escapingString
const escapeAttrRegExp = /[&\u00A0"]/g;
const escapeDataRegExp = /[&\u00A0<>]/g;
const replace = String.prototype.replace;

function escapeReplace(c) {
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
    }
}

function escapeAttr(s) {
    return replace.call(s, escapeAttrRegExp, escapeReplace);
}

function escapeData(s) {
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
    'WBR'
]);

const plaintextParents = new Set([
    'STYLE',
    'SCRIPT',
    'XMP',
    'IFRAME',
    'NOEMBED',
    'NOFRAMES',
    'PLAINTEXT',
    'NOSCRIPT'
]);

export function getOuterHTML(node: Node): string {
    switch (node.nodeType) {
        case Node.ELEMENT_NODE: {
            const { tagName, attributes: attrs } = node as Element;
            let s = '<' + tagName;
            for (let i = 0, attr; (attr = attrs[i]); i++) {
                s += ' ' + attr.name + '="' + escapeAttr(attr.value) + '"';
            }
            s += '>';
            if (voidElements.has(tagName)) {
                return s;
            }
            return s + getInnerHTML(node) + '</' + tagName + '>';
        }
        case Node.TEXT_NODE: {
            const { data, parentNode } = node as Text;
            if (parentNode !== null && plaintextParents.has((parentNode as Element).tagName)) {
                return data;
            }
            return escapeData(data);
        }
        case Node.COMMENT_NODE: {
            return '<!--' + (node as Comment).data + '-->';
        }
        default: {
            throw new Error();
        }
    }
}
