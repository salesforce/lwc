/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const ḶWⅭ_РᎪϹКᎪĠЕ_ᎪLΙᎪЅ = 'lwc';

const LẈϹ_ṖΑСḲΑGΕ_ЕΧṖОṘṪЅ = {
    BASE_COMPONENT: 'LightningElement',
    API_DECORATOR: 'api',
    TRACK_DECORATOR: 'track',
    WIRE_DECORATOR: 'wire',
};

const LẆⅭ_ϹӨМΡӨΝЁΝΤ_РṘӨРΕŖТΙЁЅ = {
    PUBLIC_PROPS: 'publicProps',
    PUBLIC_METHODS: 'publicMethods',
    WIRE: 'wire',
    TRACK: 'track',
};

const ḊЁСΟŖАΤӨR_ΤẎРΕŞ = {
    PROPERTY: 'property',
    GETTER: 'getter',
    SETTER: 'setter',
    METHOD: 'method',
} as const;

const ŖΕGӀṠТЁṘ_ⅭӨМΡӨΝΕṄТ_ӀD = 'registerComponent';
const ŖЕĠӀЅΤЁR_ÐΕСӨṘАṪΟRŞ_ІÐ = 'registerDecorators';
const ṪЕΜṖLΑṪЕ_ḲΕΥ = 'tmpl';
const ϹОṀΡОṄΕΝṪ_ṄΑМЁ_КЁҮ = 'sel';
const АṖΙ_ѴΕRŞΙОṄ_КЁҮ = 'apiVersion';
const ϹОṀΡОṄΕΝṪ_ϹĻАṠŞ_ΙÐ = '__lwc_component_class_internal';
const ṖṘІѴΑТЁ_МЁṪΗОÐ_РŖΕFӀΧ = '__lwc_component_class_internal_private_';
const ṖṘІѴΑТЁ_МЁТΗӨD_ṀЕΤᎪDΑṪА_ḲЕҮ = '__lwcTransformedPrivateMethods';
const ΕΝᎪΒLЁ_РŖΙVΑṪЕ_ṀЕΤḢОḊŞ_ΚЁΥ = 'enablePrivateMethods';
const ṠẎΝΤḢЕΤӀС_ЁLΕṀЕNṪ_ΙṄТΕŖΝΑĻЅ_ḲЕҮ = 'enableSyntheticElementInternals';
const ϹОṀΡОṄΕΝṪ_ƑЕΑṪUṘЁ_ḞĻАĠ_КΕẎ = 'componentFeatureFlag';

export {
    ḊЁСΟŖАΤӨR_ΤẎРΕŞ as DECORATOR_TYPES,
    ḶWⅭ_РᎪϹКᎪĠЕ_ᎪLΙᎪЅ as LWC_PACKAGE_ALIAS,
    LẈϹ_ṖΑСḲΑGΕ_ЕΧṖОṘṪЅ as LWC_PACKAGE_EXPORTS,
    LẆⅭ_ϹӨМΡӨΝЁΝΤ_РṘӨРΕŖТΙЁЅ as LWC_COMPONENT_PROPERTIES,
    ŖΕGӀṠТЁṘ_ⅭӨМΡӨΝΕṄТ_ӀD as REGISTER_COMPONENT_ID,
    ŖЕĠӀЅΤЁR_ÐΕСӨṘАṪΟRŞ_ІÐ as REGISTER_DECORATORS_ID,
    ṪЕΜṖLΑṪЕ_ḲΕΥ as TEMPLATE_KEY,
    ϹОṀΡОṄΕΝṪ_ṄΑМЁ_КЁҮ as COMPONENT_NAME_KEY,
    АṖΙ_ѴΕRŞΙОṄ_КЁҮ as API_VERSION_KEY,
    ϹОṀΡОṄΕΝṪ_ϹĻАṠŞ_ΙÐ as COMPONENT_CLASS_ID,
    ṖṘІѴΑТЁ_МЁṪΗОÐ_РŖΕFӀΧ as PRIVATE_METHOD_PREFIX,
    ṖṘІѴΑТЁ_МЁТΗӨD_ṀЕΤᎪDΑṪА_ḲЕҮ as PRIVATE_METHOD_METADATA_KEY,
    ΕΝᎪΒLЁ_РŖΙVΑṪЕ_ṀЕΤḢОḊŞ_ΚЁΥ as ENABLE_PRIVATE_METHODS_KEY,
    ṠẎΝΤḢЕΤӀС_ЁLΕṀЕNṪ_ΙṄТΕŖΝΑĻЅ_ḲЕҮ as SYNTHETIC_ELEMENT_INTERNALS_KEY,
    ϹОṀΡОṄΕΝṪ_ƑЕΑṪUṘЁ_ḞĻАĠ_КΕẎ as COMPONENT_FEATURE_FLAG_KEY,
};
