export type Format = 'module' | 'function';

export interface Config {
    /**
     * Enable computed member expression in the template. eg:
     *    <template>
     *        {list[0].name}
     *    </template>
     */
    computedMemberExpression?: boolean;

    /**
     * Internal configuration for namespace mapping component. Accepts:
     *  * Map<previousNamespace, newNamespace>
     *
     * When specified, all custom components in the template with previous namespace
     *  will be replaced by the namespace value
     *
     * ex: c-button -> namespace-button
     */
    namespaceMapping?: NamespaceMapping;
}

export interface ResolvedConfig {
    computedMemberExpression: boolean;
    namespaceMapping: NamespaceMapping;

    /**
     * Internal configuration for the output format of the template. Accepts:
     *  * "module": generates a ES module, and use import statements to reference component
     *    constructor.
     *  * "inline": generates a function, and requires component constructor to be passed
     *    as parameter.
     */
    format: Format;
}

export interface NamespaceMapping {
    [name: string]: string;
}

const DEFAULT_CONFIG: ResolvedConfig = {
    computedMemberExpression: false,
    namespaceMapping: {},
    format: 'module',
};

const REQUIRED_OPTION_NAMES = new Set([]);
const AVAILABLE_OPTION_NAMES = new Set([
    'computedMemberExpression',
    'namespaceMapping',
]);

export function mergeConfig(config: Config): ResolvedConfig {
    if (config === undefined && typeof config !== 'object') {
        throw new Error('Compiler options must be an object');
    }

    REQUIRED_OPTION_NAMES.forEach((requiredProperty) => {
        if (!config.hasOwnProperty(requiredProperty)) {
            throw new Error(
                `Missing required option property ${requiredProperty}`,
            );
        }
    });

    for (const property in config) {
        if (
            !AVAILABLE_OPTION_NAMES.has(property) &&
            config.hasOwnProperty(property)
        ) {
            throw new Error(`Unknown option property ${property}`);
        }
    }

    return {
        ...DEFAULT_CONFIG,
        ...config,
    };
}
