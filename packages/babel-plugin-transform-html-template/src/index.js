/* eslint-env node */
import * as CONST from './constants';
import { addScopeForLoop, getVarsScopeForLoop, hasScopeForLoop, removeScopeForLoop } from './for-scope';
import { isTopLevel, parseStyles, toCamelCase } from './utils';
import { addDependency } from './metadata';

const DIRECTIVE_PRIMITIVES = CONST.DIRECTIVE_PRIMITIVES;
const { ITERATOR, EMPTY, VIRTUAL_ELEMENT, CREATE_ELEMENT, FLATTENING } = CONST.RENDER_PRIMITIVES;

export default function ({ types: t, template }) {
    const exportsDefaultTemplate = template(
        `export default function ({ ${CONST.RENDER_PRIMITIVE_KEYS} }) { 
            return BODY; 
        }`, { sourceType: 'module' });

    return {
        inherits: require('babel-plugin-syntax-jsx'),

        visitor: {
            Program: {
                enter(path) {
                    const expression = path.get('body.0.expression');
                    const children = expression.get('children');
                    const filteredChildren = children.filter((c) => !t.isJSXText(c));

                    if (filteredChildren.length !== 1) {
                        throw new Error('A component must have only one root element');
                    }

                    // Remove  <template> node
                    expression.replaceWith(t.expressionStatement(filteredChildren[0]));

                    // Add exports declaration
                    const exportDeclaration = exportsDefaultTemplate({ BODY: expression });
                    path.node.body.unshift(exportDeclaration);

                    // Delete remaining nodes
                    expression.remove();
                },
                exit(path, state) {
                    // Generate used identifiers
                    const usedIds = state.file.metadata.usedIdentifiers || {};
                    const usedKeys = Object.keys(usedIds);

                    path.pushContainer('body',
                        t.exportNamedDeclaration(
                            t.variableDeclaration('const', [
                                t.variableDeclarator(t.identifier('usedIdentifiers'), t.valueToNode(usedKeys))
                            ]), []
                        )
                    );
                }
            },
            JSXElement: {
                enter(path, state) {
                    const openingNode = path.get('openingElement').node;
                    openingNode.attributes = openingNode.attributes ? buildOpeningElementAttributes(openingNode.attributes, path, state) : t.nullLiteral();
                    const directiveRef = openingNode.attributes._directives;
                    const forExpr = directiveRef && directiveRef[DIRECTIVE_PRIMITIVES.for];

                    // Add scope while going down
                    if (forExpr) {
                        const forValue = t.isMemberExpression(forExpr) ? forExpr.property.name : forExpr.value;
                        addScopeForLoop(path, parseForStatement(forValue));
                    }
                },
                exit(path, status) {
                    const callExpr = buildElementCall(path.get('openingElement'), status);

                    if (callExpr.arguments.length >= 3) {
                        // Dependency on babel-plugin-transform-template-jsx generator to prettify it
                        callExpr._prettyCall = true;
                    }

                    path.replaceWith(t.inherits(callExpr, path.node));

                    // Remove scope while going up
                    if (hasScopeForLoop(path)) {
                        removeScopeForLoop(path);
                    }
                }
            }
        }
    };

    // Parts of this code were levaraged from:
    // t.react.cleanJSXElementLiteralChild() in babel-plugin-transform-template-jsx
    function cleanJSXElementLiteralChild(args, child) {
        if (t.isJSXText(child)) {
            const lines = child.value.split(/\r\n|\n|\r/);
            let lastNonEmptyLine = 0;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].match(/[^ \t]/)) {
                    lastNonEmptyLine = i;
                }
            }

            let str = '';
            for (let _i = 0; _i < lines.length; _i++) {
                const line = lines[_i];
                const isFirstLine = _i === 0;
                const isLastLine = _i === lines.length - 1;
                const isLastNonEmptyLine = _i === lastNonEmptyLine;

                let trimmedLine = line.replace(/\t/g, ' ');

                if (!isFirstLine) {
                    trimmedLine = trimmedLine.replace(/^[ ]+/, '');
                }

                if (!isLastLine) {
                    trimmedLine = trimmedLine.replace(/[ ]+$/, '');
                }

                if (trimmedLine) {
                    if (!isLastNonEmptyLine) {
                        trimmedLine += ' ';
                    }

                    str += trimmedLine;
                }
            }

            if (str) {
                args.push(t.stringLiteral(str));
            }
        } else {
            args.push(child);
        }

        return args;
    }

    function tranformExpressionInScope(onForScope, child) {
        // {foo} => this.foo
        if (t.isIdentifier(child) && !onForScope.includes(child.name)) {
            return t.memberExpression(t.identifier('this'), child);
        }

        // {foo.bar} => this.foo.bar
        if (t.isMemberExpression(child) && !onForScope.includes(child.object.name)) {
            child.object = t.memberExpression(t.identifier('this'), child.object);
        }

        return child;
    }

    function transformBindingLiteralOnScope(onForScope, literal) {
        const objectMember = literal.split('.').shift();
        if (!onForScope.includes(objectMember)) {
            return t.memberExpression(t.identifier('this'), t.identifier(literal));
        }

        return t.identifier(literal);
    }

    // Convert JSX AST into regular javascript AST
    function buildChildren(node, path, state) {
        const children = [];
        const onForScope = getVarsScopeForLoop(path);
        let hasForLoopDirective = false;
        let elems = [];

        // Filter children that are just whitespaces, tabs, etc
        node.children.reduce(cleanJSXElementLiteralChild, children);

        for (let i = 0; i < children.length; i++) {
            let child = children[i];

            if (t.isJSXEmptyExpression(child) || child._processed) {
                continue;
            }

            if (t.isJSXExpressionContainer(child)) {
                child = child.expression; // remove the JSXContainer <wrapper></wrapper>

                if (!onForScope.includes(child.name)) {
                    addDependency(child, state);
                }

                // If the expressions are not in scope we need to add the `this` memberExpression:
                child = t.callExpression(t.identifier('s'), [tranformExpressionInScope(onForScope, child)]);
            }

            if (t.isCallExpression(child) && child._directives) {
                if (child._directives[DIRECTIVE_PRIMITIVES.else]) {
                    throw new Error('Else statement found before if statement');
                }

                const directives = child._directives;

                if (directives[DIRECTIVE_PRIMITIVES.if]) {
                    let nextChild = children[i + 1];
                    const ifExpr = directives[DIRECTIVE_PRIMITIVES.if];
                    const ifValue = t.isMemberExpression(ifExpr) ? ifExpr.property.name : ifExpr.value || ifExpr.name;
                    const testExpression = transformBindingLiteralOnScope(onForScope, ifValue);
                    const hasElse = nextChild && nextChild._directives && nextChild._directives[DIRECTIVE_PRIMITIVES.else];

                    if (hasElse) {
                        nextChild._processed = true;
                    } else {
                        nextChild = t.callExpression(t.identifier(EMPTY), []);
                    }

                    elems.push(t.conditionalExpression(testExpression, child, nextChild));
                    continue;
                }

                if (directives[DIRECTIVE_PRIMITIVES.for]) {
                    const forExpr = directives[DIRECTIVE_PRIMITIVES.for];
                    const forValue = t.isMemberExpression(forExpr) ? forExpr.property.name : forExpr.value;
                    const forSyntax = parseForStatement(forValue);
                    const block = t.blockStatement([t.returnStatement(child)]);
                    const func = t.arrowFunctionExpression(forSyntax.args.map((a) => t.identifier(a)), block);
                    const expr = t.callExpression(t.identifier(ITERATOR), [t.memberExpression(t.identifier('this'), t.identifier(forSyntax.for)), func]);

                    elems.push(expr);
                    hasForLoopDirective = true;

                    continue;
                }
            }

            elems.push(child);
        }

        elems = t.arrayExpression(elems);
        return hasForLoopDirective ? t.callExpression(t.identifier(FLATTENING), [elems]): elems;
    }

    function parseForStatement(attrValue) {
        const inMatch = attrValue.match(/(.*?)\s+(?:in|of)\s+(.*)/);
        if (!inMatch) {
            throw new Error('for syntax is not correct');
        }

        const forSyntax = {
            for: null,
            args: []
        };
        const alias = inMatch[1].trim();
        const iteratorMatch = alias.match(/\(([^,]*),([^,]*)(?:,([^,]*))?\)/);
        forSyntax.for = inMatch[2].trim();

        if (iteratorMatch) {
            forSyntax.args.push(iteratorMatch[1].trim());
            forSyntax.args.push(iteratorMatch[2].trim());
            if (iteratorMatch[3]) {
                forSyntax.args.push(iteratorMatch[3].trim());
            }
        } else {
            forSyntax.args.push(alias);
        }

        return forSyntax;
    }

    function buildElementCall(path, state) {
        const tag = convertJSXIdentifier(path.node.name, path, state);
        const exprTag = t.identifier(tag._virtualCmp ? VIRTUAL_ELEMENT : CREATE_ELEMENT);
        const children = buildChildren(path.parent, path, state);
        const attribs = path.node.attributes;

        const args = [tag, attribs, children];

        const createElementExpression = t.callExpression(exprTag, args);
        createElementExpression._directives = attribs._directives; // Push directives up

        return createElementExpression;
    }

    function convertJSXIdentifier(node, path, state) {
        // <a.b.c/>
        if (t.isJSXMemberExpression(node)) { 
            throw Error('We do not suport member expressions for now.');
        }

        // <a:b/>
        if (t.isJSXNamespacedName(node)) {
            const name = node.namespace.name + CONST.DIRECTIVE_SYMBOL + node.name.name;
            const devName = node.namespace.name + '$' + node.name.name;
            const id = state.file.addImport(name, devName);
            id._virtualCmp = true;
            return id;
        }

        // <div> -- Any name for now will work
        if (t.isJSXIdentifier(node)) {
            return t.stringLiteral(node.name);
        }

        return node;
    }

    function groupAndNormalizeProps(props) {
        const newProps = [];
        const currentNestedObjects = {};
        const directives = {};

        props.forEach((prop) => {
            const key = prop.key;
            const directive = key._directive;
            let name = key.value || key.name; // Identifier | StringLiteral

            if (isTopLevel(name)) { // top-level special props
                newProps.push(prop);
            } else {
                if (directive && (name === DIRECTIVE_PRIMITIVES.if || name === DIRECTIVE_PRIMITIVES.for || name === DIRECTIVE_PRIMITIVES.else)) {
                    directives[name] = prop.value; 
                } else {
                    // Normalize to identifier
                    name = toCamelCase(name);
                    prop.key.type = 'Identifier';
                    prop.key.name = toCamelCase(name);

                    if (key._on) {
                        if (!currentNestedObjects.on) {
                        let onProps = currentNestedObjects.on = t.objectProperty(
                                t.identifier('on'),
                                t.objectExpression([])
                            );
                            newProps.push(onProps);
                        }
                        currentNestedObjects.on.value.properties.push(prop);
                        return;
                    }

                    // Rest are nested under attrs/props
                    if (!currentNestedObjects.attrs) {
                       let attrs = currentNestedObjects.attrs = t.objectProperty(
                            t.identifier(CONST.PROPS),
                            t.objectExpression([])
                        );
                        newProps.push(attrs);
                    }
                    currentNestedObjects.attrs.value.properties.push(prop);
                }
            }
        });

        const objExpression = t.objectExpression(newProps);
        if (Object.keys(directives).length) {
            objExpression._directives = directives;
        }
        return objExpression;
    }

    function buildOpeningElementAttributes(attribs, path, state) {
        attribs = attribs.map((attr) => convertAttribute(attr, path, state));
        return groupAndNormalizeProps(attribs); // Group attributes and generate directives
    }

    function convertAttribute(node, path, state) {
        let valueNode = cleanAttributeValue(node);
        let nameNode = cleanAttributeName(node);
        let nameKey = t.isIdentifier(nameNode) ? 'name' : 'value'; // Identifier | StringLiteral
        let rawName = nameNode[nameKey];

        if (nameNode._directive) {
            const onScope = getVarsScopeForLoop(path);

            if (!onScope.includes(valueNode.value)) {
                addDependency(valueNode.value, state);
            }

            if (t.isStringLiteral(valueNode)) {
                valueNode = transformBindingLiteralOnScope(onScope, valueNode.value); // foo => this.foo
            }
        }

        // @dval: Maybe move this code to cleanAttributeName?
        if (rawName.indexOf(DIRECTIVE_PRIMITIVES.on) === 0 && CONST.EVENT_KEYS[rawName.substring(2)]) {
            rawName = rawName.substring(2);
            nameNode[nameKey] = nameNode._on = rawName;
            
            /*
             * Apply the following transforms for events: 
             * bind:onclick="handleClick => this.handleClick.bind(this)
             * assign:onclick="handleClick => this.handleClick
            */
            if (nameNode._directive === DIRECTIVE_PRIMITIVES.bind && t.isMemberExpression(valueNode)) {
                valueNode = t.callExpression(
                    t.memberExpression(valueNode, t.identifier('bind')), [t.identifier('this')]
                );
            }
        }

        // Parse style
        if (nameNode.name === 'style') {
            valueNode = t.valueToNode(parseStyles(valueNode.value));
        }

        return t.objectProperty(nameNode, valueNode);
    }

    function cleanAttributeName(node) {
        if (t.isJSXNamespacedName(node.name)) {
            const nsNode = node.name;
            const directive = nsNode.namespace.name; // {directive}:{attr} <- get the directive part
            if (directive in DIRECTIVE_PRIMITIVES) {
                const literal = t.stringLiteral(nsNode.name.name);
                literal._directive = directive; 
                return literal;
            } else {
                 throw new Error('Directive does not exist'); 
            }
        } else if (t.isValidIdentifier(node.name.name)) {
            node.name.type = 'Identifier';
            return node.name;
        } else {
            return t.stringLiteral(node.name.name);
        }
    }

    function cleanAttributeValue(node) {
        const value = node.value || t.booleanLiteral(true);
        const expression = t.isJSXExpressionContainer(value) ? value.expression : value;
        if (t.isStringLiteral(expression) && !t.isJSXExpressionContainer(node.value)) {
            expression.value = expression.value.replace(/\n\s+/g, ' ');
        }

        return expression;
    }
}