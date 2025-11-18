const t = require('@babel/types');
const { generate } = require('@babel/generator');
const shared = require('@lwc/shared');

/** @type {typeof t} */
const bt = Object.fromEntries(
    Object.entries(t).map(([key, val]) => {
        if (typeof val !== 'function') return [];
        const [, paramStr] = val.toString().match(/function \w+\((.*?)\)/);
        const params = paramStr
            ? paramStr.split(/,\s*/).map((x) => x.split('=')[0].trim().replace(/^_/, ''))
            : [];
        const fn = (node) => {
            const args = params.map((p) => babelify(node[p]));
            return val(...args);
        };
        return [key, fn];
    })
);

const extra = {
    /** @param {import('estree').Literal} node */
    literal(node) {
        switch (typeof node.value) {
            case 'bigint':
                return t.bigIntLiteral(node.value);
            case 'string':
                return t.stringLiteral(node.value);
            case 'number':
                return t.numericLiteral(node.value);
            case 'boolean':
                return t.booleanLiteral(node.value);
            default: {
                if (node.regex) {
                    return t.regExpLiteral(node.regex.pattern, node.regex.flags);
                } else if (node.value === null) {
                    return t.nullLiteral();
                }
                throw new Error(`Missing literal: ${node.value}`);
            }
        }
    },
    /** @param {import('estree').Property} node */
    property(node) {
        return t.objectProperty(babelify(node.key), babelify(node.value));
    },
    /** @param {import('estree').ChainExpression} node */
    chainExpression(node) {
        const expr = node.expression;
        return t.optionalMemberExpression(
            babelify(expr.object),
            babelify(expr.property),
            expr.computed,
            expr.optional
        );
    },
};

const babelify = (node) => {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) return node.map(babelify);
    if (!('type' in node)) return node;
    const typeName = node.type[0].toLowerCase() + node.type.slice(1);
    const map = bt[typeName] ?? extra[typeName];
    console.log('>', node.type ?? node);
    return map(node);
};

const badNames = new Set();
for (const Ctor of [Array, String, Object]) {
    for (const prop of Object.getOwnPropertyNames(Ctor.prototype)) {
        if (Object[prop]) {
            continue;
        } else if (prop in shared) {
            badNames.add(prop);
        } else {
            const staticName = Ctor.name + prop[0].toUpperCase() + prop.slice(1);
            badNames.add(staticName);
        }
    }
}

const PROTO = { Array: Array.prototype, String: String.prototype, Object: Object.prototype };

const getReplacement = (name) => {
    const match = /^(Array|String|Object)([A-Z])(\w+?)$/.exec(name);
    if (match) {
        const [, Ctor, init, rest] = match;
        const newName = init.toLowerCase() + rest;
        if (newName in PROTO[Ctor]) return { name: newName, static: false };
    } else {
        for (const Ctor of [Array, String, Object]) {
            if (name in Ctor.prototype) return { name, static: false };
        }
    }
    throw new Error(name);
};

/** @type {import('eslint').JSRuleDefinition} */
module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Prefer use of @lwc/shared over Array/String/Object methods.',
        },
        messages: {
            noBadNames: 'Replace @lwc/shared `{{ name }}` with {{Ctor}}{{newName}}',
        },
        fixable: 'code',
    },

    create(context) {
        return {
            /** @param {import('estree').Identifier & import('eslint').Rule.NodeParentExtension} node  */
            'CallExpression > MemberExpression > Identifier'(node) {
                if (!badNames.has(node.name)) return;
                const replacement = getReplacement(node.name);
                const scope = context.sourceCode.getScope(node);
                const refs = scope.references.filter((r) => r.resolved?.name === node.name);
                if (refs.length === 0) return;
                const resolved = Array.from(new Set(refs.map((r) => r.resolved)));
                if (resolved.length > 1) throw new Error(`Resolved: ${resolved.length}`);
                const defs = resolved[0].defs;
                if (defs.length === 0) return;
                if (defs.length > 1) throw new Error(`Defs: ${defs.length}`);
                if (defs[0].type !== 'ImportBinding') return;
                context.report({
                    node,
                    messageId: 'noBadNames',
                    data: {
                        name: node.name,
                        Ctor: replacement.Ctor || '#',
                        newName: replacement.name,
                    },
                    fix(fixer) {
                        /** @type {import('estree').MemberExpression} */
                        const memberExpr = node.parent;
                        if (memberExpr.property.name === 'call') {
                            /** @type {import('estree').CallExpression} */
                            const callExpr = memberExpr.parent;
                            const [thisArg, ...realArgs] = callExpr.arguments;
                            if (!thisArg) throw new Error('empty call?');
                            const newName = getReplacement(node.name).name;
                            const replacement = t.callExpression(
                                t.memberExpression(babelify(thisArg), t.identifier(newName)),
                                babelify(realArgs)
                            );
                            return fixer.replaceText(callExpr, generate(replacement).code);
                        } else if (memberExpr.property.name === 'apply') {
                            /** @type {import('estree').CallExpression} */
                            const callExpr = memberExpr.parent;
                            if (callExpr.arguments.length !== 2) {
                                throw new Error(`Args: ${callExpr.arguments.length}`);
                            }
                            const [thisArg, argsList] = callExpr.arguments;
                            const newName = getReplacement(node.name).name;
                            if (t.isArrayExpression(argsList) || t.isArrayPattern(argsList)) {
                                throw new Error('array?');
                            }
                            const replacement = t.callExpression(
                                t.memberExpression(babelify(thisArg), t.identifier(newName)),
                                [t.spreadElement(babelify(argsList))]
                            );
                            return fixer.replaceText(callExpr, generate(replacement).code);
                        } else {
                            throw new Error(`? ${memberExpr.property.name}`);
                        }
                    },
                });
            },
        };
    },
};
