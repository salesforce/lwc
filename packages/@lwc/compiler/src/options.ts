/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isBoolean, isString, isUndefined, isObject } from './utils';
import { CompilerValidationErrors, invariant } from '@lwc/errors';

const DEFAULT_OPTIONS = {
    baseDir: '',
    isExplicitImport: false,
    forceNativeShadow: false,
};

const DEFAULT_DYNAMIC_CMP_CONFIG: NormalizedDynamicComponentConfig = {
    loader: '',
    strictSpecifier: true,
};

const DEFAULT_STYLESHEET_CONFIG: NormalizedStylesheetConfig = {
    customProperties: {
        allowDefinition: false,
        resolution: { type: 'native' },
    },
};

const DEFAULT_OUTPUT_CONFIG: NormalizedOutputConfig = {
    env: {},
    minify: false,
    compat: false,
    sourcemap: false,
};

const KNOWN_ENV = new Set(['NODE_ENV']);

export type CustomPropertiesResolution = { type: 'native' } | { type: 'module'; name: string };

export interface StylesheetConfig {
    customProperties?: {
        allowDefinition?: boolean;
        resolution?: CustomPropertiesResolution;
    };
}

export interface OutputConfig {
    compat?: boolean;
    minify?: boolean;
    sourcemap?: boolean;
    env?: {
        NODE_ENV?: string;
    };
}

export interface BundleFiles {
    [filename: string]: string;
}

export type DynamicComponentConfig = Partial<NormalizedDynamicComponentConfig>;

export interface NormalizedDynamicComponentConfig {
    loader: string;
    strictSpecifier: boolean;
}

export interface TransformOptions {
    name?: string;
    namespace?: string;
    /**
     * An optional directory prefix that contains the specified components
     * files. Only used when the component that is the compiler's entry point.
     */
    baseDir?: string;
    stylesheetConfig?: StylesheetConfig;
    experimentalDynamicComponent?: DynamicComponentConfig;
    forceNativeShadow?: boolean;
    outputConfig?: OutputConfig;
    isExplicitImport?: boolean;
}

export interface CompileOptions extends TransformOptions {
    files: BundleFiles;
}

export interface NormalizedTransformOptions extends TransformOptions {
    outputConfig: NormalizedOutputConfig;
    stylesheetConfig: NormalizedStylesheetConfig;
    experimentalDynamicComponent: NormalizedDynamicComponentConfig;
    isExplicitImport: boolean;
    forceNativeShadow: boolean;
}

export interface NormalizedCompileOptions extends CompileOptions {
    name: string;
    namespace: string;
    outputConfig: NormalizedOutputConfig;
    stylesheetConfig: NormalizedStylesheetConfig;
    experimentalDynamicComponent: NormalizedDynamicComponentConfig;
    isExplicitImport: boolean;
    forceNativeShadow: boolean;
}

export interface NormalizedStylesheetConfig extends StylesheetConfig {
    customProperties: {
        allowDefinition: boolean;
        resolution: CustomPropertiesResolution;
    };
}

export interface NormalizedOutputConfig extends OutputConfig {
    compat: boolean;
    minify: boolean;
    sourcemap: boolean;
    env: {
        NODE_ENV?: string;
    };
}

export function validateNormalizedCompileOptions(options: NormalizedCompileOptions) {
    validateOptions(options);
    validateOutputConfig(options.outputConfig);
    validateStylesheetConfig(options.stylesheetConfig);
}

export function validateOptions(options: TransformOptions) {
    invariant(!isUndefined(options), CompilerValidationErrors.MISSING_OPTIONS_OBJECT, [options]);

    if (!isUndefined(options.stylesheetConfig)) {
        validateStylesheetConfig(options.stylesheetConfig);
    }

    if (!isUndefined(options.outputConfig)) {
        validateOutputConfig(options.outputConfig);
    }
}

export function validateCompileOptions(options: CompileOptions): NormalizedCompileOptions {
    validateOptions(options);

    invariant(isString(options.name), CompilerValidationErrors.INVALID_NAME_PROPERTY, [
        options.name,
    ]);

    invariant(isString(options.namespace), CompilerValidationErrors.INVALID_NAMESPACE_PROPERTY, [
        options.namespace,
    ]);

    invariant(
        !isUndefined(options.files) && !!Object.keys(options.files).length,
        CompilerValidationErrors.INVALID_FILES_PROPERTY
    );

    for (const key of Object.keys(options.files)) {
        const value = options.files[key];
        invariant(
            !isUndefined(value) && isString(value),
            CompilerValidationErrors.UNEXPECTED_FILE_CONTENT,
            [key, value]
        );
    }

    return normalizeOptions(options) as NormalizedCompileOptions;
}

export function validateTransformOptions(options: TransformOptions): NormalizedTransformOptions {
    validateOptions(options);
    return normalizeOptions(options);
}

function validateStylesheetConfig(config: StylesheetConfig) {
    const { customProperties } = config;

    if (!isUndefined(customProperties)) {
        const { allowDefinition, resolution } = customProperties;

        invariant(
            isUndefined(allowDefinition) || isBoolean(allowDefinition),
            CompilerValidationErrors.INVALID_ALLOWDEFINITION_PROPERTY,
            [allowDefinition]
        );

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
        isUndefinedOrBoolean(config.minify),
        CompilerValidationErrors.INVALID_MINIFY_PROPERTY,
        [config.minify]
    );

    invariant(
        isUndefinedOrBoolean(config.compat),
        CompilerValidationErrors.INVALID_COMPAT_PROPERTY,
        [config.compat]
    );

    invariant(
        isUndefinedOrBoolean(config.sourcemap),
        CompilerValidationErrors.INVALID_SOURCEMAP_PROPERTY,
        [config.sourcemap]
    );

    if (!isUndefined(config.env)) {
        invariant(isObject(config.env), CompilerValidationErrors.INVALID_ENV_PROPERTY, [
            config.env,
        ]);

        for (const [key, value] of Object.entries(config.env)) {
            invariant(KNOWN_ENV.has(key), CompilerValidationErrors.UNKNOWN_ENV_ENTRY_KEY, [key]);

            invariant(isString(value), CompilerValidationErrors.INVALID_ENV_ENTRY_VALUE, [
                key,
                value,
            ]);
        }
    }
}

function normalizeOptions(options: TransformOptions): NormalizedTransformOptions {
    const outputConfig: NormalizedOutputConfig = {
        ...DEFAULT_OUTPUT_CONFIG,
        ...options.outputConfig,
    };

    const stylesheetConfig: NormalizedStylesheetConfig = {
        customProperties: {
            ...DEFAULT_STYLESHEET_CONFIG.customProperties,
            ...(options.stylesheetConfig && options.stylesheetConfig.customProperties),
        },
    };

    const experimentalDynamicComponent = {
        ...DEFAULT_DYNAMIC_CMP_CONFIG,
        ...options.experimentalDynamicComponent,
    };

    return {
        ...DEFAULT_OPTIONS,
        ...options,
        stylesheetConfig,
        outputConfig,
        experimentalDynamicComponent,
    };
}
