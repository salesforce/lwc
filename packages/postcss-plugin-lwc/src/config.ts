export type VarTransformer = (name: string, fallback: string) => string;

export interface PluginConfig {
    token: string;
    customProperties?: {
        allowDefinition?: boolean;
        transformVar?: VarTransformer;
    };
    namespaceMapping?: {
        [namespace: string]: string;
    };
    filename: string;
}

export function validateConfig(options: PluginConfig) {
    if (!options || typeof options !== 'object') {
        throw new TypeError('Expected options with tagName and token properties');
    }

    if (!options.token || typeof options.token !== 'string') {
        throw new TypeError(
            `token option must be a string but instead received ${typeof options.token}`,
        );
    }
}
