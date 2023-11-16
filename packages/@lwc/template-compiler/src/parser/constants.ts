/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { AriaAttrNameToPropNameMap } from '@lwc/shared';
import { ElementDirectiveName } from '../shared/types';
import { HTML_ATTRIBUTE_ELEMENT_MAP } from './utils/html-element-attributes';
import { HTML_ELEMENTS } from './utils/html-elements';
import { SVG_ELEMENTS } from './utils/svg-elements';

export const EXPRESSION_RE = /(\{(?:.)+?\})/g;

export const IF_RE = /^if:/;
export const LWC_RE = /^lwc:/;
export const VALID_IF_MODIFIER = new Set(['true', 'false', 'strict-true']);

export const ITERATOR_RE = /^iterator:.*$/;

export const EVENT_HANDLER_RE = /^on/;
export const EVENT_HANDLER_NAME_RE = /^on[a-z][a-z0-9_]*$/;

export const LWC_DIRECTIVE_SET: Set<string> = new Set(Object.values(ElementDirectiveName));

const ATTRIBUTE_NAME_CHAR = [
    ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-',
    '\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD',
    '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040',
].join('');

// eslint-disable-next-line no-misleading-character-class
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

export const DISALLOWED_MATHML_TAGS = new Set(['script', 'link', 'base', 'object']);

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

export const KNOWN_HTML_AND_SVG_ELEMENTS = new Set([...HTML_ELEMENTS, ...SVG_ELEMENTS]);

export const HTML_TAG = {
    A: 'a',
    AREA: 'area',
    BODY: 'body',
    CAPTION: 'caption',
    COL: 'col',
    COLGROUP: 'colgroup',
    HEAD: 'head',
    HTML: 'html',
    TBODY: 'tbody',
    TD: 'td',
    TFOOT: 'tfoot',
    TH: 'th',
    THEAD: 'thead',
    TR: 'tr',
    USE: 'use',
};
export const ATTR_NAME = {
    HREF: 'href',
    XLINK_HREF: 'xlink:href',
};
export const TEMPLATE_DIRECTIVES = [/^key$/, /^lwc:*/, /^if:*/, /^for:*/, /^iterator:*/];

// TODO [#3370]: remove experimental template expression flag
export const TMPL_EXPR_ECMASCRIPT_EDITION = 2022;
