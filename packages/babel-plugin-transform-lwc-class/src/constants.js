const GLOBAL_ATTRIBUTE_SET = new Set([
    'role', 'accesskey', 'class', 'contenteditable', 'contextmenu', 'dir', 'draggable', 'dropzone', 'hidden',
    'id', 'itemprop', 'lang', 'slot', 'spellcheck', 'style', 'tabindex', 'title',
]);

const RAPTOR_PACKAGE_ALIAS = 'engine';

const RAPTOR_PACKAGE_EXPORTS = {
    BASE_COMPONENT: 'Element',
    API_DECORATOR: 'api',
    TRACK_DECORATOR: 'track',
    WIRE_DECORATOR: 'wire',
}

const RAPTOR_COMPONENT_PROPERTIES = {
    LABELS: 'labels',
    STYLE: 'style',
    RENDER: 'render',
    PUBLIC_PROPS: 'publicProps',
    PUBLIC_METHODS: 'publicMethods',
}

module.exports = {
    GLOBAL_ATTRIBUTE_SET,

    RAPTOR_PACKAGE_ALIAS,
    RAPTOR_PACKAGE_EXPORTS,

    RAPTOR_COMPONENT_PROPERTIES,
};
