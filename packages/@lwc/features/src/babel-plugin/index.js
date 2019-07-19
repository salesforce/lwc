const template = require('@babel/template');

const buildRequire = template.expression('global.LWC_config.features.FEATURE_FLAG');

// This plugin relies on the feature flag import declaration appearing before
// feature flag usage. Dynamic imports are not supported.
module.exports = function({ types: t }) {
    const runtimeFeatureFlagVisitor = {
        Identifier(path) {
            const {
                node: { name },
            } = path;
            if (this.runtimeFeatureFlags.includes(name)) {
                const expression = buildRequire({
                    FEATURE_FLAG: t.identifier(name),
                });
                path.replaceWith(expression);
                // We replace this identifier with a MemberExpression that uses
                // the same identifier and we don't want to process it again.
                path.skip();
            }
        },
    };
    return {
        visitor: {
            ImportDeclaration(path, state) {
                const { node } = path;
                if (node.source.value === '@lwc/features') {
                    state.runtimeFeatureFlags = node.specifiers
                        .map(specifier => specifier.imported.name)
                        .filter(name => state.opts.featureFlags[name] === null);
                }
            },
            IfStatement(path, state) {
                const runtimeFeatureFlags = state.runtimeFeatureFlags;
                if (runtimeFeatureFlags && runtimeFeatureFlags.length) {
                    path.traverse(runtimeFeatureFlagVisitor, { runtimeFeatureFlags });
                }
            },
        },
    };
};
