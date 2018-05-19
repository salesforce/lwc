import * as postcss from 'postcss';
import { PostCSSRuleNode } from 'postcss-selector-parser';

import selectorTransform from './selector-transform';
import { validateConfig, PluginConfig } from './config';

const PLUGIN_NAME = 'postcss-plugin-lwc';

export default postcss.plugin(PLUGIN_NAME, (config: PluginConfig) => {
    validateConfig(config);
    return root => {
        root.walkRules(rule => {
            rule.selector = selectorTransform(rule, config);
        });
    };
});

export function transformSelector(
    selector: string | PostCSSRuleNode,
    config: PluginConfig,
): string {
    validateConfig(config);
    return selectorTransform(selector, config);
}
