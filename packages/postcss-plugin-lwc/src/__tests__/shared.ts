import * as postcss from 'postcss';

import lwcPlugin from '../index';
import { PluginConfig } from '../config';

export const FILE_NAME = '/test.css';

export const DEFAULT_TOKEN = 'x-foo_tmpl';
export const DEFAULT_CUSTOM_PROPERTIES_CONFIG = {
    allowDefinition: false,
    transformVar: (name: string, fallback: string | undefined) => {
        return fallback === undefined ? `$VAR(${name})$` : `$VAR(${name}, ${fallback})$`;
    },
};

export function process(
    source: string,
    options: PluginConfig = {
        token: DEFAULT_TOKEN,
        customProperties: DEFAULT_CUSTOM_PROPERTIES_CONFIG,
    },
) {
    const plugins = [lwcPlugin(options)];
    return postcss(plugins).process(source, { from: FILE_NAME });
}
