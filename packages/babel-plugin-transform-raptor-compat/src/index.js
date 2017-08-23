/* eslint-env node */
const defaultResolveOptions = {
    module: 'proxy-compat'
};

module.exports = function({ types: t }) {
    let keysSeen = Object.create(null);

    function convertProperty(property, isComputed = false) {
        return t.isIdentifier(property) && !isComputed
            ? t.stringLiteral(property.name)
            : property;
    }

    function getResolveOptions (state) {
        const { resolveProxyCompat } = state.opts;
        return resolveProxyCompat || defaultResolveOptions;
    }

    function resolveCompatProxyImport(memberName, path, state) {
        const { module: moduleName, global: globalPropertyName } = getResolveOptions(state);
        if (moduleName) {
            return state.addImport(moduleName, memberName);
        } else if (globalPropertyName) {
            const localName = `_${memberName}`;
            if (!keysSeen[memberName]) {
                keysSeen[memberName] = {
                    localName
                };
            }
            return t.identifier(localName);
        }
    }

    return {
        visitor: {
            Program: {
                /**
                 * Inserts to top of module:
                 *     const {
                 *          setKey: _setKey,
                 *          callKey: _callKey,
                 *          getKey: _getKey,
                 *          deleteKey: _deleteKey,
                 *          iterableKey: _iterableKey,
                 *          inKey: _inKey
                 *     } = GLOBAL_VARIABLE;
                 */
                exit: function (path, state) {
                    const { global: globalPropertyName } = getResolveOptions(state);
                    if (globalPropertyName) {
                        const objectProperties = Object.keys(keysSeen).map((memberName) => {
                            const { localName } = keysSeen[memberName];
                            return t.objectProperty(
                                t.identifier(memberName),
                                t.identifier(localName)
                            );
                        });
                        const assignment = t.variableDeclaration(
                            'const',
                            [
                                t.VariableDeclarator(
                                    t.objectPattern(objectProperties),
                                    t.identifier(globalPropertyName)
                                )
                            ]
                        );
                        path.unshiftContainer('body', [assignment]);
                    }
                }
            },

            /**
             * Transforms:
             *      a.b    => getKey(a, "b")
             *      a["b"] => getKey(a, "b")
             *      a[b]   => getKey(a, b);
             */
            MemberExpression(path, state) {
                const { property, object, computed } = path.node;
                const id = resolveCompatProxyImport('getKey', path, state);
                const args = [object, convertProperty(property, computed)];
                path.replaceWith(t.callExpression(id, args));
            },

            /**
             * Transforms:
             *      obj.f = 1;   =>   setKey(obj, "f", 1);
             */
            AssignmentExpression(path, state) {
                let { left, right, operator } = path.node;
                let assignment, args;

                // Skip assigments such as var a = 1;
                if (!t.isMemberExpression(left)) {
                    return;
                }

                args = [
                    left.object,
                    convertProperty(left.property, left.computed),
                    right
                ];
                if (operator !== '=') {
                    args[2] = t.binaryExpression(
                        operator.slice(0, -1),
                        left,
                        right
                    );
                }

                const id = resolveCompatProxyImport('setKey', path, state);
                assignment = t.callExpression(id, args);

                if (assignment) {
                    path.replaceWith(assignment);
                }
            },

            /**
             * Transforms:
             *     console.log('foo', 'bar');   =>   callKey(console, 'log', 'foo', 'bar');
             */
            CallExpression(path, state) {
                const { callee, arguments: args } = path.node;
                if (t.isMemberExpression(callee)) {
                    const { property, object, computed } = callee;
                    const callArguments = [
                        object,
                        convertProperty(property, computed),
                        ...args
                    ];

                    const id = resolveCompatProxyImport('callKey', path, state);
                    const call = t.callExpression(id, callArguments);
                    path.replaceWith(call);
                }
            },

            /**
             * Transforms:
             *      delete obj.f;   =>   deleteKey(obj, 'f')
             */
            UnaryExpression(path, state) {
                const { operator, argument } = path.node;
                if (operator === 'delete' && t.isMemberExpression(argument)) {
                    const args = [
                        argument.object,
                        convertProperty(argument.property, argument.computed)
                    ];

                    const id = resolveCompatProxyImport('deleteKey', path, state);
                    const deletion = t.callExpression(id, args);
                    path.replaceWith(deletion);
                }
            },

            /**
             * Transforms:
             *      obj.e++;   =>   _setKey(obj, "e", _getKey(obj, "e") + 1, _getKey(obj, "e"));
             *      ++obj.e;   =>    _setKey(obj, "f", _getKey(obj, "f") + 1);
             */
            UpdateExpression(path, state) {
                const { operator, argument, prefix } = path.node;

                // Do nothing for: i++
                if (!t.isMemberExpression(argument)) {
                    return;
                }

                const updatedValue = t.binaryExpression(
                    operator == '++' ? '+' : '-',
                    argument,
                    t.numericLiteral(1)
                );
                const args = [
                    argument.object,
                    convertProperty(argument.property, argument.computed),
                    updatedValue,
                ];

                // return old value and increment: obj.i++
                if (!prefix) {
                    args.push(argument);
                }

                const id = resolveCompatProxyImport('setKey', path, state);
                const assignment = t.callExpression(id, args);
                path.replaceWith(assignment);
            },

            /**
             * Transforms:
             *      for (let k in obj) {}   =>   for (let k in _iterableKey(obj)) {}
             */
            ForInStatement(path, state) {
                const { node } = path;

                const id = resolveCompatProxyImport('iterableKey', path, state);
                const wrappedIterator = t.callExpression(id, [node.right]);
                node.right = wrappedIterator;
            },

            /**
             * Transforms:
             *      if ("x" in obj) {}   =>   if (_inKey(obj, "x")) {}
             */
            BinaryExpression(path, state) {
                const { operator, left, right } = path.node;
                if (operator !== 'in') {
                    return;
                }

                const id = resolveCompatProxyImport('inKey', path, state);
                const warppedInOperator = t.callExpression(id, [right, left]);
                path.replaceWith(warppedInOperator);
            }
        }
    };
};
