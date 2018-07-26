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
    if (!options || typeof options !== 'object') {
        throw new TypeError('Expected options with tagName and token properties');
    }

    if (!options.hostSelector || typeof options.hostSelector !== 'string') {
        throw new TypeError(
            `hostSelector option must be a string but instead received ${typeof options.hostSelector}`,
        );
    }

    if (!options.shadowSelector || typeof options.shadowSelector !== 'string') {
        throw new TypeError(
            `shadowSelector option must be a string but instead received ${typeof options.shadowSelector}`,
        );
    }
}
