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
// Taken from https://github.com/sindresorhus/decamelize
function decamelize(str) {
    const sep = '-';
    return str
		.replace(/([a-z\d])([A-Z])/g, '$1' + sep + '$2')
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + sep + '$2')
		.toLowerCase();
}

const PUBLIC_PROPERTY_GETTER_BIT_MASK = 1;
const PUBLIC_PROPERTY_SETTER_BIT_MASK = 2;

module.exports = function ({ types: t }) {
    const WireDecoratorVisitor = {
        ObjectProperty: {
            exit(path, state) {
                t.assertObjectProperty(path.node, { computed: false });
                const valueNode = path.node.value;

                if (t.isStringLiteral(valueNode) && valueNode.value[0] === '$') {
                    valueNode.value = valueNode.value.substr(1);
                    state[KEYS_DATA_DECORATOR.PARAMS].push(path.node);
                    state.wiredKeys.push(decamelize(valueNode.value));
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

    function getPublicPropertyObjectExpression (propertyMask, propertyType) {
        const expressions = [
            t.objectProperty(t.identifier('config'), t.numericLiteral(propertyMask))
        ];

        if (propertyType) {
            expressions.push(t.objectProperty(t.identifier('type'), t.stringLiteral(propertyType)))
        }

        return t.objectExpression(expressions);
    }

    const DecoratorVisitor = {
        Decorator(path, { wiredData, publicMethods, publicProps, key, isMethod, wiredKeys = [], propertyMask, propertyType }) {
            const expr = path.node.expression;
            const fnDecorator = t.isCallExpression(expr);
            const decoratorName = fnDecorator ? expr.callee.name : expr.name;

            // @api decorator
            if (decoratorName === API_DECORATOR) {
                const list = isMethod ? publicMethods : publicProps;
                const value = isMethod ? key : t.objectProperty(t.identifier(key), getPublicPropertyObjectExpression(propertyMask, propertyType));
                list.push(value);
                path.remove();
                return;
            }

            // @data decorator
            if (decoratorName === WIRE_DECORATOR) {
                const typeNode = expr.arguments[0];
                t.assertStringLiteral(typeNode);
                const type = typeNode.value;
                const props = { [KEYS_DATA_DECORATOR.PARAMS]: [], [KEYS_DATA_DECORATOR.STATIC]: [], wiredKeys: wiredKeys };
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

    function getPropertyGroups (prop, classBody, key) {
        return classBody.reduce((grouped, prop) => {
            const isGetter = prop.isClassMethod({ kind: 'get' });
            const isSetter = prop.isClassMethod({ kind: 'set' });
            const isProperty = prop.isClassProperty();

            if (prop.node.key.name === key && (isGetter || isSetter || isProperty)) {
                if (isGetter) {
                    grouped.getters.push(prop);
                } else if (isSetter) {
                    grouped.setters.push(prop);
                } else {
                    grouped.defaults.push(prop);
                }
            }

            return grouped;
        }, {
            getters: [],
            setters: [],
            defaults: []
        });
    }

    function getPropertyType (prop) {
        if (prop && prop.node.value) {
            return typeof prop.node.value.value;
        }

        return undefined;
    }

    function getPropertyMask (getters, setters, defaults) {
        if (setters.length || getters.length) {
            return (setters.length && PUBLIC_PROPERTY_SETTER_BIT_MASK) | (getters.length && PUBLIC_PROPERTY_GETTER_BIT_MASK);
        }

        return PUBLIC_PROPERTY_SETTER_BIT_MASK | PUBLIC_PROPERTY_GETTER_BIT_MASK;
    }

    function transformClassBody(className, path, state) {
        const knownStaticKeys = { [KEY_PROPS]: false, [KEY_METHODS]: false, [WIRE_DECORATOR]: false };
        const publicProps = [], publicMethods = [], wiredData = [], extraBody = [], wiredKeys = [], expandedProperties = {};
        const labels = state.file.metadata.labels;
        const classBody = path.get('body');
        let observedAttributesProperty;

        for (let prop of classBody) {
            let key = prop.node.key.name;
            const isGetter = prop.isClassMethod({ kind: 'get' });
            const isSetter = prop.isClassMethod({ kind: 'set' });
            const isClassProperty = prop.isClassProperty();
            const isGetterSetter = (isGetter || isSetter);

            // If we have already seen this property, move along
            // This can happen if we have a getter and setter defined
            // for class prop. When we see a getter or setter,
            // we grab the corresponding definition to avoid having to
            // dedupe after everything has been defined
            if (expandedProperties[key]) {
                continue;
            }

            // Fields
            if (isClassProperty || isGetterSetter) {
                // Non-static fields
                if (!prop.node.static) {
                    if (prop.node.key.name === 'state' && prop.node.decorators) { // Blacklist state from pulicProps
                        throw prop.buildCodeFrameError('Decorators are not supported in property state');
                    }

                    // Disallow `this` in props, but allow `this` in getters and setters
                    if (isClassProperty) {
                        prop.traverse({ ThisExpression() { throw prop.buildCodeFrameError('Reference to the instance is not allowed in class properties'); }});
                    }

                    const expanded = [];
                    const {
                        getters,
                        setters,
                        defaults
                    } = getPropertyGroups(prop, classBody, key);

                    const propertyMask = getPropertyMask(getters, setters, defaults);
                    const propWithValue = defaults.find((prop) => {
                        return prop.node.value !== undefined;
                    });
                    const propertyType = getPropertyType(propWithValue);

                    defaults.concat(getters).concat(setters).forEach((prop) => {
                        prop.traverse(DecoratorVisitor, { publicProps: expanded, wiredData, key, wiredKeys, propertyMask, propertyType });
                    });

                    if (expanded.length) {
                        publicProps.push(expanded.pop());
                    }

                // Static fields
                } else {
                    knownStaticKeys[key] = key in knownStaticKeys; // If defined, do not override it

                    // This is a temporal workaround to prefetch labels until we implement i18n properly
                    // https://git.soma.salesforce.com/raptor/raptor/issues/196
                    if (key === KEY_LABELS && prop.node.value.elements) {
                        labels.push.apply(labels, prop.node.value.elements.map(m => m.value));
                    } else {
                        extraBody.push(addClassStaticMember(className, key, prop.node.value));
                        // We need to save observedAttributes not for later processing for data.
                        if (key === 'observedAttributes') {
                            observedAttributesProperty = prop.node;
                        }
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

            // Remember that we've seen this
            expandedProperties[key] = true;
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

        if (wiredKeys.length) {
            // If we a an observedAttributes, we need to augment it
            if (observedAttributesProperty) {
                const original = observedAttributesProperty.value.elements.map(p => p.value);
                const wiredObserved = Array.from(new Set(original.concat(wiredKeys)));
                observedAttributesProperty.value.elements = wiredObserved.map(p => t.stringLiteral(p));
                extraBody.push(addClassStaticMember(className, 'originalObservedAttributes', t.valueToNode(original)));
            // We just create a new observedAttributes
            } else {
                extraBody.push(addClassStaticMember(className, 'observedAttributes', t.valueToNode(wiredKeys)));
            }
        }

        if (!knownStaticKeys[KEY_RENDER]) {
            injectRenderer(className, path, state);
        }

        return extraBody;
    }
}
