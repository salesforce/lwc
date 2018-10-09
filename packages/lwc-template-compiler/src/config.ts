import { TemplateErrors, invariant, throwError } from 'lwc-errors';
export type Format = 'module' | 'function';

export interface Config {
    /**
     * Enable computed member expression in the template. eg:
     *    <template>
     *        {list[0].name}
     *    </template>
     */
    computedMemberExpression?: boolean;
    secure?: boolean;
}

export interface ResolvedConfig {
    computedMemberExpression: boolean;
    secure: boolean;

    /**
     * Internal configuration for the output format of the template. Accepts:
     *  * "module": generates a ES module, and use import statements to reference component
     *    constructor.
     *  * "inline": generates a function, and requires component constructor to be passed
     *    as parameter.
     */
    format: Format;
}

const DEFAULT_CONFIG: ResolvedConfig = {
    secure: false,
    computedMemberExpression: false,
    format: 'module',
};

const REQUIRED_OPTION_NAMES = new Set([]);
const AVAILABLE_OPTION_NAMES = new Set([
    'secure',
    'computedMemberExpression',
]);

export function mergeConfig(config: Config): ResolvedConfig {
    invariant(
        config !== undefined && typeof config === 'object',
        TemplateErrors.OPTIONS_MUST_BE_OBJECT
    );

    REQUIRED_OPTION_NAMES.forEach((requiredProperty) => {
        invariant(
            config.hasOwnProperty(requiredProperty),
            TemplateErrors.MISSING_REQUIRED_PROPERTY,
            [requiredProperty]
        );
    });

    for (const property in config) {
        if (
            !AVAILABLE_OPTION_NAMES.has(property) &&
            config.hasOwnProperty(property)
        ) {
            throwError(TemplateErrors.UNKNOWN_OPTION_PROPERTY, [property]);
        }
    }

    return {
        ...DEFAULT_CONFIG,
        ...config,
    };
}
