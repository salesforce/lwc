/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const template = require('@babel/template');
const defaultFeatureFlags = require('../../');

const buildRequire = template.expression(`globalThis.LWC_config.features.FEATURE_FLAG_NAME`);

// This plugin relies on the feature flag import declaration appearing before
// feature flag usage. Dynamic imports are not supported.
module.exports = function({ types: t }) {
    // If we want to make this a generic transform, we can probably evalutate
    // this recursively given a string such as 'globalThis.LWC_config.features'.
    function isFeatureFlagMemberExpression(path, state) {
        const { globalFlags = {} } = state;
        const globalFlagNames = Object.keys(globalFlags);
        // globalThis.LWC_config.features.FEATURE_FLAG_NAME
        if (path.isMemberExpression() && globalFlagNames.includes(path.node.property.name)) {
            // globalThis.LWC_config.features
            const featuresMemExp = path.get('object');
            if (
                featuresMemExp.isMemberExpression() &&
                t.isIdentifier(featuresMemExp.node.property, { name: 'features' })
            ) {
                // globalThis.LWC_config
                const lwcConfigMemExp = featuresMemExp.get('object');
                if (
                    lwcConfigMemExp.isMemberExpression() &&
                    t.isIdentifier(lwcConfigMemExp.node.property, { name: 'LWC_config' })
                ) {
                    // globalThis
                    return lwcConfigMemExp.get('object').isIdentifier({ name: 'globalThis' });
                }
            }
        }
        return false;
    }

    return {
        name: 'babel-plugin-lwc-features',
        visitor: {
            ImportDeclaration(path, state) {
                const { node } = path;
                if (node.source.value === '@lwc/features') {
                    state.globalFlags = state.opts.featureFlags || defaultFeatureFlags;
                    // Evalute all feature flags at runtime in non-prod environments
                    if (state.opts.prod !== true) {
                        Object.keys(state.globalFlags).forEach(key => {
                            state.globalFlags[key] = null;
                        });
                    }
                    state.importedFlags = node.specifiers.map(specifier => specifier.imported.name);
                }
            },
            IfStatement(path, state) {
                const testPath = path.get('test');
                const {
                    node: { name },
                } = testPath;
                const { importedFlags = [], globalFlags = {} } = state;

                // Identifiers can be tricky so we only transform them if we
                // know they were imported from @lwc/features.
                if (
                    importedFlags.length &&
                    testPath.isIdentifier() &&
                    importedFlags.includes(name)
                ) {
                    const flagValue = globalFlags[name];
                    if (flagValue === null) {
                        const expression = buildRequire({
                            FEATURE_FLAG_NAME: t.identifier(name),
                        });
                        testPath.replaceWith(expression);
                        // We replace this Identifier with a MemberExpression that uses
                        // the same identifier and we don't want to process it again.
                        testPath.skip();
                    }
                    if (flagValue === true) {
                        // Transform the IfStatement into a BlockStatement
                        path.replaceWith(path.node.consequent);
                    }
                    if (flagValue === false) {
                        // Remove IfStatement
                        path.remove();
                    }
                }

                if (state.opts.prod && isFeatureFlagMemberExpression(testPath, state)) {
                    const flagName = testPath.node.property.name;
                    const flagValue = globalFlags[flagName];
                    if (flagValue === true) {
                        // Transform the IfStatement into a BlockStatement
                        path.replaceWith(path.node.consequent);
                    }
                    if (flagValue === false) {
                        // Remove IfStatement
                        path.remove();
                    }
                }

                // Nested feature flags sounds like a very bad idea
                path.skip();
            },
        },
    };
};
