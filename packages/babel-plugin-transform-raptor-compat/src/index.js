/* eslint-env node */
module.exports = function ({ types: t }) {

    function convertProperty(property, isComputed = false) {
        return t.isIdentifier(property) && !isComputed ? t.stringLiteral(property.name) : property;
    }

    return {
        visitor: {
            /*
            Transforms:
                a.b    => getKey(a, "b")
                a["b"] => getKey(a, "b")
                a[b]   => getKey(a, b);
            */
            MemberExpression(path, state) {
                const { property, object, computed } = path.node;

                const id = state.addImport('engine', 'getKey');
                const args = [object, convertProperty(property, computed)];
                path.replaceWith(t.callExpression(id, args));
            },
            AssignmentExpression(path, state) {
                let { left, right, operator, computed } = path.node;
                let assignment, args;

                // Skip assigments such as var a = 1;
                if (!t.isMemberExpression(left)) {
                    return;
                }

                args = [left.object, convertProperty(left.property, computed), right];
                if (operator !== "=") {
                    args[2] = t.binaryExpression(operator.slice(0, -1), left, right);
                }

                const id = state.addImport('engine', 'setKey');
                assignment = t.callExpression(id, args);

                if (assignment) {
                    path.replaceWith(assignment);
                }
            },
            UnaryExpression(path, state) {
                const { operator, argument } = path.node;
                if (operator === "delete" && t.isMemberExpression(argument)) {
                    const args = [
                        argument.object,
                        convertProperty(argument.property, argument.computed)
                    ];

                    const id = state.addImport('engine', 'deleteKey');
                    const deletion = t.callExpression(id, args);
                    path.replaceWith(deletion);
                }
            },
            UpdateExpression(path, state) {
                const { operator, argument, prefix } = path.node;
                let assignment, args;

                if (!t.isMemberExpression(argument)) {
                    return;
                }

                args = [argument.object, convertProperty(argument.property, argument.computed)];
                const tmpOperator = operator == "++" ? "+" : "-";
                args[2] = t.binaryExpression(tmpOperator, argument, t.numericLiteral(1));

                if (prefix) {
                    args[3] = argument;
                }

                const id = state.addImport('engine', 'setKey');
                assignment = t.callExpression(id, args);
                path.replaceWith(assignment);
            },
            ForInStatement(path, state) {
                const { node } = path;

                const id = state.addImport('engine', 'iteratorKey');
                const wrappedIterator = t.callExpression(id, [node.right]);
                node.right = wrappedIterator;
            },
            BinaryExpression(path, state) {
                const { operator, left, right } = path.node;
                if (operator !== 'in') {
                    return;
                }

                const id = state.addImport('engine', 'inKey');
                const warppedInOperator = t.callExpression(id, [right, left]);
                path.replaceWith(warppedInOperator)
            }
        }
    };
}
