/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { TemplateErrors, invariant, generateCompilerError } from '@lwc/errors';

export type Format = 'module' | 'function';

export interface Config {
    /**
     * Enable computed member expression in the template. eg:
     *    <template>
     *        {list[0].name}
     *    </template>
     */
    experimentalComputedMemberExpression?: boolean;
    /**
     * Parser option to enable data binding AST output.
     */
    experimentalDataBindingAST?: boolean;
    /**
     * Enable <x-foo lwc:directive={expr}>
     */
    experimentalDynamicDirective?: boolean;
    secure?: boolean;
}

export interface ResolvedConfig {
    experimentalComputedMemberExpression: boolean;
    experimentalDataBindingAST: boolean;
    experimentalDynamicDirective: boolean;
    secure: boolean;

    /**
     * Internal configuration for the output format of the template. Accepts:
     *  * "module": generates a ES module, and use import statements to reference component
     *    constructor.
     *  * "function": generates a function, and requires component constructor to be passed
     *    as parameter.
     */
    format: Format;
}

const DEFAULT_CONFIG: ResolvedConfig = {
    experimentalComputedMemberExpression: false,
    experimentalDataBindingAST: false,
    experimentalDynamicDirective: false,
    format: 'module',
    secure: false,
};

const AVAILABLE_OPTION_NAMES = new Set([
    'experimentalComputedMemberExpression',
    'experimentalDataBindingAST',
    'experimentalDynamicDirective',
    'secure',
    'stylesheetConfig',
]);

export function mergeConfig(config: Config): ResolvedConfig {
    invariant(
        config !== undefined && typeof config === 'object',
        TemplateErrors.OPTIONS_MUST_BE_OBJECT
    );

    for (const property in config) {
        if (!AVAILABLE_OPTION_NAMES.has(property) && config.hasOwnProperty(property)) {
            throw generateCompilerError(TemplateErrors.UNKNOWN_OPTION_PROPERTY, {
                messageArgs: [property],
            });
        }
    }

    return {
        ...DEFAULT_CONFIG,
        ...config,
    };
}
