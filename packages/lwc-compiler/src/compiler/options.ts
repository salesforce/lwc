import { isBoolean, isString, isUndefined } from "../utils";

const DEFAULT_OPTIONS = {
    baseDir: "",
};

const DEFAULT_STYLESHEET_CONFIG = {
    customProperties: {
        allowDefinition: false,
        resolveFromModule: undefined
    }
};

const DEFAULT_OUTPUT_CONFIG = {
    env: {
        NODE_ENV: "development"
    },
    minify: false,
    compat: false
};

export type OutputProxyCompatConfig =
    | { global: string }
    | { module: string }
    | { independent: string };

export interface CustomPropertiesConfig {
    allowDefinition?: boolean;
    resolveFromModule?: string;
}

export interface StylesheetConfig {
    customProperties?: CustomPropertiesConfig;
}

export interface OutputConfig {
    env?: { [name: string]: string };
    compat?: boolean;
    minify?: boolean;
    resolveProxyCompat?: OutputProxyCompatConfig;
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
}

export interface NormalizedCompilerOptions extends CompilerOptions {
    outputConfig: NormalizedOutputConfig;
    stylesheetConfig: NormalizedStylesheetConfig;
}

export interface NormalizedStylesheetConfig extends StylesheetConfig {
    customProperties: {
        allowDefinition: boolean;
        resolveFromModule?: string;
    };
}

export interface NormalizedOutputConfig extends OutputConfig {
    compat: boolean;
    minify: boolean;
    env: {
        [name: string]: string;
    };
}

export function validateNormalizedOptions(options: NormalizedCompilerOptions) {
    validateOptions(options);
    validateOutputConfig(options.outputConfig);
    validateStylesheetConfig(options.stylesheetConfig);
}

export function validateOptions(options: CompilerOptions) {
    if (isUndefined(options)) {
        throw new TypeError(`Expected options object, received "${options}".`);
    }

    if (!isString(options.name)) {
        throw new TypeError(
            `Expected a string for name, received "${options.name}".`
        );
    }

    if (!isString(options.namespace)) {
        throw new TypeError(
            `Expected a string for namespace, received "${options.namespace}".`
        );
    }

    if (isUndefined(options.files) || !Object.keys(options.files).length) {
        throw new TypeError(`Expected an object with files to be compiled.`);
    }

    for (const key of Object.keys(options.files)) {
        const value = options.files[key];
        if (isUndefined(value) || !isString(value)) {
            throw new TypeError(
                `Unexpected file content for "${key}". Expected a string, received "${value}".`
            );
        }
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
        const { allowDefinition, resolveFromModule } = customProperties;

        if (!isUndefined(allowDefinition) && !isBoolean(allowDefinition)) {
            throw new TypeError(`Expected a boolean for stylesheetConfig.allowDefinition, received ${
                allowDefinition
            }`);
        }

        if (!isUndefined(resolveFromModule) && !isString(resolveFromModule)) {
            throw new TypeError(`Expected a string for stylesheetConfig.resolveFromModule, received ${
                resolveFromModule
            }`);
        }
    }
}

function validateOutputConfig(config: OutputConfig) {
    if (!isUndefined(config.minify) && !isBoolean(config.minify)) {
        throw new TypeError(
            `Expected a boolean for outputConfig.minify, received "${
                config.minify
            }".`
        );
    }

    if (!isUndefined(config.compat) && !isBoolean(config.compat)) {
        throw new TypeError(
            `Expected a boolean for outputConfig.compat, received "${
                config.compat
            }".`
        );
    }
}

export function normalizeOptions(
    options: CompilerOptions
): NormalizedCompilerOptions {
    const outputConfig: NormalizedOutputConfig = {
        ...DEFAULT_OUTPUT_CONFIG,
        ...options.outputConfig
    };

    const stylesheetConfig: NormalizedStylesheetConfig = {
        customProperties: {
            ...DEFAULT_STYLESHEET_CONFIG.customProperties,
            ...(options.stylesheetConfig && options.stylesheetConfig.customProperties),
        }
    };

    return {
        ...DEFAULT_OPTIONS,
        ...options,
        stylesheetConfig,
        outputConfig
    };
}
