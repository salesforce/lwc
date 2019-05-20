/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export const EXPRESSION_RE = /(\{(?:.)+?\})/g;

export const IF_RE = /^if:/;
export const VALID_IF_MODIFIER = new Set(['true', 'false', 'strict-true']);

export const ITERATOR_RE = /^iterator:.*$/;

export const EVENT_HANDLER_RE = /^on/;
export const EVENT_HANDLER_NAME_RE = /^on[a-z][a-z0-9_]*$/;

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

const ATTRIBUTE_NAME_CHAR = [
    ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-',
    '\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD',
    '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040',
].join('');
export const ARIA_RE = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
export const DATA_RE = new RegExp('^(data)-[' + ATTRIBUTE_NAME_CHAR + ']*$');

export const SVG_TAG_WHITELIST = new Set([
    'svg',
    'a',
    'altglyph',
    'altglyphdef',
    'altglyphitem',
    'animatecolor',
    'animatemotion',
    'animatetransform',
    'audio',
    'canvas',
    'circle',
    // 'clippath', // '<clipPath> has no matching closing tag.' even with correct closing
    'defs',
    'desc',
    'ellipse',
    'filter',
    'font',
    'g',
    'glyph',
    'glyphref',
    'hkern',
    'image',
    'line',
    'lineargradient',
    'marker',
    'mask',
    'mpath',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialgradient',
    'rect',
    'stop',
    'switch',
    'symbol',
    'text',
    // 'textpath', // '<textPath> has no matching closing tag.' even with correct closing
    'title',
    'tref',
    'tspan',
    'video',
    'view',
    'vkern',
    'use',
]);

export const MATHML_TAG_BLACKLIST = new Set(['script']);

export const GLOBAL_ATTRIBUTE_SET = new Set([
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

export const VOID_ELEMENT_SET = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'menuitem',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
]);

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
    // These have to be quoted because aria- attributes below are quoted
    // Our linting doesn't like to mix quoted and un-quoted property names
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
    // According to the following list, there are 48 aria attributes (of which 2 are deprecated):
    // https://www.w3.org/TR/wai-aria-1.1/#x6-6-definitions-of-states-and-properties-all-aria-attributes
    // This list of 46 non-deprecated aria attributes is consistent with the following proposal:
    // https://github.com/w3c/aria/pull/708/files#diff-eacf331f0ffc35d4b482f1d15a887d3bR11060
    'aria-activedescendant': 'ariaActiveDescendant',
    'aria-atomic': 'ariaAtomic',
    'aria-autocomplete': 'ariaAutoComplete',
    'aria-busy': 'ariaBusy',
    'aria-checked': 'ariaChecked',
    'aria-colcount': 'ariaColCount',
    'aria-colindex': 'ariaColIndex',
    'aria-colspan': 'ariaColSpan',
    'aria-controls': 'ariaControls',
    'aria-current': 'ariaCurrent',
    'aria-describedby': 'ariaDescribedBy',
    'aria-details': 'ariaDetails',
    'aria-disabled': 'ariaDisabled',
    //  'aria-dropeffect': 'ariaDropEffect', /* Deprecated in ARIA 1.1 */
    'aria-errormessage': 'ariaErrorMessage',
    'aria-expanded': 'ariaExpanded',
    'aria-flowto': 'ariaFlowTo',
    //  'aria-grabbed': 'ariaGrabbed', /* Deprecated in ARIA 1.1 */
    'aria-haspopup': 'ariaHasPopup',
    'aria-hidden': 'ariaHidden',
    'aria-invalid': 'ariaInvalid',
    'aria-keyshortcuts': 'ariaKeyShortcuts',
    'aria-label': 'ariaLabel',
    'aria-labelledby': 'ariaLabelledBy',
    'aria-level': 'ariaLevel',
    'aria-live': 'ariaLive',
    'aria-modal': 'ariaModal',
    'aria-multiline': 'ariaMultiLine',
    'aria-multiselectable': 'ariaMultiSelectable',
    'aria-orientation': 'ariaOrientation',
    'aria-owns': 'ariaOwns',
    'aria-placeholder': 'ariaPlaceholder',
    'aria-posinset': 'ariaPosInSet',
    'aria-pressed': 'ariaPressed',
    'aria-readonly': 'ariaReadOnly',
    'aria-relevant': 'ariaRelevant',
    'aria-required': 'ariaRequired',
    'aria-roledescription': 'ariaRoleDescription',
    'aria-rowcount': 'ariaRowCount',
    'aria-rowindex': 'ariaRowIndex',
    'aria-rowspan': 'ariaRowSpan',
    'aria-selected': 'ariaSelected',
    'aria-setsize': 'ariaSetSize',
    'aria-sort': 'ariaSort',
    'aria-valuemax': 'ariaValueMax',
    'aria-valuemin': 'ariaValueMin',
    'aria-valuenow': 'ariaValueNow',
    'aria-valuetext': 'ariaValueText',
};

export const HTML_TAG_BLACKLIST = new Set(['base', 'link', 'meta', 'script', 'title']);

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
