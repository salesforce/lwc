import postcss from 'postcss';
import postCssSelector from 'postcss-selector-parser';
import { PostCSSRuleNode, Processor } from 'postcss-selector-parser';

import selectorScopingTransform from './selector-scoping/transform';
import validateCustomProperties from './custom-properties/validate';
import transformCustomProperties from './custom-properties/transform';
import validateIdSelectors from './no-id-selectors/validate';

import { validateConfig, PluginConfig } from './config';

const PLUGIN_NAME = 'postcss-plugin-lwc';

function selectorProcessorFactory(config: PluginConfig) {
    return postCssSelector(root => {
        validateIdSelectors(root, config.filename);
        selectorScopingTransform(root, config);
    }) as Processor;
}

export default postcss.plugin(PLUGIN_NAME, (config: PluginConfig) => {
    validateConfig(config);

    const selectorProcessor = selectorProcessorFactory(config);

    return root => {
        const { customProperties } = config;
        if (customProperties) {
            const { allowDefinition, transformVar } = customProperties;

            root.walkDecls(decl => {
                if (!allowDefinition) {
                    validateCustomProperties(decl);
                }

                if (transformVar) {
                    transformCustomProperties(decl, transformVar);
                }
            });
        }

        root.walkRules(rule => {
            rule.selector = selectorProcessor.processSync(rule);
        });
    };
});

export function transformSelector(
    selector: string | PostCSSRuleNode,
    config: PluginConfig,
): string {
    validateConfig(config);

    const selectorProcessor = selectorProcessorFactory(config);
    return selectorProcessor.processSync(selector);
}
