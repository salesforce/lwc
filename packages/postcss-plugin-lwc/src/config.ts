export type VarTransformer = (name: string, fallback: string) => string;

export interface PluginConfig {
    tagName: string;
    token: string;
    customProperties?: {
        allowDefinition?: boolean;
        transformVar?: VarTransformer;
    };
}

export function validateConfig(options: PluginConfig) {
    if (!options || typeof options !== 'object') {
        throw new TypeError('Expected options with tagName and token properties');
    }

    if (!options.tagName || typeof options.tagName !== 'string') {
        throw new TypeError(
            `tagName option must be a string but instead received ${typeof options.tagName}`,
        );
    } else if (!options.token || typeof options.token !== 'string') {
        throw new TypeError(
            `token option must be a string but instead received ${typeof options.token}`,
        );
    }
}
