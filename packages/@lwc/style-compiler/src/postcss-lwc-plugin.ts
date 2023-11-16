/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Rule, AtRule, TransformCallback } from 'postcss';
import postCssSelector from 'postcss-selector-parser';
import { APIVersion } from '@lwc/shared';

import validateIdSelectors from './no-id-selectors/validate';
import transformImport from './css-import/transform';
import transformSelectorScoping, { SelectorScopingConfig } from './selector-scoping/transform';
import transformDirPseudoClass from './dir-pseudo-class/transform';
import transformAtRules from './scope-at-rules/transform';

function shouldTransformSelector(rule: Rule) {
    // @keyframe at-rules are special, rules inside are not standard selectors and should not be
    // scoped like any other rules.
    return rule.parent?.type !== 'atrule' || (rule.parent as AtRule).name !== 'keyframes';
}

function selectorProcessorFactory(transformConfig: SelectorScopingConfig) {
    return postCssSelector((root) => {
        validateIdSelectors(root);

        transformSelectorScoping(root, transformConfig);
        transformDirPseudoClass(root);
    });
}

export default function postCssLwcPlugin(options: {
    scoped: boolean;
    apiVersion: APIVersion;
}): TransformCallback {
    // We need 2 types of selectors processors, since transforming the :host selector make the selector
    // unusable when used in the context of the native shadow and vice-versa.
    // This distinction also applies to light DOM in scoped (synthetic-like) vs unscoped (native-like) mode.
    const nativeShadowSelectorProcessor = selectorProcessorFactory({
        transformHost: false,
    });
    const syntheticShadowSelectorProcessor = selectorProcessorFactory({
        transformHost: true,
    });

    return (root, result) => {
        transformImport(root, result, options.scoped);
        transformAtRules(root);

        root.walkRules((rule) => {
            if (!shouldTransformSelector(rule)) {
                return;
            }

            // Let transform the selector with the 2 processors.
            const syntheticSelector = syntheticShadowSelectorProcessor.processSync(rule);
            const nativeSelector = nativeShadowSelectorProcessor.processSync(rule);
            rule.selector = syntheticSelector;
            // If the resulting selector are different it means that the selector use the :host selector. In
            // this case we need to duplicate the CSS rule and assign the other selector.
            if (syntheticSelector !== nativeSelector) {
                // The cloned selector is inserted before the currently processed selector to avoid processing
                // again the cloned selector.
                const currentRule = rule;
                const clonedRule = rule.cloneBefore();
                clonedRule.selector = nativeSelector;

                // Safe a reference to each other
                (clonedRule as any)._isNativeHost = true;
                (currentRule as any)._isSyntheticHost = true;
            }
        });
    };
}
