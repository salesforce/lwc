const GLOBAL_ATTRIBUTE_SET = new Set([
    'role', 'accesskey', 'class', 'contenteditable', 'contextmenu', 'dir', 'draggable', 'dropzone', 'hidden',
    'id', 'itemprop', 'lang', 'slot', 'spellcheck', 'style', 'tabindex', 'title',
]);

const LWC_PACKAGE_ALIAS = 'engine';

const LWC_PACKAGE_EXPORTS = {
    BASE_COMPONENT: 'Element',
    API_DECORATOR: 'api',
    TRACK_DECORATOR: 'track',
    WIRE_DECORATOR: 'wire',
}

const LWC_COMPONENT_PROPERTIES = {
    LABELS: 'labels',
    STYLE: 'style',
    RENDER: 'render',
    PUBLIC_PROPS: 'publicProps',
    PUBLIC_METHODS: 'publicMethods',
    WIRE: 'wire',
    TRACK: 'track',
}

module.exports = {
    GLOBAL_ATTRIBUTE_SET,

    LWC_PACKAGE_ALIAS,
    LWC_PACKAGE_EXPORTS,

    LWC_COMPONENT_PROPERTIES,
};
