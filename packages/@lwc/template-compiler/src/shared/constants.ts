/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export const SECURE_REGISTER_TEMPLATE_METHOD_NAME = 'registerTemplate';
export const LWC_MODULE_NAME = 'lwc';
export const TEMPLATE_MODULES_PARAMETER: string = 'modules';

export const TEMPLATE_FUNCTION_NAME: string = 'tmpl';

export const TEMPLATE_PARAMS: { [label: string]: string } = {
    INSTANCE: '$cmp',
    API: '$api',
    SLOT_SET: '$slotset',
    CONTEXT: '$ctx',
};
