export interface PluginConfig {
    token: string;
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
