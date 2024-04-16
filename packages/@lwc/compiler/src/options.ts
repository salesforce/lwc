/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { InstrumentationObject, CompilerValidationErrors, invariant } from '@lwc/errors';
import { isUndefined, isBoolean, getAPIVersionFromNumber } from '@lwc/shared';
import { CustomRendererConfig } from '@lwc/template-compiler';

/**
 * Flag indicating that a warning about still using the deprecated `enableLwcSpread`
 * compiler option has already been logged to the `console`.
 */
let alreadyWarnedAboutLwcSpread = false;
/**
 * Flag indicating that a warning about still using the deprecated `stylesheetConfig`
 * compiler option has already been logged to the `console`.
 */
let alreadyWarnedOnStylesheetConfig = false;

type RecursiveRequired<T> = {
    [P in keyof T]-?: RecursiveRequired<T[P]>;
};

const DEFAULT_OPTIONS = {
    isExplicitImport: false,
    preserveHtmlComments: false,
    enableStaticContentOptimization: true,
    // TODO [#3370]: remove experimental template expression flag
    experimentalComplexExpressions: false,
    disableSyntheticShadowSupport: false,
    enableLightningWebSecurityTransforms: false,
};

const DEFAULT_DYNAMIC_IMPORT_CONFIG: Required<DynamicImportConfig> = {
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

/**
 * @deprecated Custom property transforms are deprecated because IE11 and other legacy browsers are no longer supported.
 */
// TODO [#3266]: Remove StylesheetConfig as part of breaking change wishlist
export interface StylesheetConfig {
    customProperties?: {
        resolution?: CustomPropertiesResolution;
    };
}

export interface OutputConfig {
    /**
     * If `true` a source map is generated for the transformed file.
     * If `inline`, an inline source map is generated and appended to the end of the transformed file.
     * @default false
     */
    sourcemap?: boolean | 'inline';

    /**
     * @deprecated The minify property has no effect on the generated output.
     */
    minify?: boolean;
}

export interface DynamicImportConfig {
    loader?: string;
    strictSpecifier?: boolean;
}

/**
 * Options used to change the behavior of the compiler. At a minimum, `name` and `namespace` are
 * required.
 */
export interface TransformOptions {
    /** The name of the component. For example, the name in `<my-component>` is `"component"`. */
    name?: string;
    /** The namespace of the component. For example, the namespace in `<my-component>` is `"my"`. */
    namespace?: string;
    /** @deprecated Ignored by compiler. */
    stylesheetConfig?: StylesheetConfig;
    // TODO [#3331]: deprecate / rename this compiler option in 246
    /** Config applied in usage of dynamic import statements in javascript */
    experimentalDynamicComponent?: DynamicImportConfig;
    /** Flag to enable usage of dynamic component(lwc:dynamic) directive in HTML template */
    experimentalDynamicDirective?: boolean;
    /** Flag to enable usage of dynamic component(lwc:is) directive in HTML template */
    enableDynamicComponents?: boolean;
    // TODO [#3370]: remove experimental template expression flag
    /** Flag to enable use of (a subset of) JavaScript expressions in place of template bindings. Passed to `@lwc/template-compiler`. */
    experimentalComplexExpressions?: boolean;
    /** Options to control what output gets generated. */
    outputConfig?: OutputConfig;
    /** Whether this is an explicit import. Passed to `@lwc/babel-plugin-component`. */
    isExplicitImport?: boolean;
    /** Whether the compiled HTML should include comments present in the source. */
    preserveHtmlComments?: boolean;
    /** Whether the CSS file being compiled is a scoped stylesheet. Passed to `@lwc/style-compiler`. */
    scopedStyles?: boolean;
    /** Whether the static content optimization should be enabled. Passed to `@lwc/template-compiler`. */
    enableStaticContentOptimization?: boolean;
    /** Custom renderer config to pass to `@lwc/template-compiler`. See that package's README for details. */
    customRendererConfig?: CustomRendererConfig;
    /** @deprecated Ignored by compiler. `lwc:spread` is always enabled. */
    enableLwcSpread?: boolean;
    /** Set to true if synthetic shadow DOM support is not needed, which can result in smaller output. */
    disableSyntheticShadowSupport?: boolean;
    /**
     * Enable transformations specific to {@link https://developer.salesforce.com/docs/platform/lwc/guide/security-lwsec-intro.html Lighting Web Security}.
     */
    enableLightningWebSecurityTransforms?: boolean;
    /**
     * Instrumentation object to gather metrics and non-error logs for internal use.
     * See the `@lwc/errors` package for details on the interface.
     */
    instrumentation?: InstrumentationObject;
    /** API version to associate with the compiled module. Values correspond to Salesforce platform releases. */
    apiVersion?: number;
}

type RequiredTransformOptions = Omit<
    TransformOptions,
    | 'name'
    | 'namespace'
    | 'scopedStyles'
    | 'customRendererConfig'
    | 'enableLwcSpread'
    | 'enableLightningWebSecurityTransforms'
    | 'enableDynamicComponents'
    | 'experimentalDynamicDirective'
    | 'experimentalDynamicComponent'
    | 'instrumentation'
>;
export interface NormalizedTransformOptions extends RecursiveRequired<RequiredTransformOptions> {
    name?: string;
    namespace?: string;
    scopedStyles?: boolean;
    customRendererConfig?: CustomRendererConfig;
    enableLwcSpread?: boolean;
    enableLightningWebSecurityTransforms?: boolean;
    enableDynamicComponents?: boolean;
    experimentalDynamicDirective?: boolean;
    experimentalDynamicComponent?: DynamicImportConfig;
    instrumentation?: InstrumentationObject;
}

/**
 * Validates that the options conform to the expected shape and normalizes them to a standard format
 * @param options Input options
 * @returns Normalized options
 * @example
 * const normalizedOptions = validateTransformOptions({
 *   namespace: 'c',
 *   name: 'app',
 * })
 */
export function validateTransformOptions(options: TransformOptions): NormalizedTransformOptions {
    validateOptions(options);
    return normalizeOptions(options);
}

function validateOptions(options: TransformOptions) {
    invariant(!isUndefined(options), CompilerValidationErrors.MISSING_OPTIONS_OBJECT, [options]);

    if (!isUndefined(options.enableLwcSpread) && !alreadyWarnedAboutLwcSpread) {
        alreadyWarnedAboutLwcSpread = true;

        // eslint-disable-next-line no-console
        console.warn(
            `"enableLwcSpread" property is deprecated. The value doesn't impact the compilation and can safely be removed.`
        );
    }

    if (!isUndefined(options.stylesheetConfig) && !alreadyWarnedOnStylesheetConfig) {
        alreadyWarnedOnStylesheetConfig = true;

        // eslint-disable-next-line no-console
        console.warn(
            `"stylesheetConfig" property is deprecated. The value doesn't impact the compilation and can safely be removed.`
        );
    }

    if (!isUndefined(options.outputConfig)) {
        validateOutputConfig(options.outputConfig);
    }
}

function isUndefinedOrBoolean(property: any): boolean {
    return isUndefined(property) || isBoolean(property);
}

function validateOutputConfig(config: OutputConfig) {
    invariant(
        isUndefinedOrBoolean(config.sourcemap) || config.sourcemap === 'inline',
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

    const experimentalDynamicComponent: Required<DynamicImportConfig> = {
        ...DEFAULT_DYNAMIC_IMPORT_CONFIG,
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
