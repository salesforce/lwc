const shared = require('@lwc/shared');

/** @type {import('eslint').JSRuleDefinition} */
module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Prefer use of @lwc/shared over Array/String/Object methods.',
        },
        fixable: 'code',
    },

    create(context) {
        return {
            /** @param {import('estree').ImportDeclaration & import('eslint').Rule.NodeParentExtension} node  */
            ImportDeclaration(node) {
                if (node.source.value !== '@lwc/shared') return;
                for (const spec of node.specifiers) {
                    if (
                        spec.type !== 'ImportSpecifier' ||
                        !spec.imported.name.startsWith('is') ||
                        spec.imported.name in shared
                    ) {
                        continue;
                    }
                    context.report({
                        node: spec,
                        message: `Don't import ${spec.imported.name}`,
                        fix(fixer) {
                            return fixer.replaceText(spec, '');
                        },
                    });
                }
            },
        };
    },
};
