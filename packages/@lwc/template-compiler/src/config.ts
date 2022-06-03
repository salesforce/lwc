/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { TemplateErrors, invariant, generateCompilerError } from '@lwc/errors';
import { hasOwnProperty } from '@lwc/shared';
import { CustomRendererConfig } from './shared/renderer-hooks';
import { isCustomElementTag } from './shared/utils';

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
     * When true, the template compiler will not generate optimized code for static content.
     */
    disableStaticContentOptimization?: boolean;

    /**
    * Should sanitization hooks be provided for certain elements in the template?
     * Should provide hooks to inject a custom renderer for certain elements in the template?
     */
    provideCustomRendererHooks?: boolean;

    /**
     * Specification to use to determine which nodes in the template require custom renderer hooks.
     */
    customRendererConfig?: CustomRendererConfig;
}

export type NormalizedConfig = Required<Config>;

const AVAILABLE_OPTION_NAMES = new Set([
    'customRendererConfig',
    'experimentalComputedMemberExpression',
    'experimentalDynamicDirective',
    'preserveHtmlComments',
    'disableStaticContentOptimization',
    'provideCustomRendererHooks',
]);

function normalizeCustomRendererConfig(config: CustomRendererConfig): CustomRendererConfig {
    const normalizedConfig: CustomRendererConfig = {
        elements: config.elements.map((e) => {
            // Custom element cannot be allowed to have a custom renderer hook
            // The renderer is cascaded down from the owner(custom element) to all its child nodes who
            // do not have a renderer specified.
            invariant(
                !isCustomElementTag(e.tagName),
                TemplateErrors.CUSTOM_ELEMENT_TAG_DISALLOWED,
                [e.tagName]
            );
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

    if (config.customRendererConfig) {
        invariant(
            !!config.provideCustomRendererHooks,
            TemplateErrors.INVALID_CUSTOM_RENDERER_CONFIG
        );
    }

    const customRendererConfig = normalizeCustomRendererConfig(
        config.customRendererConfig ?? { elements: [], directives: [] }
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
        disableStaticContentOptimization: false,
        provideCustomRendererHooks: false,
        ...config,
        ...{ customRendererConfig },
    };
}
