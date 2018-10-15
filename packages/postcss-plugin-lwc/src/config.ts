import { invariant, CSSTransformErrors } from 'lwc-errors';
export type VarTransformer = (name: string, fallback: string) => string;

export interface PluginConfig {
    hostSelector: string;
    shadowSelector: string;
    customProperties?: {
        allowDefinition?: boolean;
        transformVar?: VarTransformer;
    };
    filename: string;
}

export function validateConfig(options: PluginConfig) {
    invariant(
        options && typeof options === 'object',
        CSSTransformErrors.CONFIG_MISSING_EXPECTED_OPTIONS);

    invariant(
        !!options.hostSelector && typeof options.hostSelector === 'string',
        CSSTransformErrors.CONFIG_SELECTOR_TYPE_INVALID,
        ['hostSelector', typeof options.hostSelector]);

    invariant(
        !!options.shadowSelector && typeof options.shadowSelector === 'string',
        CSSTransformErrors.CONFIG_SELECTOR_TYPE_INVALID,
        ['shadowSelector', typeof options.shadowSelector]);
}
