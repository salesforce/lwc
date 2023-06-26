/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// This set is for attributes that have a camel cased property name
// For example, div.tabIndex.
// We do not want users to define @api properties with these names
// Because the template will never call them. It'll always call the camel
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

const LWC_COMPONENT_PROPERTIES = {
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
} as const;

const REGISTER_COMPONENT_ID = 'registerComponent';
const REGISTER_DECORATORS_ID = 'registerDecorators';
const TEMPLATE_KEY = 'tmpl';
const COMPONENT_NAME_KEY = 'sel';
const API_VERSION_KEY = 'apiVersion';

export {
    AMBIGUOUS_PROP_SET,
    DECORATOR_TYPES,
    DISALLOWED_PROP_SET,
    LWC_PACKAGE_ALIAS,
    LWC_PACKAGE_EXPORTS,
    LWC_COMPONENT_PROPERTIES,
    REGISTER_COMPONENT_ID,
    REGISTER_DECORATORS_ID,
    TEMPLATE_KEY,
    COMPONENT_NAME_KEY,
    API_VERSION_KEY,
};
