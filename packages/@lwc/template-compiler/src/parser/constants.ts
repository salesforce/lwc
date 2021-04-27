/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { AriaAttrNameToPropNameMap } from '@lwc/shared';

import { HTML_ATTRIBUTE_ELEMENT_MAP } from './utils/html-element-attributes';
import { HTML_ELEMENTS, HTML_VOID_ELEMENTS } from './utils/html-elements';

export const EXPRESSION_RE = /(\{(?:.)+?\})/g;

export const IF_RE = /^if:/;
export const LWC_RE = /^lwc:/;
export const VALID_IF_MODIFIER = new Set(['true', 'false', 'strict-true']);

export const ITERATOR_RE = /^iterator:.*$/;

export const EVENT_HANDLER_RE = /^on/;
export const EVENT_HANDLER_NAME_RE = /^on[a-z][a-z0-9_]*$/;

export const LWC_DIRECTIVES = {
    DOM: 'lwc:dom',
    DYNAMIC: 'lwc:dynamic',
};

export const LWC_DIRECTIVE_SET: Set<string> = new Set([LWC_DIRECTIVES.DOM, LWC_DIRECTIVES.DYNAMIC]);

// These attributes take either an ID or a list of IDs as values.
export const ID_REFERENCING_ATTRIBUTES_SET: Set<string> = new Set([
    'aria-activedescendant',
    'aria-controls',
    'aria-describedby',
    'aria-details',
    'aria-errormessage',
    'aria-flowto',
    'aria-labelledby',
    'aria-owns',
    'for',
]);

export const PRESERVE_COMMENTS_ATTRIBUTE_NAME = 'lwc:preserve-comments';

const ATTRIBUTE_NAME_CHAR = [
    ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-',
    '\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD',
    '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040',
].join('');

export const DATA_RE = new RegExp('^(data)-[' + ATTRIBUTE_NAME_CHAR + ']*$');

export const SUPPORTED_SVG_TAGS = new Set([
    'svg',
    'a',
    'altGlyph',
    'altglyphDef',
    'altGlyphItem',
    'animate',
    'animateColor',
    'animateMotion',
    'animateTransform',
    'audio',
    'canvas',
    'circle',
    'clipPath',
    'defs',
    'desc',
    'ellipse',
    'feBlend',
    'feColorMatrix',
    'feComponentTransfer',
    'feFuncR',
    'feFuncG',
    'feFuncB',
    'feFuncA',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDropShadow',
    'feFlood',
    'feGaussianBlur',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'feSpecularLighting',
    'feTile',
    'feTurbulence',
    'fePointLight',
    'filter',
    'font',
    'foreignObject',
    'g',
    'glyph',
    'glyphRef',
    'hkern',
    'image',
    'line',
    'linearGradient',
    'marker',
    'mask',
    'mpath',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialGradient',
    'rect',
    'stop',
    'switch',
    'symbol',
    'text',
    'textPath',
    'title',
    'tref',
    'tspan',
    'video',
    'view',
    'vkern',
    'use',
]);

export const DISALLOWED_MATHML_TAGS = new Set([
    'script',
    'link',
    'base',
    'object',
    'embed',
    'meta',
]);

export const VOID_ELEMENT_SET = new Set(HTML_VOID_ELEMENTS);

export const DASHED_TAGNAME_ELEMENT_SET = new Set([
    'annotation-xml',
    'color-profile',
    'font-face',
    'font-face-src',
    'font-face-uri',
    'font-face-format',
    'font-face-name',
    'missing-glyph',
]);

export const ATTRS_PROPS_TRANFORMS: { [name: string]: string } = {
    accesskey: 'accessKey',
    readonly: 'readOnly',
    tabindex: 'tabIndex',
    bgcolor: 'bgColor',
    colspan: 'colSpan',
    rowspan: 'rowSpan',
    contenteditable: 'contentEditable',
    crossorigin: 'crossOrigin',
    datetime: 'dateTime',
    formaction: 'formAction',
    ismap: 'isMap',
    maxlength: 'maxLength',
    minlength: 'minLength',
    novalidate: 'noValidate',
    usemap: 'useMap',
    for: 'htmlFor',
    ...AriaAttrNameToPropNameMap,
};

export const DISALLOWED_HTML_TAGS = new Set(['base', 'link', 'meta', 'script', 'title']);

export const HTML_ATTRIBUTES_REVERSE_LOOKUP: {
    [attr: string]: string[];
} = HTML_ATTRIBUTE_ELEMENT_MAP;

export const KNOWN_HTML_ELEMENTS = new Set(HTML_ELEMENTS.concat(HTML_VOID_ELEMENTS));

export const HTML_TAG = {
    A: 'a',
    AREA: 'area',
    USE: 'use',
};
export const ATTR_NAME = {
    HREF: 'href',
    XLINK_HREF: 'xlink:href',
};
export const HTML_NAMESPACE_URI = 'http://www.w3.org/1999/xhtml';
export const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';
export const MATHML_NAMESPACE_URI = 'http://www.w3.org/1998/Math/MathML';
export const TEMPLATE_DIRECTIVES = [/^key$/, /^lwc:*/, /^if:*/, /^for:*/, /^iterator:*/];
