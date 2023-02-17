/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { CompilerValidationErrors, invariant } from '@lwc/errors';
import { isUndefined, isBoolean, isObject, getAPIVersionFromNumber } from '@lwc/shared';
import { CustomRendererConfig } from '@lwc/template-compiler';

type RecursiveRequired<T> = {
    [P in keyof T]-?: RecursiveRequired<T[P]>;
};

const DEFAULT_OPTIONS = {
    isExplicitImport: false,
    preserveHtmlComments: false,
    enableStaticContentOptimization: true,
    disableSyntheticShadowSupport: false,
};

const DEFAULT_DYNAMIC_CMP_CONFIG: Required<DynamicComponentConfig> = {
    loader: '',
    strictSpecifier: true,
};

const DEFAULT_STYLESHEET_CONFIG: RecursiveRequired<StylesheetConfig> = {
    customProperties: {
        resolution: { type: 'native' },
    },
};

const DEFAULT_OUTPUT_CONFIG: Required<OutputConfig> = {
    minify: false,
    sourcemap: false,
};

export type CustomPropertiesResolution = { type: 'native' } | { type: 'module'; name: string };

export interface StylesheetConfig {
    customProperties?: {
        resolution?: CustomPropertiesResolution;
    };
}

export interface OutputConfig {
    /**
     * If `true` a source map is generated for the transformed file.
     * @default false
     */
    sourcemap?: boolean;

    /**
     * @deprecated The minify property has no effect on the generated output.
     */
    minify?: boolean;
}

export interface DynamicComponentConfig {
    loader?: string;
    strictSpecifier?: boolean;
}

export interface TransformOptions {
    name?: string;
    namespace?: string;
    stylesheetConfig?: StylesheetConfig;
    experimentalDynamicComponent?: DynamicComponentConfig;
    outputConfig?: OutputConfig;
    isExplicitImport?: boolean;
    preserveHtmlComments?: boolean;
    scopedStyles?: boolean;
    enableStaticContentOptimization?: boolean;
    customRendererConfig?: CustomRendererConfig;
    enableLwcSpread?: boolean;
    enableScopedSlots?: boolean;
    disableSyntheticShadowSupport?: boolean;
    apiVersion?: number;
}

type RequiredTransformOptions = Omit<
    TransformOptions,
    | 'name'
    | 'namespace'
    | 'scopedStyles'
    | 'customRendererConfig'
    | 'enableLwcSpread'
    | 'enableScopedSlots'
>;
export interface NormalizedTransformOptions extends RecursiveRequired<RequiredTransformOptions> {
    name?: string;
    namespace?: string;
    scopedStyles?: boolean;
    customRendererConfig?: CustomRendererConfig;
    enableLwcSpread?: boolean;
    enableScopedSlots?: boolean;
}

export function validateTransformOptions(options: TransformOptions): NormalizedTransformOptions {
    validateOptions(options);
    return normalizeOptions(options);
}

function validateOptions(options: TransformOptions) {
    invariant(!isUndefined(options), CompilerValidationErrors.MISSING_OPTIONS_OBJECT, [options]);

    if (!isUndefined(options.stylesheetConfig)) {
        validateStylesheetConfig(options.stylesheetConfig);
    }

    if (!isUndefined(options.outputConfig)) {
        validateOutputConfig(options.outputConfig);
    }
}

function validateStylesheetConfig(config: StylesheetConfig) {
    const { customProperties } = config;

    if (!isUndefined(customProperties)) {
        const { resolution } = customProperties;

        if (!isUndefined(resolution)) {
            invariant(isObject(resolution), CompilerValidationErrors.INVALID_RESOLUTION_PROPERTY, [
                resolution,
            ]);

            const { type } = resolution;
            invariant(
                type === 'native' || type === 'module',
                CompilerValidationErrors.INVALID_TYPE_PROPERTY,
                [type]
            );
        }
    }
}

function isUndefinedOrBoolean(property: any): boolean {
    return isUndefined(property) || isBoolean(property);
}

function validateOutputConfig(config: OutputConfig) {
    invariant(
        isUndefinedOrBoolean(config.sourcemap),
        CompilerValidationErrors.INVALID_SOURCEMAP_PROPERTY,
        [config.sourcemap]
    );

    if (!isUndefined(config.minify)) {
        // eslint-disable-next-line no-console
        console.warn(
            `"OutputConfig.minify" property is deprecated. The value doesn't impact the compilation and can safely be removed.`
        );
    }
}

function normalizeOptions(options: TransformOptions): NormalizedTransformOptions {
    const outputConfig: Required<OutputConfig> = {
        ...DEFAULT_OUTPUT_CONFIG,
        ...options.outputConfig,
    };

    const stylesheetConfig: RecursiveRequired<StylesheetConfig> = {
        customProperties: {
            ...DEFAULT_STYLESHEET_CONFIG.customProperties,
            ...(options.stylesheetConfig && options.stylesheetConfig.customProperties),
        },
    };

    const experimentalDynamicComponent: Required<DynamicComponentConfig> = {
        ...DEFAULT_DYNAMIC_CMP_CONFIG,
        ...options.experimentalDynamicComponent,
    };

    const apiVersion = getAPIVersionFromNumber(options.apiVersion);

    return {
        ...DEFAULT_OPTIONS,
        ...options,
        stylesheetConfig,
        outputConfig,
        experimentalDynamicComponent,
        apiVersion,
    };
}
