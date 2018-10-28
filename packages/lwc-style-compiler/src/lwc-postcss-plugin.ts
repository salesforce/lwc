import postcss, { Root, Result } from 'postcss';
import postCssSelector from 'postcss-selector-parser';
import { Processor } from 'postcss-selector-parser';

import validateCustomProperties from './custom-properties/validate';
import validateIdSelectors from './no-id-selectors/validate';

import transformImport from './css-import/transform';
import transformSelectorScoping, { SelectorScopingConfig } from './selector-scoping/transform';
import transformCustomProperties from './custom-properties/transform';

export type VarTransformer = (name: string, fallback: string) => string;

export interface PluginConfig {
    customProperties?: {
        allowDefinition?: boolean;
        collectVarFunctions?: boolean;
    };
    minify?: boolean;
    filename: string;
}

function selectorProcessorFactory(config: PluginConfig, transformConfig: SelectorScopingConfig) {
    return postCssSelector(root => {
        validateIdSelectors(root, config.filename);
        transformSelectorScoping(root, transformConfig);
    }) as Processor;
}

export default postcss.plugin('postcss-plugin-lwc', (pluginConfig: PluginConfig) => {
    const fakeShadowSelectorProcessor = selectorProcessorFactory(pluginConfig, { transformHost: true });

    return (root: Root, result: Result) => {
        const { customProperties } = pluginConfig;
        transformImport(root, result);

        if (!customProperties || !customProperties.allowDefinition) {
            validateCustomProperties(root);
        }

        transformCustomProperties(root, result);

        root.walkRules(rule => {
            const fakeShadowSelector = fakeShadowSelectorProcessor.processSync(rule);
            rule.selector = fakeShadowSelector;
        });
    };
});
