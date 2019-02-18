/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isBoolean, isString, isUndefined, isObject } from '../utils';
import { CompilerValidationErrors, invariant } from '@lwc/errors';

const DEFAULT_OPTIONS = {
    baseDir: '',
    isExplicitImport: false,
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

export interface CustomPropertiesConfig {
    allowDefinition?: boolean;
    resolution?: CustomPropertiesResolution;
}

export interface StylesheetConfig {
    customProperties?: CustomPropertiesConfig;
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

export interface CompilerOptions {
    name: string;
    namespace: string;
    files: BundleFiles;
    /**
     * An optional directory prefix that contains the specified components
     * files. Only used when the component that is the compiler's entry point.
     */
    baseDir?: string;
    stylesheetConfig?: StylesheetConfig;
    outputConfig?: OutputConfig;
    isExplicitImport?: boolean;
}

export interface NormalizedCompilerOptions extends CompilerOptions {
    outputConfig: NormalizedOutputConfig;
    stylesheetConfig: NormalizedStylesheetConfig;
    isExplicitImport: boolean;
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

export function validateNormalizedOptions(options: NormalizedCompilerOptions) {
    validateOptions(options);
    validateOutputConfig(options.outputConfig);
    validateStylesheetConfig(options.stylesheetConfig);
}

export function validateOptions(options: CompilerOptions) {
    invariant(!isUndefined(options), CompilerValidationErrors.MISSING_OPTIONS_OBJECT, [options]);
    invariant(isString(options.name), CompilerValidationErrors.INVALID_NAME_PROPERTY, [options.name]);
    invariant(isString(options.namespace), CompilerValidationErrors.INVALID_NAMESPACE_PROPERTY, [options.namespace]);

    invariant(
        !isUndefined(options.files) && !!Object.keys(options.files).length,
        CompilerValidationErrors.INVALID_FILES_PROPERTY,
    );

    for (const key of Object.keys(options.files)) {
        const value = options.files[key];
        invariant(!isUndefined(value) && isString(value), CompilerValidationErrors.UNEXPECTED_FILE_CONTENT, [
            key,
            value,
        ]);
    }

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
        const { allowDefinition, resolution } = customProperties;

        invariant(
            isUndefined(allowDefinition) || isBoolean(allowDefinition),
            CompilerValidationErrors.INVALID_ALLOWDEFINITION_PROPERTY,
            [allowDefinition],
        );

        if (!isUndefined(resolution)) {
            invariant(isObject(resolution), CompilerValidationErrors.INVALID_RESOLUTION_PROPERTY, [resolution]);

            const { type } = resolution;
            invariant(type === 'native' || type === 'module', CompilerValidationErrors.INVALID_TYPE_PROPERTY, [type]);
        }
    }
}

function isUndefinedOrBoolean(property: any): boolean {
    return isUndefined(property) || isBoolean(property);
}

function validateOutputConfig(config: OutputConfig) {
    invariant(isUndefinedOrBoolean(config.minify), CompilerValidationErrors.INVALID_MINIFY_PROPERTY, [config.minify]);

    invariant(isUndefinedOrBoolean(config.compat), CompilerValidationErrors.INVALID_COMPAT_PROPERTY, [config.compat]);

    invariant(isUndefinedOrBoolean(config.sourcemap), CompilerValidationErrors.INVALID_SOURCEMAP_PROPERTY, [
        config.sourcemap,
    ]);

    if (!isUndefined(config.env)) {
        invariant(isObject(config.env), CompilerValidationErrors.INVALID_ENV_PROPERTY, [config.env]);

        for (const [key, value] of Object.entries(config.env)) {
            invariant(KNOWN_ENV.has(key), CompilerValidationErrors.UNKNOWN_ENV_ENTRY_KEY, [key]);

            invariant(isString(value), CompilerValidationErrors.INVALID_ENV_ENTRY_VALUE, [key, value]);
        }
    }
}

export function normalizeOptions(options: CompilerOptions): NormalizedCompilerOptions {
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

    return {
        ...DEFAULT_OPTIONS,
        ...options,
        stylesheetConfig,
        outputConfig,
    };
}
