const shared = require('@lwc/shared');

const eqMethods = new Set(['isUndefined', 'isNull', 'isTrue', 'isFalse']);
const typeofMethods = new Set(['isObject', 'isString', 'isNumber', 'isBoolean']);

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
            /** @param {import('estree').Identifier & import('eslint').Rule.NodeParentExtension} node  */
            'CallExpression > Identifier'(node) {
                const { name } = node;
                if (!eqMethods.has(name) && !typeofMethods.has(name)) return;
                const scope = context.sourceCode.getScope(node);
                //scope.references.filter(r => r.resolved.name === node.name)[0].resolved.defs[0].type
                const refs = Array.from(
                    new Set(
                        scope.references
                            .filter((r) => r.resolved?.name === node.name)
                            .map((r) => r.resolved)
                    )
                );
                if (refs.length !== 1) throw new Error(`Refs: ${refs.length}`);
                // if (refs.length !== 1) debugger;
                const defs = refs[0].defs;
                if (defs.length !== 1) throw new Error(`Defs: ${defs.length}`);
                const def = defs[0];
                if (def.type !== 'ImportBinding') throw new Error(`Type: ${def.type}`);
                if (def.parent.source.value !== '@lwc/shared')
                    throw new Error(`Source: ${def.parent.source.value}`);
                const tag =
                    node.parent.parent.type === 'UnaryExpression'
                        ? node.parent.parent.operator
                        : '>';
                context.report({
                    node,
                    message: `${tag} ${name}`,
                });
            },
        };
    },
};
