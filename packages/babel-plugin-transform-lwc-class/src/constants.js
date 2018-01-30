const GLOBAL_ATTRIBUTE_SET = new Set([
    'role', 'accesskey', 'class', 'contenteditable', 'contextmenu', 'dir', 'draggable', 'dropzone', 'hidden',
    'id', 'itemprop', 'lang', 'slot', 'spellcheck', 'style', 'tabindex', 'title',
]);

const GLOBAL_ATTRIBUTE_PROP_SET = new Set([
     'accessKey', 'contentEditable', 'contextmenu', 'dir', 'draggable', 'hidden',
    'id',  'lang', 'spellcheck', 'tabIndex', 'title',
])

const HTML_ATTRIBUTE_SET = new Set([
    'role', 'class', 'itemprop', 'slot', 'spellcheck', 'style'
]);

const INVALID_LOWERCASE_ATTRIBUTE_PROP_SET = new Set([
    'accesskey', 'contenteditable', 'tabindex'
]);

module.exports = { GLOBAL_ATTRIBUTE_PROP_SET, HTML_ATTRIBUTE_SET, GLOBAL_ATTRIBUTE_SET, INVALID_LOWERCASE_ATTRIBUTE_PROP_SET };
