/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const defaultFeatureFlags = require('../../');

const RUNTIME_FLAGS_IDENTIFIER = 'runtimeFlags';

function isRuntimeFlagLookup(path, state) {
    return (
        path.isMemberExpression() &&
        state.featureFlags[path.node.property.name] !== undefined &&
        path.get('object').isIdentifier({ name: RUNTIME_FLAGS_IDENTIFIER })
    );
}

module.exports = function({ types: t }) {
    return {
        name: 'babel-plugin-lwc-features',
        visitor: {
            ImportDeclaration(path, state) {
                if (path.node.source.value === '@lwc/features') {
                    const specifiers = path.get('specifiers');

                    state.importDeclarationScope = path.scope;

                    const didImportRuntimeFlags = specifiers.some(specifier => {
                        return specifier.node.imported.name === RUNTIME_FLAGS_IDENTIFIER;
                    });
                    if (!didImportRuntimeFlags) {
                        // Blindly import a binding for `runtimeFlags`. It's much
                        // simpler to let tree-shaking remove it when unnecessary,
                        // rather than to try and import it only when needed.
                        path.node.specifiers.push(
                            t.importSpecifier(
                                t.identifier(RUNTIME_FLAGS_IDENTIFIER),
                                t.identifier(RUNTIME_FLAGS_IDENTIFIER)
                            )
                        );
                    }
                }
            },
            IfStatement(path, state) {
                const testPath = path.get('test');

                state.featureFlags =
                    state.featureFlags || state.opts.featureFlags || defaultFeatureFlags;

                // If we have imported any flags and the if-test is a plain identifier
                if (state.importDeclarationScope && testPath.isIdentifier()) {
                    const name = testPath.node.name;
                    const binding = state.importDeclarationScope.getBinding(name);
                    // If the identifier is a reference to a binding from the import declaration scope
                    if (binding && binding.referencePaths.includes(testPath)) {
                        const value = state.featureFlags[name];
                        if (!state.opts.prod || value === null) {
                            testPath.replaceWithSourceString(`${RUNTIME_FLAGS_IDENTIFIER}.${name}`);
                            // We replaced this identifier with a member
                            // expression that uses the same identifier and we
                            // don't want to process it again
                            testPath.skip();
                        } else if (value === true) {
                            // Transform the IfStatement into a BlockStatement
                            path.replaceWith(path.node.consequent);
                        } else if (value === false) {
                            // Remove IfStatement
                            path.remove();
                        }
                    }
                }

                // Transform runtime flags into compile-time flags where
                // appropriate for production mode. This essentially undoes the
                // non-production mode transform of forcing all flags to be
                // runtime flags.
                if (state.opts.prod && isRuntimeFlagLookup(testPath, state)) {
                    const name = testPath.node.property.name;
                    const value = state.featureFlags[name];
                    if (value === true) {
                        // Transform the IfStatement into a BlockStatement
                        path.replaceWith(path.node.consequent);
                    }
                    if (value === false) {
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
