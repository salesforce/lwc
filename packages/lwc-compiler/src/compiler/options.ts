import { isBoolean, isString, isUndefined, isObject } from "../utils";

const DEFAULT_OPTIONS = {
    baseDir: "",
};

const DEFAULT_STYLESHEET_CONFIG: NormalizedStylesheetConfig = {
    customProperties: {
        allowDefinition: false,
        resolution: { type: 'native' }
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

export type CustomPropertiesResolution =
    | { type: 'native' }
    | { type: 'module', name: string };

export interface CustomPropertiesConfig {
    allowDefinition?: boolean;
    resolution?: CustomPropertiesResolution;
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

export interface NamespaceMapping {
    [name: string]: string;
};

export interface CompilerOptions {
    name: string;
    namespace: string;
    namespaceMapping?: NamespaceMapping;
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
    namespaceMapping?: NamespaceMapping;
    stylesheetConfig: NormalizedStylesheetConfig;
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
        const { allowDefinition, resolution } = customProperties;

        if (!isUndefined(allowDefinition) && !isBoolean(allowDefinition)) {
            throw new TypeError(`Expected a boolean for stylesheetConfig.customProperties.allowDefinition, received "${
                allowDefinition
            }".`);
        }

        if (!isUndefined(resolution)) {
            if (!isObject(resolution)) {
                throw new TypeError(`Expected an object for stylesheetConfig.customProperties.resolution, received "${
                    resolution
                }".`);
            }

            const { type } = resolution;

            if (type !== 'native' && type !== 'module') {
                throw new TypeError(`Expected either "native" or "module" for stylesheetConfig.customProperties.resolution.type, received "${
                    type
                }".`);
            }
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
