/* eslint-env node */
module.exports = function({ types: t }) {
    function convertProperty(property, isComputed = false) {
        return t.isIdentifier(property) && !isComputed
            ? t.stringLiteral(property.name)
            : property;
    }

    return {
        visitor: {
            /**
             * Transforms:
             *      a.b    => getKey(a, "b")
             *      a["b"] => getKey(a, "b")
             *      a[b]   => getKey(a, b);
             */
            MemberExpression(path, state) {
                const { property, object, computed } = path.node;

                const id = state.addImport('engine', 'getKey');
                const args = [object, convertProperty(property, computed)];
                path.replaceWith(t.callExpression(id, args));
            },

            /**
             * Transforms:
             *      obj.f = 1;   =>   setKey(obj, "f", 1);
             */
            AssignmentExpression(path, state) {
                let { left, right, operator, computed } = path.node;
                let assignment, args;

                // Skip assigments such as var a = 1;
                if (!t.isMemberExpression(left)) {
                    return;
                }

                args = [
                    left.object,
                    convertProperty(left.property, computed),
                    right
                ];
                if (operator !== '=') {
                    args[2] = t.binaryExpression(
                        operator.slice(0, -1),
                        left,
                        right
                    );
                }

                const id = state.addImport('engine', 'setKey');
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

                    const id = state.addImport('engine', 'callKey');
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

                    const id = state.addImport('engine', 'deleteKey');
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

                const id = state.addImport('engine', 'setKey');
                const assignment = t.callExpression(id, args);
                path.replaceWith(assignment);
            },

            /**
             * Transforms:
             *      for (let k in obj) {}   =>   for (let k in _iterableKey(obj)) {}
             */
            ForInStatement(path, state) {
                const { node } = path;

                const id = state.addImport('engine', 'iterableKey');
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

                const id = state.addImport('engine', 'inKey');
                const warppedInOperator = t.callExpression(id, [right, left]);
                path.replaceWith(warppedInOperator);
            }
        }
    };
};
