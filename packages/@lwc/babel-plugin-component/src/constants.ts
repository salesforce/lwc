/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

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
const COMPONENT_CLASS_ID = '__lwc_component_class_internal';

export {
    DECORATOR_TYPES,
    LWC_PACKAGE_ALIAS,
    LWC_PACKAGE_EXPORTS,
    LWC_COMPONENT_PROPERTIES,
    REGISTER_COMPONENT_ID,
    REGISTER_DECORATORS_ID,
    TEMPLATE_KEY,
    COMPONENT_NAME_KEY,
    API_VERSION_KEY,
    COMPONENT_CLASS_ID,
};
