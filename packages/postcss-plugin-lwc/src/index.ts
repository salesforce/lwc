import postcss from 'postcss';
import postCssSelector from 'postcss-selector-parser';
import { Processor } from 'postcss-selector-parser';

import { validateConfig, PluginConfig } from './config';

import selectorScopingTransform, { SelectorScopingConfig } from './selector-scoping/transform';
import validateCustomProperties from './custom-properties/validate';
import transformCustomProperties from './custom-properties/transform';
import validateIdSelectors from './no-id-selectors/validate';

const PLUGIN_NAME = 'postcss-plugin-lwc';

function selectorProcessorFactory(config: PluginConfig, transformConfig: SelectorScopingConfig) {
    return postCssSelector(root => {
        validateIdSelectors(root, config.filename);
        selectorScopingTransform(root, config, transformConfig);
    }) as Processor;
}

export default postcss.plugin(PLUGIN_NAME, (pluginConfig: PluginConfig) => {
    validateConfig(pluginConfig);

    // We need 2 types of selectors processors, since transforming the :host selector make the selector
    // unusable when used in the context of the native shadow and vice-versa.
    const nativeShadowSelectorProcessor = selectorProcessorFactory(pluginConfig, { transformHost: false });
    const fakeShadowSelectorProcessor = selectorProcessorFactory(pluginConfig, { transformHost: true });

    return root => {
        const { customProperties } = pluginConfig;

        // First we run the custom properties transformations if needed.
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
            // Let transform the selector with the 2 processors.
            const fakeShadowSelector = fakeShadowSelectorProcessor.processSync(rule);
            const nativeShadowSelector = nativeShadowSelectorProcessor.processSync(rule);

            rule.selector = fakeShadowSelector;

            // If the resulting selector are different it means that the selector use the :host selector. In
            // this case we need to duplicate the CSS rule and assign the other selector.
            if (fakeShadowSelector !== nativeShadowSelector) {
                // The cloned selector is inserted before the currently processed selector to avoid processing
                // again the cloned selector.
                const clonedRule = rule.cloneBefore();
                clonedRule.selector = nativeShadowSelector;
            }
        });
    };
});
