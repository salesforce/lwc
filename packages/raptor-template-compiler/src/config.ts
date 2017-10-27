export interface Config {
    /**
     * Template stylesheet url associated with the template.
     */
    stylesheet?: string;

    /**
     * Enable computed member expression in the template. eg:
     *    <template>
     *        {list[0].name}
     *    </template>
     */
    computedMemberExpression?: boolean;
}

export interface ResolvedConfig {
    stylesheet?: string;
    computedMemberExpression: boolean;
}

const DEFAULT_CONFIG = {
    computedMemberExpression: false,
};

const REQUIRED_OPTION_NAMES = new Set([]);
const AVAILABLE_OPTION_NAMES = new Set([
    'stylesheet',
    'computedMemberExpression',
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
