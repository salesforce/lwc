/* eslint-env node */
const pathLib = require('path');

const API_DECORATOR = 'api';
const WIRE_DECORATOR = 'wire';
const KEYS_DATA_DECORATOR = { PARAMS: 'params', STATIC: 'static', TYPE: 'type', METHOD: 'method' };
const KEY_PROPS = 'publicProps';
const KEY_METHODS = 'publicMethods';
const KEY_RENDER = 'render';
const KEY_LABELS = 'labels';
const KEY_MISSPELLED_METHODS = {
    'renderCallback'     : 'renderedCallback',
    'connectCallback'    : 'connectedCallback',
    'disconnectCallback' : 'disconnectedCallback'
};

module.exports = function ({ types: t }) {
    const WireDecoratorVisitor = {
        ObjectProperty: {
            exit(path, state) {
                t.assertObjectProperty(path.node, { computed: false });
                const valueNode = path.node.value;

                if (t.isStringLiteral(valueNode) && valueNode.value[0] === '$') {
                    valueNode.value = valueNode.value.substr(1);
                    state[KEYS_DATA_DECORATOR.PARAMS].push(path.node);
                    return;
                }

                state[KEYS_DATA_DECORATOR.STATIC].push(path.node);
            }
        },
        ArrayExpression(path) {
            path.node.elements.forEach((elmt, i) => {
                t.assertStringLiteral(elmt);
                if (elmt.value[0] === '$') {
                    const literal = path.get(`elements.${i}`);
                    throw literal.buildCodeFrameError(`Dynamic variable "${literal.node.value}" is not allowed within arrays`);
                }
            })
        }
        // TODO: ObjectExpression validation checks
    };

    const DecoratorVisitor = {
        Decorator(path, { wiredData, publicMethods, publicProps, key, isMethod }) {
            const expr = path.node.expression;
            const fnDecorator = t.isCallExpression(expr);
            const decoratorName = fnDecorator ? expr.callee.name : expr.name;

            // @api decorator
            if (decoratorName === API_DECORATOR) {
                const list = isMethod ? publicMethods : publicProps;
                const value = isMethod ? key : t.objectProperty(t.identifier(key), t.numericLiteral(1));
                list.push(value);
                path.remove();
                return;
            }

            // @data decorator
            if (decoratorName === WIRE_DECORATOR) {
                const typeNode = expr.arguments[0];
                t.assertStringLiteral(typeNode);
                const type = typeNode.value;
                const props = { [KEYS_DATA_DECORATOR.PARAMS]: [], [KEYS_DATA_DECORATOR.STATIC]: [] };
                path.traverse(WireDecoratorVisitor, props);
                const wiredProps = [
                    t.objectProperty(t.identifier(KEYS_DATA_DECORATOR.TYPE), t.stringLiteral(type)),
                    t.objectProperty(t.identifier(KEYS_DATA_DECORATOR.PARAMS), t.objectExpression(props[KEYS_DATA_DECORATOR.PARAMS])),
                    t.objectProperty(t.identifier(KEYS_DATA_DECORATOR.STATIC), t.objectExpression(props[KEYS_DATA_DECORATOR.STATIC]))
                ];

                if (isMethod) {
                    wiredProps.unshift(t.objectProperty(t.identifier(KEYS_DATA_DECORATOR.METHOD), t.numericLiteral(1)));
                }

                wiredData.push(t.objectProperty(t.identifier(key), t.objectExpression(wiredProps)));

                path.remove();
                return;
            }

            throw path.buildCodeFrameError(`Unknown decorator @${decoratorName}. Only @${API_DECORATOR} and @${WIRE_DECORATOR} decorators are allowed`);
        }
    };

    return {
        name: 'raptor-class-transform',
        pre(file) {
            file.metadata.labels = [];
        },
        visitor: {
            Program: {
                enter(path, state) {
                    const body = path.node.body;
                    const defaultExport = body.find(n => t.isExportDefaultDeclaration(n));
                    const declaration = defaultExport && defaultExport.declaration;
                    const isNamedClass = declaration && t.isClassDeclaration(declaration) && declaration.id;

                    // If there is not default class export no transformation will happen
                    if (!isNamedClass) {
                        path.stop();
                        return;
                    }

                    state.opts.className = declaration.id.name;
                    state.opts.componentNamespace = state.opts.componentNamespace;
                }
            },
            ClassDeclaration(path, state) {
                const className = path.get('id.name').node;
                const extraBody = transformClassBody.call(this, className, path.get('body'), state);
                path.getStatementParent().insertAfter(extraBody);
            }
        }
    };

    function addClassStaticMember(className, prop, blockStatement) {
        return t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.identifier(className), t.identifier(prop)), blockStatement));
    }

    function injectRenderer(className, path, state) {
        const classPath = state.opts.componentName || state.file.opts.filename;
        const cmpName = pathLib.basename(classPath, '.js');
        const name = './' + cmpName + '.html';
        const id = state.file.addImport(name, 'default', 'tmpl');

        path.pushContainer('body', t.classMethod(
            'method',
            t.identifier(KEY_RENDER), [],
            t.blockStatement([t.returnStatement(id)])
        ));
    }

    function transformClassBody(className, path, state) {
        const knownStaticKeys = { [KEY_PROPS]: false, [KEY_METHODS]: false, [WIRE_DECORATOR]: false };
        const publicProps = [], publicMethods = [], wiredData = [], extraBody = [];
        const labels = state.file.metadata.labels;
        const classBody = path.get('body');

        for (let prop of classBody) {
            let key = prop.node.key.name;

            // Fields
            if (prop.isClassProperty()) {

                // Non-static fields
                if (!prop.node.static) {
                    if (prop.node.key.name === 'state' && prop.node.decorators) { // Blacklist state from pulicProps
                        throw prop.buildCodeFrameError('Decorators are not supported in property state');
                    }

                    prop.traverse({ ThisExpression() { throw new Error('Reference to the instance is not allowed in class properties'); }});
                    // Parse decorators
                    prop.traverse(DecoratorVisitor, { publicProps, wiredData, key})

                // Static fields
                } else {
                    knownStaticKeys[key] = key in knownStaticKeys; // If defined, do not override it

                    // This is a temporal workaround to prefetch labels until we implement i18n properly
                    // https://git.soma.salesforce.com/raptor/raptor/issues/196
                    if (key === KEY_LABELS && prop.node.value.elements) {
                        labels.push.apply(labels, prop.node.value.elements.map(m => m.value));
                    } else {
                        extraBody.push(addClassStaticMember(className, key, prop.node.value));
                    }

                    prop.remove(); // Remove all static fields since we have moved them already
                }

            // Methods
            } else if (prop.isClassMethod({ kind: 'method' })) {
                // Push to public method
                prop.traverse(DecoratorVisitor, { wiredData, publicMethods, key, isMethod: true })

                if (key in KEY_MISSPELLED_METHODS) {
                    throw path.buildCodeFrameError(`Wrong lifecycle method name ${key}. You probably meant ${KEY_MISSPELLED_METHODS[key]}`);
                }

                // If it has a render method later we won't do the transform
                if (key === KEY_RENDER && !prop.node.static) {
                    knownStaticKeys[key] = true;
                }
            }
        }

        if (!knownStaticKeys[KEY_PROPS] && publicProps.length) {
            extraBody.push(addClassStaticMember(className, KEY_PROPS, t.objectExpression(publicProps)));
        }

        if (!knownStaticKeys[KEY_METHODS] && publicMethods.length) {
            extraBody.push(addClassStaticMember(className, KEY_METHODS, t.valueToNode(publicMethods)));
        }

        if (!knownStaticKeys[WIRE_DECORATOR] && wiredData.length) {
            extraBody.push(addClassStaticMember(className, WIRE_DECORATOR, t.objectExpression(wiredData)));
        }

        if (!knownStaticKeys[KEY_RENDER]) {
            injectRenderer(className, path, state);
        }

        return extraBody;
    }
}
