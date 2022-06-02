/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { TemplateErrors, invariant, generateCompilerError } from '@lwc/errors';
import { hasOwnProperty } from '@lwc/shared';
import { SanitizeConfig } from './shared/sanitize';

export interface Config {
    /**
     * Enable computed member expression in the template. eg:
     *    <template>
     *        {list[0].name}
     *    </template>
     */
    experimentalComputedMemberExpression?: boolean;
    /**
     * Enable <x-foo lwc:directive={expr}>
     */
    experimentalDynamicDirective?: boolean;

    /**
     * When true, HTML comments in the template will be preserved.
     */
    preserveHtmlComments?: boolean;

    /**
     * Should sanitization hooks be provided for certain elements in the template?
     */
    shouldSanitize?: boolean;

    /**
     * Specification to use to determine which nodes in the template require sanitization.
     */
    sanitizeConfig?: SanitizeConfig;
}

export type NormalizedConfig = Required<Config>;

const AVAILABLE_OPTION_NAMES = new Set([
    'experimentalComputedMemberExpression',
    'experimentalDynamicDirective',
    'preserveHtmlComments',
    'sanitizeConfig',
    'shouldSanitize',
]);

function normalizeSanitizeConfig(config: SanitizeConfig): SanitizeConfig {
    const normalizedConfig: SanitizeConfig = {
        elements: config.elements.map((e) => {
            return {
                tagName: e.tagName.toLowerCase(),
                attributes: e.attributes?.map((a) => a.toLowerCase()),
            };
        }),
        directives: config.directives.map((d) => d.toLowerCase()),
    };
    if (config.rendererModule) {
        normalizedConfig.rendererModule = config.rendererModule;
    }

    // Check for duplicate tag names
    const tagNames: string[] = normalizedConfig.elements.map((e) => e.tagName);
    const dupTagNames: string[] = tagNames.filter(
        (item, index) => index !== tagNames.indexOf(item)
    );
    invariant(dupTagNames.length == 0, TemplateErrors.DUPLICATE_ELEMENT_ENTRY, [
        dupTagNames.join(', '),
    ]);

    return normalizedConfig;
}

export function normalizeConfig(config: Config): NormalizedConfig {
    invariant(
        config !== undefined && typeof config === 'object',
        TemplateErrors.OPTIONS_MUST_BE_OBJECT
    );

    if (config.sanitizeConfig) {
        invariant(!!config.shouldSanitize, TemplateErrors.INVALID_SANITIZE_CONFIG);
    }

    const sanitizeConfig = normalizeSanitizeConfig(
        config.sanitizeConfig ?? { elements: [], directives: [] }
    );

    for (const property in config) {
        if (!AVAILABLE_OPTION_NAMES.has(property) && hasOwnProperty.call(config, property)) {
            throw generateCompilerError(TemplateErrors.UNKNOWN_OPTION_PROPERTY, {
                messageArgs: [property],
            });
        }
    }

    return {
        preserveHtmlComments: false,
        experimentalComputedMemberExpression: false,
        experimentalDynamicDirective: false,
        shouldSanitize: false,
        ...config,
        ...{ sanitizeConfig },
    };
}
