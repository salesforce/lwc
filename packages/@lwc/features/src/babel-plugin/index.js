/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const defaultFeatureFlags = require('../../').default;

const RUNTIME_FLAGS_IDENTIFIER = 'runtimeFlags';

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
                path.traverse(FeatureFlagVisitor, this);
            },
        },
    };
};

const FeatureFlagVisitor = {
    MemberExpression(path) {
        const objectPath = path.get('object');
        const propertyPath = path.get('property');
        const isCompileTimeLookup =
            this.defaultImportPath &&
            objectPath.isIdentifier({ name: this.defaultImportPath.node.local.name });
        const isRuntimeLookup = objectPath.isIdentifier({ name: RUNTIME_FLAGS_IDENTIFIER });
        const importDeclarationScope =
            this.importDeclarationPath && this.importDeclarationPath.scope;
        if (
            (isCompileTimeLookup || isRuntimeLookup) &&
            propertyPath.isIdentifier() &&
            isBindingReference(objectPath, importDeclarationScope)
        ) {
            validate.call(this, path);

            const isUnaryNegation = path.parentPath.isUnaryExpression({ operator: '!' });
            const ifStatementPath = isUnaryNegation ? path.parentPath.parentPath : path.parentPath;

            const name = propertyPath.node.name;
            let value = this.featureFlags[name];

            if (!this.opts.prod || value === null) {
                path.replaceWithSourceString(`${RUNTIME_FLAGS_IDENTIFIER}.${name}`);
                return;
            }

            if (this.opts.prod) {
                if (isUnaryNegation) {
                    value = !value;
                }
                if (value === true) {
                    // Transform the IfStatement into a BlockStatement
                    ifStatementPath.replaceWith(ifStatementPath.node.consequent);
                }
                if (value === false) {
                    // Remove IfStatement
                    ifStatementPath.remove();
                }
            }
        }
    },
};

function validate(memberExpressionPath) {
    const name = memberExpressionPath.node.property.name;
    const value = this.featureFlags[name];
    if (!/[A-Z_]+/.test(name)) {
        throw new Error(
            `Invalid feature flag "${name}". Flag name must only be composed of uppercase letters and underscores.`
        );
    }
    if (value === undefined) {
        throw new Error(`Invalid feature flag "${name}". Flag is undefined.`);
    }

    let parentPath = memberExpressionPath.parentPath;
    if (parentPath.isUnaryExpression({ operator: '!' })) {
        parentPath = parentPath.parentPath;
    }
    if (!parentPath.isIfStatement()) {
        throw new Error(
            `Member expressions or unary negations of member expressions are the only supported ways to use feature flags.`
        );
    }

    const objectPath = memberExpressionPath.get('object');
    const isRuntimeLookup = objectPath.isIdentifier({ name: RUNTIME_FLAGS_IDENTIFIER });
    if (isRuntimeLookup && !this.opts.prod) {
        throw new Error(
            `Runtime flags should never be used directly and should only be added by the compiler.`
        );
    }
}
