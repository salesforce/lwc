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

/** @param {import('eslint').Rule.NodeParentExtension & import('estree').SimpleCallExpression} node */
const isStaticCall = (node) => {
    const { callee } = node;
    if (callee.type !== 'MemberExpression') return false;
    const { object } = callee;
    if (object.type !== 'Identifier') return false;
    const { name } = object;
    return name === 'Array' || name === 'String' || name === 'Object';
};

const getProto = ({ prototype: proto }) => {
    return new Set(
        Object.getOwnPropertyNames(proto).filter((prop) => typeof proto[prop] === 'function')
    );
};

const ArrayProto = getProto(Array);
const StringProto = getProto(String);
const ObjectProto = getProto(Object);

const getReplacementName = (method) => {
    // `toString` is likely to be a false positive; don't fix
    if (method === 'toString') return null;
    if (method in shared) return method;
    if (ArrayProto.has(method) && StringProto.has(method)) {
        return null; // can't figure out which one
    }
    let type;
    if (ArrayProto.has(method)) type = 'Array';
    else if (StringProto.has(method)) type = 'String';
    else return null;
    // "method" -> "ArrayMethod"
    return type + method[0].toUpperCase() + method.slice(1);
};

/** @param {import('eslint').Rule.NodeParentExtension & import('estree').SimpleCallExpression} node */
function isProtoCall(node) {
    const { callee } = node;
    if (callee.type !== 'MemberExpression') return false;
    const { property } = callee;
    if (property.type !== 'Identifier') return false;
    const { name } = property;
    return ArrayProto.has(name) || StringProto.has(name) || ObjectProto.has(name);
}

/** @type {import('eslint').JSRuleDefinition} */
module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Prefer use of @lwc/shared over Array/String/Object methods.',
        },
        messages: {
            noStaticCall:
                'Import from @lwc/shared instead of using static {{ identifier }} methods.',
            noProtoCall: 'Import from @lwc/shared instead of using prototype methods.',
        },
        fixable: 'code',
    },

    create(context) {
        return {
            CallExpression(node) {
                if (isStaticCall(node)) {
                    const Ctor = node.callee.object.name;
                    context.report({
                        node,
                        messageId: 'noStaticCall',
                        data: { identifier: Ctor },
                        // fix(fixer) {
                        //     return fixer.replaceText(node.callee, node.callee.property.name);
                        // },
                    });
                } else if (isProtoCall(node)) {
                    context.report({
                        node,
                        messageId: 'noProtoCall',
                        data: { identifier: '' },
                        // fix(fixer) {
                        //     // arr.push(val) => ArrayPush.call(arr, val)
                        //     const { object, property } = node.callee;
                        //     const newName = getReplacementName(property.name);
                        //     if (!newName) return;

                        //     const newCall = t.callExpression(
                        //         t.memberExpression(t.identifier(newName), t.identifier('call')),
                        //         [object, ...node.arguments].map(babelify)
                        //     );

                        //     return fixer.replaceText(node, generate(newCall).code);
                        // },
                    });
                }
            },
        };
    },
};
