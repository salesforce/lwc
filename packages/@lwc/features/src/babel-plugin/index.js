/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const defaultFeatureFlags = require('../../').default;

const RUNTIME_FLAGS_IDENTIFIER = 'runtimeFlags';

function isRuntimeFlag(path, featureFlags) {
    return (
        path.isMemberExpression() &&
        path.get('object').isIdentifier({ name: RUNTIME_FLAGS_IDENTIFIER }) &&
        path.get('property').isIdentifier() &&
        featureFlags[path.node.property.name] !== undefined
    );
}

function validate(name, value) {
    if (!/[A-Z_]+/.test(name)) {
        throw new Error(
            `Invalid feature flag "${name}". Flag name must only be composed of uppercase letters and underscores.`
        );
    }
    if (value === undefined) {
        throw new Error(`Invalid feature flag "${name}". Flag is undefined.`);
    }
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
            },
            ImportDefaultSpecifier(defaultSpecifierPath) {
                const importDeclarationPath = defaultSpecifierPath.findParent(p =>
                    p.isImportDeclaration()
                );
                if (importDeclarationPath.node.source.value === '@lwc/features') {
                    this.importDeclarationScope = importDeclarationPath.scope;
                    this.defaultSpecifierName = defaultSpecifierPath.node.local.name;
                    const specifiers = importDeclarationPath.get('specifiers');
                    const didImportRuntimeFlags = specifiers
                        .filter(specifier => specifier !== defaultSpecifierPath)
                        .some(specifier => {
                            return specifier.node.imported.name === RUNTIME_FLAGS_IDENTIFIER;
                        });
                    if (!didImportRuntimeFlags) {
                        // Blindly import a binding for `runtimeFlags`. Tree-shaking
                        // will simply remove it if unused.
                        importDeclarationPath.node.specifiers.push(
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

                // If we have imported the feature flags lookup (default binding) and the if-test is a member expression.
                if (this.defaultSpecifierName && testPath.isMemberExpression()) {
                    const objectPath = testPath.get('object');
                    const propertyPath = testPath.get('property');
                    // If the member expression is a shallow feature flag lookup (i.e., the property is an identifier).
                    if (
                        objectPath.isIdentifier({ name: this.defaultSpecifierName }) &&
                        propertyPath.isIdentifier()
                    ) {
                        const binding = this.importDeclarationScope.getBinding(
                            objectPath.node.name
                        );
                        // If this thing is an actual reference to the imported feature flag lookup.
                        if (binding && binding.referencePaths.includes(objectPath)) {
                            const name = propertyPath.node.name;
                            const value = this.featureFlags[name];
                            validate(name, value);
                            if (!this.opts.prod || value === null) {
                                testPath.replaceWithSourceString(
                                    `${RUNTIME_FLAGS_IDENTIFIER}.${name}`
                                );
                            } else if (value === true) {
                                // Transform the IfStatement into a BlockStatement
                                path.replaceWith(path.node.consequent);
                            } else if (value === false) {
                                // Remove IfStatement
                                path.remove();
                            }
                        }
                    }
                }

                // Transform runtime flags into compile-time flags, where appropriate, for
                // production mode. This serves to undo the non-production mode transform of
                // forcing all flags to be runtime flags.
                if (this.opts.prod && isRuntimeFlag(testPath, this.featureFlags)) {
                    const name = testPath.node.property.name;
                    const value = this.featureFlags[name];
                    validate(name, value);
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
