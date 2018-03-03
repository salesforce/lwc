export const EXPRESSION_RE = /(\{(?:.)+?\})/g;

export const IF_RE = /^if:/;
export const VALID_IF_MODIFIER = new Set([
    'true',
    'false',
    'strict-true',
]);

export const ITERATOR_RE = /^iterator\:.*$/;

export const EVENT_HANDLER_RE = /^on/;
export const EVENT_HANDLER_NAME_RE = /^on[a-z]+$/;

export const DEFAULT_SLOT_NAME = '$default$';

const ATTRIBUTE_NAME_CHAR = [
    ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-',
    '\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD',
    '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040',
].join('');
export const ARIA_RE = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
export const DATA_RE = new RegExp('^(data)-[' + ATTRIBUTE_NAME_CHAR + ']*$');

export const SVG_TAG_SET = new Set([
    'svg', 'animate', 'circle', 'clippath', 'cursor', 'defs', 'desc', 'ellipse', 'filter',
    'font-face', 'g', 'glyph', 'image', 'line', 'marker', 'mask', 'missing-glyph', 'path', 'pattern',
    'polygon', 'polyline', 'rect', 'switch', 'symbol', 'text', 'textpath', 'tspan', 'use', 'view',
]);

export const GLOBAL_ATTRIBUTE_SET = new Set([
    'role', 'accesskey', 'class', 'contenteditable', 'contextmenu', 'dir', 'draggable', 'dropzone', 'hidden',
    'id', 'itemprop', 'lang', 'slot', 'spellcheck', 'style', 'tabindex', 'title',
]);

export const VOID_ELEMENT_SET = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param',
    'source', 'track', 'wbr',
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
    'accesskey': 'accessKey',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex',
    'bgcolor': 'bgColor',
    'colspan': 'colSpan',
    'rowspan': 'rowSpan',
    'contentEditable': 'contentEditable',
    'datetime': 'dateTime',
    'formaction': 'formAction',
    'ismap': 'isMap',
    'maxlength': 'maxLength',
    'usemap': 'useMap',
    'for': 'htmlFor',

    // Aria
    'aria-autocomplete': 'ariaAutocomplete',
    'aria-checked': 'ariaChecked',
    'aria-current': 'ariaCurrent',
    'aria-disabled': 'ariaDisabled',
    'aria-expanded': 'ariaExpanded',
    'aria-haspopup': 'ariaHasPopUp',
    'aria-hidden': 'ariaHidden',
    'aria-invalid': 'ariaInvalid',
    'aria-label': 'ariaLabel',
    'aria-level': 'ariaLevel',
    'aria-multiline': 'ariaMultiline',
    'aria-multiselectable': 'ariaMultiSelectable',
    'aria-orientation': 'ariaOrientation',
    'aria-pressed': 'ariaPressed',
    'aria-readonly': 'ariaReadonly',
    'aria-required': 'ariaRequired',
    'aria-selected': 'ariaSelected',
    'aria-sort': 'ariaSort',
    'aria-valuemax': 'ariaValueMax',
    'aria-valuemin': 'ariaValueMin',
    'aria-valuenow': 'ariaValueNow',
    'aria-valuetext': 'ariaValueText',
    'aria-live': 'ariaLive',
    'aria-relevant': 'ariaRelevant',
    'aria-atomic': 'ariaAtomic',
    'aria-busy': 'ariaBusy',
    'aria-dropeffect': 'ariaDropEffect',
    'aria-dragged': 'ariaDragged',
    'aria-activedescendant': 'ariaActiveDescendant',
    'aria-controls': 'ariaControls',
    'aria-describedby': 'ariaDescribedBy',
    'aria-flowto': 'ariaFlowTo',
    'aria-labelledby': 'ariaLabelledBy',
    'aria-owns': 'ariaOwns',
    'aria-posinset': 'ariaPosInSet',
    'aria-setsize': 'ariaSetSize',
};

export const HTML_TAG_BLACKLIST: { [tagname: string]: boolean } = {
    base: true,
    link: true,
    meta: true,
    script: true,
    style: true,
    title: true,
};

export const HTML_ATTRIBUTES_REVERSE_LOOKUP: { [attr: string]: string[] } = {
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
  'accesskey': [

  ],
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
  'class': [

  ],
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
  'contenteditable': [

  ],
  'contextmenu': [

  ],
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
  'data-*': [

  ],
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
  'dir': [

  ],
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
  'draggable': [

  ],
  'dropzone': [

  ],
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
  'hidden': [

  ],
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
  'id': [

  ],
  'integrity': [
    'link',
    'script',
  ],
  'ismap': [
    'img',
  ],
  'itemprop': [

  ],
  'keytype': [
    'keygen',
  ],
  'kind': [
    'track',
  ],
  'label': [
    'track',
  ],
  'lang': [

  ],
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
  'slot': [

  ],
  'span': [
    'col',
    'colgroup',
  ],
  'spellcheck': [

  ],
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
  'style': [

  ],
  'summary': [
    'table',
  ],
  'tabindex': [

  ],
  'target': [
    'a',
    'area',
    'base',
    'form',
  ],
  'title': [

  ],
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
