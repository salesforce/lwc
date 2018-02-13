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
const LWC_PACKAGE_ALIAS = 'engine';

const LWC_PACKAGE_EXPORTS = {
    BASE_COMPONENT: 'Element',
    API_DECORATOR: 'api',
    TRACK_DECORATOR: 'track',
    WIRE_DECORATOR: 'wire',
}

const LWC_COMPONENT_PROPERTIES = {
    STYLE: 'style',
    RENDER: 'render',
    PUBLIC_PROPS: 'publicProps',
    PUBLIC_METHODS: 'publicMethods',
    WIRE: 'wire',
    TRACK: 'track',
}

const DECORATOR_TYPES = {
    PROPERTY: 'property',
    GETTER: 'getter',
    SETTER: 'setter',
    METHOD: 'method'
}

module.exports = {
    GLOBAL_ATTRIBUTE_SET,

    LWC_PACKAGE_ALIAS,
    LWC_PACKAGE_EXPORTS,

    LWC_COMPONENT_PROPERTIES,

    DECORATOR_TYPES,
};
