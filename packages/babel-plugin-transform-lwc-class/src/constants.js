function globalAttributeObject(propName) {
    return {
        propName,
    }
}

const GLOBAL_ATTRIBUTE_MAP = new Map([
    ['role', globalAttributeObject('role')],
    ['accesskey', globalAttributeObject('accessKey')],
    ['class', globalAttributeObject('class')],
    ['contenteditable', globalAttributeObject('contentEditable')],
    ['contextmenu', globalAttributeObject('contextmenu')],
    ['dir', globalAttributeObject('dir')],
    ['draggable', globalAttributeObject('draggable')],
    ['dropzone', globalAttributeObject('dropzone')],
    ['hidden', globalAttributeObject('hidden')],
    ['id', globalAttributeObject('id')],
    ['itemprop', globalAttributeObject('itemprop')],
    ['lang', globalAttributeObject('lang')],
    ['slot', globalAttributeObject('slot')],
    ['spellcheck', globalAttributeObject('spellcheck')],
    ['style', globalAttributeObject('style')],
    ['tabindex', globalAttributeObject('tabIndex')],
    ['title', globalAttributeObject('title')],
]);

const AMBIGIOUS_PROP_SET = new Set([
    'accesskey', 'contenteditable', 'contextmenu', 'tabindex', 'maxlength', 'maxvalue'
]);

const DISALLOWED_PROP_SET = new Set([
    'class', 'slot', 'style'
]);

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
    AMBIGIOUS_PROP_SET,
    DISALLOWED_PROP_SET,
    GLOBAL_ATTRIBUTE_MAP,

    LWC_PACKAGE_ALIAS,
    LWC_PACKAGE_EXPORTS,

    LWC_COMPONENT_PROPERTIES,

    DECORATOR_TYPES,
};
