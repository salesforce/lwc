const errors = require('../dist/commonjs/index.js');

module.exports = function ({ types: t }) {
    return {
        visitor: {
            // Make sure this is a child of an expression statement
            CallExpression(path, state) {
                const node = path.node;
                if ('invariant' === node.callee.name) {
                    debugger;
                    path.parentPath.replaceWith(
                        generateInvariant(...path.node.arguments)
                    );
                    path.parentPath.skip();
                }
            }
        }
    }

    function generateInvariant(condition, messageKey, parameters) {
        const devStatement = generateDevStatement(messageKey, parameters);
        const prodStatement = generateProdStatement(messageKey, parameters);

        return t.ifStatement(
            t.unaryExpression('!', condition),
            t.blockStatement([
                t.ifStatement(
                    getProductionCheck(),
                    devStatement,
                    prodStatement
                )
            ])
        );
    }

    function getProductionCheck() {
        return t.binaryExpression(
            '!==',
            t.identifier('process.env.NODE_ENV'),
            t.stringLiteral('production')
        );
    }

    function generateDevStatement(messageKey, parameters) {
        const error = lookupError(messageKey);

        return t.blockStatement([
            t.expressionStatement(
                t.callExpression(
                    t.identifier('invariant'),
                    [t.booleanLiteral(false), t.stringLiteral(error.message), parameters]
                )
            ),
        ]);
    }

    function generateProdStatement(messageKey, parameters) {
        const error = lookupError(messageKey);

        return t.blockStatement([
            t.expressionStatement(
                t.callExpression(
                    t.identifier('PROD_INVARIANT'),
                    [t.numericLiteral(error.code), parameters]
                )
            )
        ]);
    }

    function lookupError(identifier) {
        const objectName = identifier.object.name;
        const propertyName = identifier.property.name;

        // Check existence first
        return errors[objectName][propertyName];
    }
}
