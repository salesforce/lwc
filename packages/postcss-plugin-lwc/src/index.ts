import * as postcss from 'postcss';
import { PostCSSRuleNode } from 'postcss-selector-parser';

import selectorScopingTransform from './selector-scoping/transform';
import validateCustomProperties from './custom-properties/validate';
import transformCustomProperties from './custom-properties/transform';

import { validateConfig, PluginConfig } from './config';

const PLUGIN_NAME = 'postcss-plugin-lwc';

export default postcss.plugin(PLUGIN_NAME, (config: PluginConfig) => {
    validateConfig(config);
    return root => {
        const { customProperties } = config;

        if (customProperties !== undefined) {
            root.walkDecls(decl => {
                if (!customProperties.allowDefinition) {
                    validateCustomProperties(decl);
                }

                if (customProperties.transformVar) {
                    transformCustomProperties(decl, customProperties.transformVar);
                }
            });
        }

        root.walkRules(rule => {
            rule.selector = selectorScopingTransform(rule, config);
        });
    };
});

export function transformSelector(
    selector: string | PostCSSRuleNode,
    config: PluginConfig,
): string {
    validateConfig(config);
    return selectorScopingTransform(selector, config);
}
