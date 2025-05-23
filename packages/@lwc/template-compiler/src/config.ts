/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { TemplateErrors, invariant, generateCompilerError } from '@lwc/errors';
import { getAPIVersionFromNumber, hasOwnProperty } from '@lwc/shared';
import { isCustomElementTag } from './shared/utils';
import type { CustomRendererConfig } from './shared/renderer-hooks';
import type { InstrumentationObject } from '@lwc/errors';

export interface Config {
    /** The name of the component. For example, the name in `<my-component>` is `"component"`. */
    name?: string;

    /** The namespace of the component. For example, the namespace in `<my-component>` is `"my"`. */
    namespace?: string;

    /**
     * Specification to use to determine which nodes in the template require custom renderer hooks.
     */
    customRendererConfig?: CustomRendererConfig;

    /**
     * Enable computed member expression in the template.
     * @example
     * <template>
     *     {list[0].name}
     * </template>
     */
    experimentalComputedMemberExpression?: boolean;

    // TODO [#3370]: remove experimental template expression flag
    /**
     * Enable use of (a subset of) JavaScript expressions in place of template bindings.
     * @example
     * <template>
     *     <input
     *         attr={complex ?? expressions()}
     *         onchange={({ target }) => componentMethod(target.value)}
     *     >
     *         Hey there {inAustralia ? 'mate' : 'friend'}
     *     </input>
     * </template>
     */
    experimentalComplexExpressions?: boolean;

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
     * @deprecated Spread operator is now always enabled.
     */
    enableLwcSpread?: boolean;

    /**
     * When true, enables `lwc:on` directive.
     */
    enableLwcOn?: boolean;

    /**
     * Config to use to collect metrics and logs
     */
    instrumentation?: InstrumentationObject;

    /**
     * The API version to associate with the compiled template
     */
    apiVersion?: number;

    /** Set to true if synthetic shadow DOM support is not needed, which can result in smaller/faster output. */
    disableSyntheticShadowSupport?: boolean;
}
type OptionalConfigNames = 'customRendererConfig' | 'instrumentation' | 'namespace' | 'name';
type RequiredConfigOptions = Required<Omit<Config, OptionalConfigNames>>;
type OptionalConfigOptions = Partial<Pick<Config, OptionalConfigNames>>;
export type NormalizedConfig = RequiredConfigOptions & OptionalConfigOptions;

const AVAILABLE_OPTION_NAMES = new Set([
    'apiVersion',
    'customRendererConfig',
    'enableLwcSpread',
    'enableLwcOn',
    'enableStaticContentOptimization',
    // TODO [#3370]: remove experimental template expression flag
    'experimentalComplexExpressions',
    'experimentalComputedMemberExpression',
    'experimentalDynamicDirective',
    'enableDynamicComponents',
    'preserveHtmlComments',
    'instrumentation',
    'namespace',
    'name',
    'disableSyntheticShadowSupport',
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

    const instrumentation = config.instrumentation || undefined;

    for (const property in config) {
        if (!AVAILABLE_OPTION_NAMES.has(property) && hasOwnProperty.call(config, property)) {
            throw generateCompilerError(TemplateErrors.UNKNOWN_OPTION_PROPERTY, {
                messageArgs: [property],
            });
        }
    }

    const apiVersion = getAPIVersionFromNumber(config.apiVersion);

    return {
        preserveHtmlComments: false,
        experimentalComputedMemberExpression: false,
        // TODO [#3370]: remove experimental template expression flag
        experimentalComplexExpressions: false,
        experimentalDynamicDirective: false,
        enableDynamicComponents: false,
        enableStaticContentOptimization: true,
        enableLwcSpread: true,
        enableLwcOn: false,
        disableSyntheticShadowSupport: false,
        ...config,
        apiVersion, // overrides the config apiVersion
        ...{ customRendererConfig },
        ...{ instrumentation },
    };
}
