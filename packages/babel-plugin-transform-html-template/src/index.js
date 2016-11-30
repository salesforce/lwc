/* eslint-env node */
import { DIRECTIVE_PRIMITIVES, DIRECTIVE_SYMBOL, PROPS, RENDER_PRIMITIVES } from './constants';
import { addScopeForLoop, getVarsScopeForLoop, hasScopeForLoop, removeScopeForLoop } from './for-scope';
import {isCompatTag, isTopLevel, parseStyles, toCamelCase} from './utils';

import {addDependency} from './metadata';
import { keyword }  from 'esutils';

const { ITERATOR, EMPTY, CREATE_ELEMENT } = RENDER_PRIMITIVES;
const PRIMITIVE_KEYS = Object.keys(RENDER_PRIMITIVES).map(k => RENDER_PRIMITIVES[k]);

export default function ({ types: t, template }) {
    const exportsTemplate = template(`export default function ({ ${PRIMITIVE_KEYS} }) { return BODY; }`, { sourceType : 'module' });

    return {
        inherits: require('babel-plugin-syntax-jsx'),

        visitor: {
            Program(path) {
                const expression = path.get('body.0.expression');
                const children = expression.get('children');
                const filteredChildren = children.filter((c) => !t.isJSXText(c));

                if (filteredChildren.length !== 1) {
                    throw new Error('A component must have only one root element');
                }

                // Remove  <template> node
                expression.replaceWith(t.expressionStatement(filteredChildren[0]));

                // Add exports declaration
                const exportDeclaration = exportsTemplate({ BODY: expression });
                path.node.body.unshift(exportDeclaration);
                
                // Delete remaining nodes
                expression.remove();

            },
            JSXElement: {
                enter(path, state) {
                    const openingElement = path.get('openingElement').node; 
                    const attrs = openingElement.attributes;
                    const expr = attrs.length ? buildOpeningElementAttributes(attrs, path, state) : t.nullLiteral();
                    const directiveRef = expr._directiveReference;
                    
                    openingElement.attributes = expr;

                    // Add scope while going down
                    if (directiveRef && directiveRef.directive === DIRECTIVE_PRIMITIVES.repeat) {
                        const forExpr = directiveRef.attrs.for;
                        const forValue  = t.isMemberExpression(forExpr) ? forExpr.property.name : forExpr.value;
                        addScopeForLoop(path, parseForStatement(forValue)); 
                    }
                },
                exit(path, file) {
                    const callExpr = buildElementCall(path.get('openingElement'), file);
                    callExpr.arguments.push(t.arrayExpression(path.node.children)); // Add children array as 3rd arg

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

    function tranformExpressionInScope (onForScope, child) {
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

    function transformBindingLiteralOnScope (onForScope, literal) {   
        const objectMember = literal.split('.').shift();
        if (!onForScope.includes(objectMember)) {
            return t.memberExpression(t.identifier('this'), t.identifier(literal));
        }

        return t.identifier(literal);
    }

    // Convert JSX AST into regular javascript AST
    function buildChildren(node, path, state) {
        const elems = [];
        const children = [];
        const onForScope = getVarsScopeForLoop(path);

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

            if (t.isCallExpression(child) && child._directiveReference) {
                if (child._directiveReference.directive === DIRECTIVE_PRIMITIVES.else) {
                    throw new Error('Else statement found before if statement');
                }

                const {directive, attrs } = child._directiveReference;

                if (directive === DIRECTIVE_PRIMITIVES.if) {
                    let nextChild = children[i + 1];

                    const ifExpr = attrs.bind;
                    const ifValue  = t.isMemberExpression(ifExpr) ? ifExpr.property.name : ifExpr.value || ifExpr.name;
                    const testExpression = transformBindingLiteralOnScope(onForScope, ifValue);
                    const hasElse = nextChild && nextChild._directiveReference && nextChild._directiveReference.directive === DIRECTIVE_PRIMITIVES.else;

                    if (hasElse) {
                        nextChild._processed = true;
                    } else {
                        nextChild = t.callExpression(t.identifier(EMPTY), []);
                    }

                    elems.push(t.conditionalExpression(testExpression, child, nextChild));
                    continue;   
                }

                if (directive === DIRECTIVE_PRIMITIVES.repeat) {
                    const forExpr = attrs.for;
                    const forValue  = t.isMemberExpression(forExpr) ? forExpr.property.name : forExpr.value;
                    const forSyntax = parseForStatement(forValue);
                    const block = t.blockStatement([t.returnStatement(child)]);
                    const func = t.arrowFunctionExpression(forSyntax.args.map((a) => t.identifier(a)), block);
                    const expr = t.callExpression(t.identifier(ITERATOR), [ t.memberExpression(t.identifier('this'), t.identifier(forSyntax.for)), func]);

                    elems.push(expr);
                    continue;
                }
            }

            elems.push(child);
        }

        return elems;
    }

    function parseForStatement (attrValue) {
        const inMatch = attrValue.match(/(.*?)\s+(?:in|of)\s+(.*)/);
        if (!inMatch) {
            throw new Error('for syntax is not correct');
        }

        const forSyntax = { for : null, args : [] };
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
        path.parent.children = buildChildren(path.parent, path, state);

        const tagExpr = convertJSXIdentifier(path.node.name, path.node);
        const args = [];
        let attribs = path.node.attributes;
        let tagName;

        if (t.isIdentifier(tagExpr)) {
            tagName = tagExpr.name;
        } else if (t.isLiteral(tagExpr)) {
            tagName = tagExpr.value;
        }

        if (isCompatTag(tagName)) { // Either a lower-case string or a constructor
            args.push(t.stringLiteral(tagName));
        } else {
            args.push(tagExpr);
        }

        args.push(attribs);

        const createElementExpression = t.callExpression(t.identifier(CREATE_ELEMENT), args);
        createElementExpression._directiveReference = attribs._directiveReference; // Push reference up
        
        return createElementExpression;
    }

    function convertJSXIdentifier(node) {
        if (t.isJSXNamespacedName(node)) {
            return t.identifier(node.namespace.name + DIRECTIVE_SYMBOL + node.name.name);
        }

        if (t.isJSXMemberExpression(node)) {
            return t.memberExpression(
                convertJSXIdentifier(node.object, node),
                convertJSXIdentifier(node.property, node)
            );
        }

        if (t.isJSXIdentifier(node)) {
            if (keyword.isIdentifierNameES6(node.name)) {
                node.type = 'Identifier';
            } else {
                return t.stringLiteral(node.name);
            }
        }

        return node;
    }

     function getDirective (attr) {
        const parts = attr.split(DIRECTIVE_SYMBOL);    
        const directive = DIRECTIVE_PRIMITIVES[parts[0]];
        return {
            directive : directive,
            type      : parts[1],
            propName  : parts[0]
        }; 
    }

    function groupAndNormalizeProps(props) {
        const newProps = [];
        const currentNestedObjects = {};
        let directiveReference;

        props.forEach((prop) => {
            let name = prop.key.value || prop.key.name; // Identifier | StringLiteral
            if (isTopLevel(name)) { // top-level special props
                newProps.push(prop);
            } else {
                let {directive, type, propName} = getDirective(name);
                if (directive) {
                    if (!directiveReference) {
                        directiveReference = { directive: directive, attrs: {} };
                    }
                    directiveReference.attrs[type] = prop.value;
                } else {
                    if (propName) {
                        propName = toCamelCase(propName);
                    }
                    
                    // Normalize to identifier
                    prop.key.type = 'Identifier';
                    prop.key.name = propName;
                    
                    // Rest are nested under attrs/props
                    let attrs = currentNestedObjects.attrs;
                    if (!attrs) {
                        attrs = currentNestedObjects.attrs = t.objectProperty(
                            t.identifier(PROPS),
                            t.objectExpression([prop])
                        );
                        newProps.push(attrs);
                    } else {
                        attrs.value.properties.push(prop);
                    }
                }
            }
        });

        const objExpression = t.objectExpression(newProps);
        objExpression._directiveReference = directiveReference;
        return objExpression;
    }

    function buildOpeningElementAttributes(attribs, path, state) {
        attribs = attribs.map((attr) => convertAttribute(attr, path, state) ); 
        return groupAndNormalizeProps(attribs); // Group attributes and generate directives
    }

    function convertAttribute(node, path, state) {
        let valueNode = cleanAttributeValue(node);
        let nameNode = cleanAttributeName(node);

        if (t.isJSXNamespacedName(node.name)) {
            const onScope = getVarsScopeForLoop(path);

            if (!onScope.includes(valueNode.value)) {
                addDependency(valueNode.value, state);
            }
            
            if (t.isStringLiteral(valueNode)) {
                valueNode = transformBindingLiteralOnScope(onScope, valueNode.value);
            }
        }

        // Parse style
        if (nameNode.name === 'style') {
            valueNode = t.valueToNode(parseStyles(valueNode.value));
        }
        
        return t.inherits(t.objectProperty(nameNode, valueNode), node);
    }

    function cleanAttributeName(node) {
        if (t.isJSXNamespacedName(node.name)) {
            let nsNode = node.name;
            return t.stringLiteral(nsNode.namespace.name + DIRECTIVE_SYMBOL + nsNode.name.name);
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