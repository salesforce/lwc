/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// This set is for attributes that have a camel cased property name
// For example, div.tabIndex.
// We do not want users to define @api properties with these names
// Because the template will never call them. It'll alawys call the camel
// cased version.
const AMBIGUOUS_PROP_SET = new Map([
    ['bgcolor', 'bgColor'],
    ['accesskey', 'accessKey'],
    ['contenteditable', 'contentEditable'],
    ['contextmenu', 'contextMenu'],
    ['tabindex', 'tabIndex'],
    ['maxlength', 'maxLength'],
    ['maxvalue', 'maxValue'],
]);

// This set is for attributes that can never be defined
// by users on their components.
// We throw for these.
const DISALLOWED_PROP_SET = new Set(['is', 'class', 'slot', 'style']);

const LWC_PACKAGE_ALIAS = 'lwc';

const LWC_PACKAGE_EXPORTS = {
    BASE_COMPONENT: 'LightningElement',
    API_DECORATOR: 'api',
    TRACK_DECORATOR: 'track',
    WIRE_DECORATOR: 'wire',
};

const LWC_API_WHITELIST = new Set([
    'buildCustomElementConstructor',
    'createElement',
    'getComponentDef',
    'getComponentConstructor',
    'isComponentConstructor',
    'readonly',
    'register',
    'unwrap',
    ...Object.values(LWC_PACKAGE_EXPORTS),
]);

const LWC_DECORATORS = [
    LWC_PACKAGE_EXPORTS.API_DECORATOR,
    LWC_PACKAGE_EXPORTS.TRACK_DECORATOR,
    LWC_PACKAGE_EXPORTS.WIRE_DECORATOR,
];

const LWC_COMPONENT_PROPERTIES = {
    STYLE: 'style',
    RENDER: 'render',
    PUBLIC_PROPS: 'publicProps',
    PUBLIC_METHODS: 'publicMethods',
    WIRE: 'wire',
    TRACK: 'track',
};

const DECORATOR_TYPES = {
    PROPERTY: 'property',
    GETTER: 'getter',
    SETTER: 'setter',
    METHOD: 'method',
};

module.exports = {
    AMBIGUOUS_PROP_SET,
    DISALLOWED_PROP_SET,
    LWC_DECORATORS,
    LWC_PACKAGE_ALIAS,
    LWC_PACKAGE_EXPORTS,
    LWC_API_WHITELIST,
    LWC_COMPONENT_PROPERTIES,
    DECORATOR_TYPES,
};
