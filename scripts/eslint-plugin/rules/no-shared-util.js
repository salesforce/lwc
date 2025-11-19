const eqMethods = new Set(['isUndefined', 'isNull', 'isTrue', 'isFalse']);
const typeofMethods = new Set(['isObject', 'isString', 'isNumber', 'isBoolean', 'isFunction']);

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
                    if (spec.type !== 'ImportSpecifier') {
                        continue;
                    }
                    if (
                        eqMethods.has(spec.imported.name) ||
                        typeofMethods.has(spec.imported.name)
                    ) {
                        context.report({
                            node: spec,
                            message: `Don't import ${spec.imported.name}`,
                            fix(fixer) {
                                const re = new RegExp(`${spec.imported.name}(as \\w+?)?,?`);
                                const replacement = context.sourceCode
                                    .getText(node)
                                    .replace(re, '');
                                return fixer.replaceText(node, replacement);
                            },
                        });
                    }
                }
            },
            /** @param {import('estree').Identifier & import('eslint').Rule.NodeParentExtension} node  */
            'CallExpression > Identifier'(node) {
                if (node !== node.parent.callee) return;
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
                const src = def.parent.source.value;
                if (src === './assert') return;
                if (node.parent.arguments.length !== 1)
                    throw new Error(`Arguments: ${node.parent.arguments.length}`);
                if (src !== '@lwc/shared' && src !== './language')
                    throw new Error(`Source: ${def.parent.source.value}`);
                context.report({
                    node,
                    message: `> ${name}`,
                    fix(fixer) {
                        const grandparent = node.parent.parent;
                        const negated =
                            grandparent.type === 'UnaryExpression' && grandparent.operator === '!';
                        const expr = context.sourceCode.getText(node.parent.arguments[0]);
                        const value = name.slice(2).toLowerCase();
                        const operator = negated ? '!==' : '===';
                        const replacement = eqMethods.has(name)
                            ? `((${expr}) ${operator} ${value})`
                            : `(typeof (${expr}) ${operator} '${value}')`;
                        return fixer.replaceText(negated ? grandparent : node.parent, replacement);
                    },
                });
            },
        };
    },
};
