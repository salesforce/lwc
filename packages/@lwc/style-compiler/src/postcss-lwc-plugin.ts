/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import postcss, { Root, Result, Rule } from 'postcss';
import postCssSelector from 'postcss-selector-parser';
import { Processor } from 'postcss-selector-parser';

import validateCustomProperties from './custom-properties/validate';
import validateIdSelectors from './no-id-selectors/validate';

import transformImport from './css-import/transform';
import transformSelectorScoping, { SelectorScopingConfig } from './selector-scoping/transform';
import transformCustomProperties from './custom-properties/transform';
import transformDirPseudoClass from './dir-pseudo-class/transform';

export type VarTransformer = (name: string, fallback: string) => string;

export interface PluginConfig {
    customProperties?: {
        allowDefinition?: boolean;
        collectVarFunctions?: boolean;
    };
    minify?: boolean;
}

function shouldTransformSelector(rule: Rule) {
    // @keyframe at-rules are special, rules inside are not standard selectors and should not be scoped like
    // any other rules.
    return rule.parent.type !== 'atrule' || rule.parent.name !== 'keyframes';
}

function selectorProcessorFactory(config: PluginConfig, transformConfig: SelectorScopingConfig) {
    return postCssSelector(root => {
        validateIdSelectors(root);

        transformSelectorScoping(root, transformConfig);
        transformDirPseudoClass(root);
    }) as Processor;
}

export default postcss.plugin('postcss-plugin-lwc', (pluginConfig: PluginConfig) => {
    // We need 2 types of selectors processors, since transforming the :host selector make the selector
    // unusable when used in the context of the native shadow and vice-versa.
    const nativeShadowSelectorProcessor = selectorProcessorFactory(pluginConfig, {
        transformHost: false,
    });
    const fakeShadowSelectorProcessor = selectorProcessorFactory(pluginConfig, {
        transformHost: true,
    });

    return (root: Root, result: Result) => {
        const { customProperties } = pluginConfig;
        transformImport(root, result);

        if (!customProperties || !customProperties.allowDefinition) {
            validateCustomProperties(root);
        }

        transformCustomProperties(root, result);

        root.walkRules(rule => {
            if (!shouldTransformSelector(rule)) {
                return;
            }

            // Let transform the selector with the 2 processors.
            const fakeShadowSelector = fakeShadowSelectorProcessor.processSync(rule);
            const nativeShadowSelector = nativeShadowSelectorProcessor.processSync(rule);
            rule.selector = fakeShadowSelector;
            // If the resulting selector are different it means that the selector use the :host selector. In
            // this case we need to duplicate the CSS rule and assign the other selector.
            if (fakeShadowSelector !== nativeShadowSelector) {
                // The cloned selector is inserted before the currently processed selector to avoid processing
                // again the cloned selector.
                const currentRule: any = rule;
                const clonedRule: any = rule.cloneBefore();
                clonedRule.selector = nativeShadowSelector;

                // Safe a reference to each other
                clonedRule._isHostNative = true;
                currentRule._isFakeNative = true;
            }
        });
    };
});
