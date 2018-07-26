import postcss from 'postcss';

import lwcPlugin from '../index';
import { PluginConfig } from '../config';

export const FILE_NAME = '/test.css';

export const DEFAULT_HOST_SELECTOR = '[x-foo_tmpl-host]';
export const DEFAULT_SHADOW_SELECTOR = '[x-foo_tmpl]';

export const DEFAULT_CUSTOM_PROPERTIES_CONFIG = {
    allowDefinition: false,
    transformVar: (name: string, fallback: string | undefined) => {
        return fallback === undefined
            ? `$VAR(${name})$`
            : `$VAR(${name}, ${fallback})$`;
    },
};

export const DEFAULT_CONFIG = {
    hostSelector: DEFAULT_HOST_SELECTOR,
    shadowSelector: DEFAULT_SHADOW_SELECTOR,
    customProperties: DEFAULT_CUSTOM_PROPERTIES_CONFIG,
    filename: FILE_NAME,
};

export function process(
    source: string,
    options: PluginConfig = DEFAULT_CONFIG,
) {
    const plugins = [lwcPlugin(options)];
    return postcss(plugins).process(source, { from: FILE_NAME });
}
