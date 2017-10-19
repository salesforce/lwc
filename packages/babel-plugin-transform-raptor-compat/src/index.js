/* eslint-env node */
const KEYS = require('./keys');

const defaultResolveOptions = {
    module: 'proxy-compat'
};

function compatPlugin({ types: t }) {
    function convertProperty(property, isComputed = false) {
        return t.isIdentifier(property) && !isComputed
            ? t.stringLiteral(property.name)
            : property;
    }

    function getResolveOptions (state) {
        const { resolveProxyCompat } = state.opts;
        return resolveProxyCompat || defaultResolveOptions;
    }

    /**
     * Retrieve the indentifier for a proxy-compat API.
     */
    function resolveCompatProxyImport(memberName, keysSeen) {
        // Create a local identifier and register it
        if (!keysSeen[memberName]) {
            keysSeen[memberName] = t.identifier(`__${memberName}`);
        }

        return keysSeen[memberName];
    }

    return {
        pre() {
            // Validate transform config
            const opts = getResolveOptions(this);
            const resolveProxyCompat = opts.module || opts.global || opts.independent;

            if (resolveProxyCompat == undefined) {
                throw new Error(`Unexcepted resolveProxyCompat option, expected property "module", "global" or "independent"`);
            }

            // Object to record used proxy compat APIs
            this.keysSeen = Object.create(null);
        },

        visitor: {
            Program: {
                /**
                 * Retrieve APIs for proxy compat
                 */
                exit: function (path, state) {
                    const {
                        global: globalName,
                        module: moduleName,
                        independent: independentPrefix,
                    } = getResolveOptions(state);

                    const statements = [];

                    if (independentPrefix) {
                        // Generate individual import statements for each API, eg:
                        //   import __getKey from 'proxy-compat/getKey';
                        const imports = Object.keys(this.keysSeen).map(apiName => (
                            t.importDeclaration(
                                [t.importDefaultSpecifier(this.keysSeen[apiName])],
                                t.stringLiteral(`${independentPrefix}/${apiName}`),
                            )
                        ));

                        statements.push(...imports);
                    } else if (globalName || moduleName) {
                        let proxyCompatIdentifier;

                        if (globalName) {
                            // Get identifier for global
                            proxyCompatIdentifier = t.identifier(globalName);
                        } else if (moduleName) {
                            // Add import statement and get default identifier
                            proxyCompatIdentifier = t.identifier('__ProxyCompat');
                            statements.push(
                                t.importDeclaration(
                                    [t.importDefaultSpecifier(proxyCompatIdentifier)],
                                    t.stringLiteral(moduleName),
                                ),
                            );
                        }

                        // Deference apis from the proxyCompat identifier
                        const apiDereference = Object.keys(this.keysSeen).map(apiName => (
                            t.variableDeclaration('var', [
                                t.variableDeclarator(
                                    this.keysSeen[apiName],
                                    t.memberExpression(
                                        proxyCompatIdentifier,
                                        t.identifier(apiName)
                                    )
                                )
                            ])
                        ));

                        statements.push(...apiDereference);
                    }

                    // We need to make sure babel doesn't visit the newly created variable declaration.
                    // Otherwise it will apply the proxy transform to the member expression to retrive the proxy APIs.
                    path.stop();

                    // Finally add to the top of the file the API declarations
                    path.unshiftContainer('body', statements);
                }
            },

            /**
             * Transforms:
             *      a.b    => getKey(a, "b")
             *      a["b"] => getKey(a, "b")
             *      a[b]   => getKey(a, b);
             */
            MemberExpression(path) {
                const { property, object, computed } = path.node;
                const id = resolveCompatProxyImport(KEYS.GET_KEY, this.keysSeen);
                const args = [object, convertProperty(property, computed)];
                path.replaceWith(t.callExpression(id, args));
            },

            /**
             * Transforms:
             *      obj.f = 1;   =>   setKey(obj, "f", 1);
             */
            AssignmentExpression(path) {
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

                const id = resolveCompatProxyImport(KEYS.SET_KEY, this.keysSeen);
                assignment = t.callExpression(id, args);

                if (assignment) {
                    path.replaceWith(assignment);
                }
            },

            /**
             * Transforms:
             *     console.log('foo', 'bar');   =>   callKey(console, 'log', 'foo', 'bar');
             */
            CallExpression(path) {
                const { callee, arguments: args } = path.node;
                if (t.isMemberExpression(callee)) {
                    const { property, object, computed } = callee;
                    const callArguments = [
                        object,
                        convertProperty(property, computed),
                        ...args
                    ];

                    const id = resolveCompatProxyImport(KEYS.CALL_KEY, this.keysSeen);
                    const call = t.callExpression(id, callArguments);
                    path.replaceWith(call);
                }
            },

            /**
             * Transforms:
             *      delete obj.f;   =>   deleteKey(obj, 'f')
             */
            UnaryExpression(path) {
                const { operator, argument } = path.node;
                if (operator === 'delete' && t.isMemberExpression(argument)) {
                    const args = [
                        argument.object,
                        convertProperty(argument.property, argument.computed)
                    ];

                    const id = resolveCompatProxyImport(KEYS.DELETE_KEY, this.keysSeen);
                    const deletion = t.callExpression(id, args);
                    path.replaceWith(deletion);
                }
            },

            /**
             * Transforms:
             *      obj.e++;   =>   _setKey(obj, "e", _getKey(obj, "e") + 1, _getKey(obj, "e"));
             *      ++obj.e;   =>    _setKey(obj, "f", _getKey(obj, "f") + 1);
             */
            UpdateExpression(path) {
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

                const id = resolveCompatProxyImport(KEYS.SET_KEY, this.keysSeen);
                const assignment = t.callExpression(id, args);
                path.replaceWith(assignment);
            },

            /**
             * Transforms:
             *      for (let k in obj) {}   =>   for (let k in _iterableKey(obj)) {}
             */
            ForInStatement(path) {
                const { node } = path;

                const id = resolveCompatProxyImport(KEYS.ITERABLE_KEY, this.keysSeen);
                const wrappedIterator = t.callExpression(id, [node.right]);
                node.right = wrappedIterator;
            },

            /**
             * Transforms:
             *      if ("x" in obj) {}   =>   if (_inKey(obj, "x")) {}
             */
            BinaryExpression(path) {
                const { operator, left, right } = path.node;
                if (operator === 'instanceof') {
                    const id = resolveCompatProxyImport(KEYS.INSTANCEOF_KEY, this.keysSeen);
                    const warppedInOperator = t.callExpression(id, [left, right]);
                    path.replaceWith(warppedInOperator);
                } else if (operator === 'in') {
                    const id = resolveCompatProxyImport(KEYS.IN_KEY, this.keysSeen);
                    const warppedInOperator = t.callExpression(id, [right, left]);
                    path.replaceWith(warppedInOperator);
                }
            }
        }
    };
}

compatPlugin.keys = KEYS;
module.exports = compatPlugin;
