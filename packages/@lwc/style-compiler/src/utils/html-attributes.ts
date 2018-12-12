/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export function isGlobalAttribute(attributeName: string): boolean {
    return GLOBAL_ATTRIBUTE_SET.has(attributeName);
}

export function isAriaAttribute(attributeName: string): boolean {
    return attributeName.startsWith('aria-');
}

export function isDataAttribute(attributeName: string): boolean {
    return attributeName.startsWith('data-');
}

export function isKnowAttributeOnElement(tagName: string, attributeName: string): boolean {
    // We can't validate the attribute on custom elements.
    const isCustomElement = tagName.includes('-');
    if (isCustomElement) {
        return false;
    }

    // Finally check in the list of known attributes for standard elements.
    return (
        Array.isArray(HTML_ATTRIBUTES_REVERSE_LOOKUP[attributeName]) &&
        HTML_ATTRIBUTES_REVERSE_LOOKUP[attributeName].includes(tagName)
    );
}

const GLOBAL_ATTRIBUTE_SET: Set<string> = new Set([
    'role',
    'accesskey',
    'class',
    'contenteditable',
    'contextmenu',
    'dir',
    'draggable',
    'dropzone',
    'hidden',
    'id',
    'itemprop',
    'lang',
    'slot',
    'spellcheck',
    'style',
    'tabindex',
    'title',
]);

const HTML_ATTRIBUTES_REVERSE_LOOKUP: { [attr: string]: string[] } = {
    'xlink:href': [
        'use',
    ],
    'role': [],
    'accept': [
        'form',
        'input',
    ],
    'accept-charset': [
        'form',
    ],
    'accesskey': [],
    'action': [
        'form',
    ],
    'align': [
        'applet',
        'caption',
        'col',
        'colgroup',
        'hr',
        'iframe',
        'img',
        'table',
        'tbody',
        'td',
        'tfoot',
        'th',
        'thead',
        'tr',
    ],
    'allowfullscreen': [
        'iframe',
    ],
    'allowtransparency': [
        'iframe', // Non standard
    ],
    'alt': [
        'applet',
        'area',
        'img',
        'input',
    ],
    'async': [
        'script',
    ],
    'autocomplete': [
        'form',
        'input',
    ],
    'autofocus': [
        'button',
        'input',
        'keygen',
        'select',
        'textarea',
    ],
    'autoplay': [
        'audio',
        'video',
    ],
    'autosave': [
        'input',
    ],
    'bgcolor': [
        'body',
        'col',
        'colgroup',
        'marquee',
        'table',
        'tbody',
        'tfoot',
        'td',
        'th',
        'tr',
    ],
    'border': [
        'img',
        'object',
        'table',
    ],
    'buffered': [
        'audio',
        'video',
    ],
    'challenge': [
         'keygen',
    ],
    'charset': [
        'meta',
        'script',
    ],
    'checked': [
        'command',
        'input',
    ],
    'cite': [
        'blockquote',
        'del',
        'ins',
        'q',
    ],
    'class': [],
    'code': [
        'applet',
    ],
    'codebase': [
        'applet',
    ],
    'color': [
        'basefont',
        'font',
        'hr',
    ],
    'cols': [
        'textarea',
    ],
    'colspan': [
        'td',
        'th',
    ],
    'content': [
        'meta',
    ],
    'contenteditable': [],
    'contextmenu': [],
    'controls': [
        'audio',
        'video',
    ],
    'coords': [
        'area',
    ],
    'data': [
        'object',
    ],
    'data-*': [],
    'datetime': [
        'del',
        'ins',
        'time',
    ],
    'default': [
        'track',
    ],
    'defer': [
        'script',
    ],
    'dir': [],
    'dirname': [
        'input',
        'textarea',
    ],
    'disabled': [
        'button',
        'command',
        'fieldset',
        'input',
        'keygen',
        'optgroup',
        'option',
        'select',
        'textarea',
    ],
    'download': [
        'a',
        'area',
    ],
    'draggable': [],
    'dropzone': [],
    'enctype': [
        'form',
    ],
    'for': [
        'label',
        'output',
    ],
    'form': [
        'button',
        'fieldset',
        'input',
        'keygen',
        'label',
        'meter',
        'object',
        'output',
        'progress',
        'select',
        'textarea',
    ],
    'formaction': [
        'input',
        'button',
    ],
    'headers': [
        'td',
        'th',
    ],
    'height': [
        'canvas',
        'embed',
        'iframe',
        'img',
        'input',
        'object',
        'video',
    ],
    'hidden': [],
    'high': [
        'meter',
    ],
    'href': [
        'a',
        'area',
        'base',
        'link',
    ],
    'hreflang': [
        'a',
        'area',
        'link',
    ],
    'http-equiv': [
        'meta',
    ],
    'icon': [
        'command',
    ],
    'id': [],
    'integrity': [
        'link',
        'script',
    ],
    'ismap': [
        'img',
    ],
    'itemprop': [],
    'keytype': [
      'keygen',
    ],
    'kind': [
        'track',
    ],
    'label': [
        'track',
    ],
    'lang': [],
    'language': [
        'script',
    ],
    'list': [
        'input',
    ],
    'loop': [
        'audio',
        'bgsound',
        'marquee',
        'video',
    ],
    'low': [
        'meter',
    ],
    'manifest': [
        'html',
    ],
    'max': [
        'input',
        'meter',
        'progress',
    ],
    'minlength': [
        'textarea',
        'input',
    ],
    'maxlength': [
        'input',
        'textarea',
    ],
    'media': [
        'a',
        'area',
        'link',
        'source',
        'style',
    ],
    'method': [
        'form',
    ],
    'min': [
        'input',
        'meter',
    ],
    'multiple': [
        'input',
        'select',
    ],
    'muted': [
        'video',
    ],
    'name': [
        'slot',
        'button',
        'form',
        'fieldset',
        'iframe',
        'input',
        'keygen',
        'object',
        'output',
        'select',
        'textarea',
        'map',
        'meta',
        'param',
    ],
    'novalidate': [
        'form',
    ],
    'open': [
        'details',
    ],
    'optimum': [
        'meter',
    ],
    'pattern': [
        'input',
    ],
    'ping': [
        'a',
        'area',
    ],
    'placeholder': [
        'input',
        'textarea',
    ],
    'poster': [
        'video',
    ],
    'preload': [
        'audio',
        'video',
    ],
    'radiogroup': [
        'command',
    ],
    'readonly': [
        'input',
        'textarea',
    ],
    'rel': [
        'a',
        'area',
        'link',
    ],
    'required': [
        'input',
        'select',
        'textarea',
    ],
    'reversed': [
        'ol',
    ],
    'rows': [
        'textarea',
    ],
    'rowspan': [
        'td',
        'th',
    ],
    'sandbox': [
        'iframe',
    ],
    'scope': [
        'th',
    ],
    'scoped': [
        'style',
    ],
    'scrolling': [
        'iframe', // Not supported in HTML5
    ],
    'seamless': [
        'iframe',
    ],
    'selected': [
        'option',
    ],
    'shape': [
        'a',
        'area',
    ],
    'size': [
        'input',
        'select',
    ],
    'sizes': [
        'link',
        'img',
        'source',
    ],
    'slot': [],
    'span': [
        'col',
        'colgroup',
    ],
    'spellcheck': [],
    'src': [
        'audio',
        'embed',
        'iframe',
        'img',
        'input',
        'script',
        'source',
        'track',
        'video',
    ],
    'srcdoc': [
        'iframe',
    ],
    'srclang': [
        'track',
    ],
    'srcset': [
        'img',
    ],
    'start': [
        'ol',
    ],
    'step': [
        'input',
    ],
    'style': [],
    'summary': [
        'table',
    ],
    'tabindex': [],
    'target': [
        'a',
        'area',
        'base',
        'form',
    ],
    'title': [],
    'type': [
        'button',
        'input',
        'command',
        'embed',
        'object',
        'script',
        'source',
        'style',
        'menu',
    ],
    'usemap': [
        'img',
        'input',
        'object',
    ],
    'value': [
        'button',
        'option',
        'input',
        'li',
        'meter',
        'progress',
        'param',
    ],
    'width': [
        'canvas',
        'embed',
        'iframe',
        'img',
        'input',
        'object',
        'video',
    ],
    'wrap': [
        'textarea',
    ],
};
