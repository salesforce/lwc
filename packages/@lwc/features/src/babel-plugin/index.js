/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const defaultFeatureFlags = require('../../').default;

const RUNTIME_FLAGS_IDENTIFIER = 'runtimeFlags';

function validate(memberExpressionPath, { featureFlags, opts }) {
    const name = memberExpressionPath.node.property.name;
    const value = featureFlags[name];
    if (!/^[A-Z_]+$/.test(name)) {
        throw new Error(
            `Invalid feature flag "${name}". Flag name must only be composed of uppercase letters and underscores.`
        );
    }
    if (value === undefined) {
        throw new Error(`Invalid feature flag "${name}". Flag is undefined.`);
    }

    const objectPath = memberExpressionPath.get('object');
    const isRuntimeLookup = objectPath.isIdentifier({ name: RUNTIME_FLAGS_IDENTIFIER });
    if (isRuntimeLookup && !opts.prod) {
        throw new Error(
            `Runtime flags should never be used directly and should only be added by the compiler.`
        );
    }
}

function isBindingReference(path, scope) {
    const binding = scope && scope.getBinding(path.node.name);
    return !!(binding && binding.referencePaths.includes(path));
}

module.exports = function({ types: t }) {
    return {
        name: 'babel-plugin-lwc-features',
        visitor: {
            // `pre()` doesn't have access to the `this.opts` plugin options so
            // we initialize in the Program visitor instead.
            Program() {
                this.featureFlags = this.opts.featureFlags || defaultFeatureFlags;
            },
            ImportDeclaration(path) {
                if (path.node.source.value === '@lwc/features') {
                    this.importDeclarationPath = path;
                }
            },
            ImportDefaultSpecifier(path) {
                // If this is the default specifier for the @lwc/features import declaration
                if (path.parentPath === this.importDeclarationPath) {
                    this.defaultImportPath = path;
                    const specifiers = this.importDeclarationPath.node.specifiers;
                    const didImportRuntimeFlags = specifiers
                        // Filter out the default import specifier
                        .filter(specifier => specifier !== path.node)
                        // Check if we've already imported runtime flags
                        .some(specifier => {
                            return specifier.imported.name === RUNTIME_FLAGS_IDENTIFIER;
                        });
                    if (!didImportRuntimeFlags) {
                        // Blindly import a binding for `runtimeFlags`. Tree-shaking
                        // will simply remove it if unused.
                        this.importDeclarationPath.node.specifiers.push(
                            t.importSpecifier(
                                t.identifier(RUNTIME_FLAGS_IDENTIFIER),
                                t.identifier(RUNTIME_FLAGS_IDENTIFIER)
                            )
                        );
                    }
                }
            },
            IfStatement(path) {
                let testPath = path.get('test');

                const isUnaryNegation = testPath.isUnaryExpression({ operator: '!' });
                if (isUnaryNegation) {
                    testPath = testPath.get('argument');
                }

                if (!testPath.isMemberExpression()) {
                    return;
                }

                const objectPath = testPath.get('object');
                const propertyPath = testPath.get('property');
                const isRuntimeFlag = objectPath.isIdentifier({ name: RUNTIME_FLAGS_IDENTIFIER });

                let isCompileTimeFlag = false;
                if (this.defaultImportPath) {
                    isCompileTimeFlag = objectPath.isIdentifier({
                        name: this.defaultImportPath.node.local.name,
                    });
                }

                // If the member expression is not a feature flag lookup
                if (!isRuntimeFlag && !isCompileTimeFlag) {
                    return;
                }
                // If the member expression object is not binding reference to the feature flag object
                if (!isBindingReference(objectPath, this.importDeclarationPath.scope)) {
                    return;
                }

                validate(testPath, this);

                const name = propertyPath.node.name;
                let value = this.featureFlags[name];

                if (!this.opts.prod || value === null) {
                    testPath.replaceWithSourceString(`${RUNTIME_FLAGS_IDENTIFIER}.${name}`);
                    return;
                }

                if (this.opts.prod) {
                    if (isUnaryNegation) {
                        value = !value;
                    }
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
