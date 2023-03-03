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
     * Specification to use to determine which nodes in the template require custom renderer hooks.
     */
    customRendererConfig?: CustomRendererConfig;

    /**
     * Enable computed member expression in the template. eg:
     *    <template>
     *        {list[0].name}
     *    </template>
     */

    experimentalComputedMemberExpression?: boolean;

    /**
     * TODO [#3331]: remove usage of lwc:dynamic in 246
     *
     * Enable lwc:dynamic directive - Deprecated
     *
     * <x-foo lwc:dynamic={expr}>
     */
    experimentalDynamicDirective?: boolean;

    /**
     * When true, enables `lwc:is` directive.
     *
     * <lwc:component lwc:is={expr}>
     */
    enableDynamicComponents?: boolean;

    /**
     * When true, HTML comments in the template will be preserved.
     */
    preserveHtmlComments?: boolean;

    /**
     * When false, the template compiler will not generate optimized code for static content.
     */
    enableStaticContentOptimization?: boolean;

    /**
     * When true, enables `lwc:spread` directive.
     */
    enableLwcSpread?: boolean;

    /**
     * When true, enables usage of `lwc:slot-bind` and `lwc:slot-data` directives for declaring scoped slots
     */
    enableScopedSlots?: boolean;
}

export type NormalizedConfig = Required<Omit<Config, 'customRendererConfig'>> &
    Partial<Pick<Config, 'customRendererConfig'>>;

const AVAILABLE_OPTION_NAMES = new Set([
    'customRendererConfig',
    'enableLwcSpread',
    'enableScopedSlots',
    'enableStaticContentOptimization',
    'experimentalComputedMemberExpression',
    'experimentalDynamicDirective',
    'enableDynamicComponents',
    'preserveHtmlComments',
]);

function normalizeCustomRendererConfig(config: CustomRendererConfig): CustomRendererConfig {
    const tagNames: string[] = [];
    const normalizedConfig: CustomRendererConfig = {
        elements: config.elements.map((e) => {
            const tagName = e.tagName.toLowerCase();
            // Custom element cannot be allowed to have a custom renderer hook
            // The renderer is cascaded down from the owner(custom element) to all its child nodes who
            // do not have a renderer specified.
            invariant(!isCustomElementTag(tagName), TemplateErrors.CUSTOM_ELEMENT_TAG_DISALLOWED, [
                e.tagName,
            ]);

            tagNames.push(tagName);
            return {
                tagName,
                namespace: e.namespace?.toLowerCase(),
                attributes: e.attributes?.map((a) => a.toLowerCase()),
            };
        }),
        directives: config.directives.map((d) => d.toLowerCase()),
    };

    // Check for duplicate tag names
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

    const customRendererConfig = config.customRendererConfig
        ? normalizeCustomRendererConfig(config.customRendererConfig)
        : undefined;

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
        enableDynamicComponents: false,
        enableStaticContentOptimization: true,
        enableLwcSpread: false,
        enableScopedSlots: false,
        ...config,
        ...{ customRendererConfig },
    };
}
