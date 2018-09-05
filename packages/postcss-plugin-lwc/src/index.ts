import postcss from 'postcss';
import postCssSelector from 'postcss-selector-parser';
import { PostCSSRuleNode, Processor } from 'postcss-selector-parser';

import selectorScopingTransform from './selector-scoping/transform';
import namespaceMappingTransform from './namespace-mapping/transform';
import validateCustomProperties from './custom-properties/validate';
import transformCustomProperties from './custom-properties/transform';

import { validateConfig, PluginConfig } from './config';

const PLUGIN_NAME = 'postcss-plugin-lwc';

function selectorProcessorFactory(config: PluginConfig) {
    const { namespaceMapping } = config;

    return postCssSelector(root => {
        // Run first the remapping on the selectors before the scoping since the selector
        // scoping use the tag name to generated attribute values.
        if (namespaceMapping) {
            namespaceMappingTransform(root, namespaceMapping);
        }

        selectorScopingTransform(root, config);
    }) as Processor;
}

function validateIdSelectors(root) {
    root.walkRules(rule => {
        const result = /(#\w+)/.exec(rule.selector);
        if (result) {
            throw rule.error(
                `Invalid usage of id selector "${result[1]}". Use a class selector instead.`
            );
        }
    });
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

        validateIdSelectors(root);

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
