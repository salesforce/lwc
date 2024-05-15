/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ElementDirectiveName } from './types';

export const SECURE_REGISTER_TEMPLATE_METHOD_NAME = 'registerTemplate';
export const PARSE_FRAGMENT_METHOD_NAME = 'parseFragment';
export const PARSE_SVG_FRAGMENT_METHOD_NAME = 'parseSVGFragment';
export const RENDERER = 'renderer';
export const LWC_MODULE_NAME = 'lwc';
export const TEMPLATE_MODULES_PARAMETER: string = 'modules';
export const FREEZE_TEMPLATE = 'freezeTemplate';
export const IMPLICIT_STYLESHEETS = '_implicitStylesheets';
export const IMPLICIT_SCOPED_STYLESHEETS = '_implicitScopedStylesheets';

export const IMPLICIT_STYLESHEET_IMPORTS = [IMPLICIT_STYLESHEETS, IMPLICIT_SCOPED_STYLESHEETS];

export const TEMPLATE_FUNCTION_NAME: string = 'tmpl';

export const TEMPLATE_PARAMS: { [label: string]: string } = {
    INSTANCE: '$cmp',
    API: '$api',
    SLOT_SET: '$slotset',
    CONTEXT: '$ctx',
};

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

// Subset of LWC template directives that can safely be statically optimized
export const STATIC_SAFE_DIRECTIVES: Set<keyof typeof ElementDirectiveName> = new Set([
    'Ref',
    'Key',
]);
