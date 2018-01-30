import * as postcss from 'postcss';

import { validateConfig, PluginConfig } from './config';
import transform from './selector-transform';

const PLUGIN_NAME = 'postcss-plugin-lwc';

export default postcss.plugin(PLUGIN_NAME, (config: PluginConfig) => {
    validateConfig(config);

    return root => {
        root.walkRules(rule => {
            rule.selector = transform(rule, config);
        });
    };
});
