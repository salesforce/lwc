/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const defaultFeatureFlags = require('../../');

const RUNTIME_FLAGS_IDENTIFIER = 'runtimeFlags';

function isRuntimeFlag(path, featureFlags) {
    return (
        path.isMemberExpression() &&
        featureFlags[path.node.property.name] !== undefined &&
        path.get('object').isIdentifier({ name: RUNTIME_FLAGS_IDENTIFIER })
    );
}

module.exports = function({ types: t }) {
    return {
        name: 'babel-plugin-lwc-features',
        visitor: {
            // `pre()` doesn't have access to the `this.opts` plugin options so
            // we initialize in the Program visitor instead.
            Program() {
                this.featureFlagIfStatements = [];
                this.featureFlags = this.opts.featureFlags || defaultFeatureFlags;
                this.importDeclarationScope = [];
                this.importedFeatureFlags = [];
            },
            ImportDeclaration(path) {
                if (path.node.source.value === '@lwc/features') {
                    const specifiers = path.get('specifiers');

                    this.importDeclarationScope = path.scope;
                    this.importedFeatureFlags = specifiers
                        .map(specifier => specifier.node.imported.name)
                        .filter(name => name === name.toUpperCase());

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
            IfStatement(path) {
                const testPath = path.get('test');

                // If we have imported any flags and the if-test is a plain identifier
                if (this.importedFeatureFlags.length && testPath.isIdentifier()) {
                    const name = testPath.node.name;
                    const binding = this.importDeclarationScope.getBinding(name);

                    // The identifier is a feature flag if it matches the name
                    // of an imported feature flag binding and it's a reference
                    // from the import declaration scope.
                    const isFeatureFlag =
                        this.importedFeatureFlags.includes(name) &&
                        binding &&
                        binding.referencePaths.includes(testPath);

                    if (isFeatureFlag) {
                        const value = this.featureFlags[name];
                        if (!this.opts.prod || value === null) {
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
                if (this.opts.prod && isRuntimeFlag(testPath, this.featureFlags)) {
                    const name = testPath.node.property.name;
                    const value = this.featureFlags[name];
                    if (value === true) {
                        // Transform the IfStatement into a BlockStatement
                        path.replaceWith(path.node.consequent);
                    }
                    if (value === false) {
                        // Remove IfStatement
                        path.remove();
                    }
                }
            },
        },
    };
};
