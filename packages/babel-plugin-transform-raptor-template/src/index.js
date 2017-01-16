/* eslint-env node */
import * as CONST from './constants';
import customScope from './for-scope';
import { isTopLevelProp, parseStyles, toCamelCase, cleanJSXElementLiteralChild } from './utils';
import { addDependency } from './metadata';

const DIRECTIVES = CONST.DIRECTIVES;
const CMP_INSTANCE = CONST.CMP_INSTANCE;
const API_PARAM = CONST.API_PARAM;
const MODIFIERS = CONST.MODIFIERS;
const { ITERATOR, EMPTY, VIRTUAL_ELEMENT, CREATE_ELEMENT, FLATTENING, TEXT } = CONST.RENDER_PRIMITIVES;

export default function ({ types: t, template }) {
    // -- Helpers ------------------------------------------
    
    const exportsDefaultTemplate = template(`
        const memoized = Symbol();
        export default function (${API_PARAM}, ${CMP_INSTANCE}) { 
            const m = ${CMP_INSTANCE}[memoized] || (${CMP_INSTANCE}[memoized] = {});
            return STATEMENT; 
        }
    `, { sourceType: 'module' });

    const memoizeLookup = template(`m.ID || (m.ID = ID(${API_PARAM}, ${CMP_INSTANCE}))`);
    const memoizeFunction = template(`const ID = function (${API_PARAM}, ${CMP_INSTANCE}) { return STATEMENT; }`); 

    const applyPrimitive = (primitive) => t.identifier(`${API_PARAM}.${primitive}`);
    const applyThisToIdentifier = (path) => path.replaceWith(t.memberExpression(t.identifier(CMP_INSTANCE), path.node));
    const isWithinJSXExpression = (path) => path.find(p => p.isJSXExpressionContainer());
    const getMemberFromNodeStringLiteral = (node, i = 0) => node.value.split('.')[i];

    const BoundThisVisitor = {
        ThisExpression(path) {
            throw path.buildCodeFrameError('You can\'t use `this` within a template');
        },
        Identifier: {
            exit(path, state) {
                path.stop();

                if (state.customScope.hasBinding(path.node.name)) {
                    state.isThisApplied = true;
                    return;
                }

                if (!state.isThisApplied) {
                    state.isThisApplied = true;
                    addDependency(path.node, state, t);
                    applyThisToIdentifier(path);
                }
            }
        }
    };
    
   // -- Plugin Visitor ------------------------------------------
    return {
        name: 'raptor-template',
        inherits: require('babel-plugin-syntax-jsx'), // Enables JSX grammar
        pre() { 
            this.customScope = customScope; 
        },
        visitor: {
            Program: {
                enter(path) {
                    validateTemplateRootFormat(path); 

                    // Find children of the root <template> node
                    const rootNode = path.get('body.0.expression'); // <template>
                    const rootChildren = rootNode.get('children').filter((c) => !t.isJSXText(c));

                    if (rootChildren.length !== 1) {
                        throw path.buildCodeFrameError('A component must have only one root element');
                    }

                    // Replace <template> by its child
                    rootNode.replaceWith(t.expressionStatement(rootChildren[0]));
                },
                exit (path, state) {
                    // Add exports declaration
                    const expression = path.get('body.0.expression');
                    const exportDeclaration = exportsDefaultTemplate({ STATEMENT: expression });

                    path.pushContainer('body', exportDeclaration);
                    expression.remove();

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
                    const forExpr = directiveRef && directiveRef[MODIFIERS.for];

                    // Add scope while going down
                    if (forExpr) {
                        const forValue = t.isMemberExpression(forExpr) ? forExpr.property.name : forExpr.value || forExpr.name;
                        customScope.registerScopePathBindings(path, parseForStatement(forValue).args);
                    }
                },
                exit(path, status) {
                    const callExpr = buildElementCall(path.get('openingElement'), status);

                    prettyPrintExpr(callExpr);
                    path.replaceWith(t.inherits(callExpr, path.node));

                    // Remove scope while going up
                    if (customScope.hasScope(path)) {
                        customScope.removeScopePathBindings(path);
                    }
                }
            },
            JSXExpressionContainer(path) {
                if (!t.isIdentifier(path.node.expression) && !t.isMemberExpression(path.node.expression)) {
                    throw path.buildCodeFrameError('Expression evaluation is not allowed');
                }
            },
            // Transform container expressions from {foo} => {this.foo}
            Identifier(path, state) {
                path.stop();
                if (isWithinJSXExpression(path) && !customScope.hasBinding(path.node.name)) {
                    addDependency(path.node, state, t);
                    applyThisToIdentifier(path);
                }
            },
            // Transform container expressions from {foo.x.y} => {this.foo.x.y}
            MemberExpression(path, state) {
                if (isWithinJSXExpression(path)) {
                    path.stop();
                    path.traverse(BoundThisVisitor, state);
                }
            }
        }
    };

    function prettyPrintExpr (callExpr) {
        // Dependency on babel-plugin-transform-template-jsx generator to prettify it
        if (callExpr.arguments.length >= 3) {
            callExpr._prettyCall = true;
        }
    }

     function needsComputedCheck(literal) {
        // TODO: Look in the spec to the valid values
        return literal.indexOf('-') !== -1;
    }

    function transformBindingLiteral(literal) {
        const computed = needsComputedCheck(literal);
        const member = computed ? t.stringLiteral(literal) : t.identifier(literal);
        return t.memberExpression(t.identifier(CMP_INSTANCE), member, computed);
    }

    // Convert JSX AST into regular javascript AST
    function buildChildren(node, path, state) {
        const children = [];
        let hasForLoopDirective = false;
        let elems = [];

        // Filter children that are just whitespaces, tabs, etc
        node.children.reduce(cleanJSXElementLiteralChild, children);

        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            let nextChild = children[i + 1]
            let directives = child._directives;

            if (t.isJSXEmptyExpression(child) || child._processed) {
                continue;
            }

            if (t.isJSXExpressionContainer(child)) {
                // remove the JSXContainer <wrapper></wrapper>
                child = t.callExpression(applyPrimitive(TEXT), [child.expression]);
            }

            if (t.isCallExpression(child) && directives) {
                if (directives[MODIFIERS.else]) {
                    throw path.buildCodeFrameError('Else statement found before if statement');
                }

                if (directives[MODIFIERS.for]) {
                    if (directives[MODIFIERS.if]) {
                        child = applyIfDirectiveToNode(directives[MODIFIERS.if], child, nextChild);
                    }

                    const forExpr = directives[MODIFIERS.for];
                    const forValue = t.isMemberExpression(forExpr) ? forExpr.property.name : forExpr.value || forExpr.name;
                    const forSyntax = parseForStatement(forValue);
                    const block = t.blockStatement([t.returnStatement(child)]);
                    const func = t.functionExpression(null, forSyntax.args.map((a) => t.identifier(a)), block);
                    const expr = t.callExpression(applyPrimitive(ITERATOR), [t.memberExpression(t.identifier(CMP_INSTANCE), t.identifier(forSyntax.for)), func]);

                    elems.push(expr);
                    hasForLoopDirective = true;
                    continue;
                }

                if (directives[MODIFIERS.if]) {
                    elems.push(applyIfDirectiveToNode(directives[MODIFIERS.if], child, nextChild));
                    continue;
                }
            }

            elems.push(child);
        }

        elems = t.arrayExpression(elems);
        return hasForLoopDirective ? t.callExpression(applyPrimitive(FLATTENING), [elems]): elems;
    }

    function applyIfDirectiveToNode(directive, node, nextNode) {
        if (nextNode && nextNode._directives && nextNode._directives[MODIFIERS.else]) {
            nextNode._processed = true;
        } else {
            nextNode = t.callExpression(applyPrimitive(EMPTY), []);
        }
        return t.conditionalExpression(directive, node, nextNode);
    }

    function parseForStatement(attrValue) {
        const inMatch = attrValue.match(/(.*?)\s+(?:in|of)\s+(.*)/);
        if (!inMatch) {
            throw new Error('For-loop value syntax is not correct');
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
        const exprTag = applyPrimitive(tag._virtualCmp ? VIRTUAL_ELEMENT : CREATE_ELEMENT);
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
            const id = state.file.addImport(name, 'default', devName);
            id._virtualCmp = true;
            return id;
        }

        // <div> -- Any name for now will work
        if (t.isJSXIdentifier(node)) {
            return t.stringLiteral(node.name);
        }

        return node;
    }

    function isDataAttributeName(name) {
        return name.startsWith(CONST.DATA_ATTRIBUTE_PREFIX);
    }

    // https://html.spec.whatwg.org/multipage/dom.html#dom-dataset
    function fomatDataAttributeName(originalName) {
        let name = originalName.slice(CONST.DATA_ATTRIBUTE_PREFIX.length);
        return name.replace(/-[a-z]/g, match => match[1].toUpperCase());
    }

    function isDirectiveName(name) {
        return name === MODIFIERS.if || name === MODIFIERS.for || name === MODIFIERS.else;
    }

    function groupAndNormalizeProps(props) {
        const newProps = [];
        const directives = {};

        const addProperty = (topLevelName, value) => {
            let topLevel = newProps.find(prop => prop.key.name === topLevelName);

            if (!topLevel) {
                topLevel = t.objectProperty(
                    t.identifier(topLevelName),
                    t.objectExpression([])
                );
                newProps.push(topLevel);
            }

            topLevel.value.properties.push(value);
        }

        props.forEach((prop) => {
            const key = prop.key;
            const directive = key._directive;
            let name = key.value || key.name; // Literal | StringLiteral

            if (isTopLevelProp(name)) { // top-level special props
                newProps.push(prop);
            } else if (directive && isDirectiveName(name)) {
                directives[name] = prop.value; 
            } else if (isDataAttributeName(name)) {
                prop.key = t.identifier(fomatDataAttributeName(name));
                addProperty(CONST.DATASET, prop);
            } else {
                const topLevelName = key._on ? 'on' : CONST.PROPS;
                prop.key = t.identifier(toCamelCase(name));
                addProperty(topLevelName, prop);
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

    function memoizeSubtree(expression, path) {
        const root = path.find((path) => path.isProgram());
        const id = path.scope.generateUidIdentifier("m");
        const m = memoizeLookup({ ID: id });

        const hoistedMemoization = memoizeFunction({ ID: id, STATEMENT: expression });

        //t.variableDeclaration('const', [t.variableDeclarator(id, t.functionExpression(null, [t.identifier(API_PARAM), t.identifier(CMP_INSTANCE)], t.blockStatement([t.returnStatement(expression)])))]);
        
        root.pushContainer('body', hoistedMemoization);
        return m.expression;
    }

    function convertAttribute(node, path, state) {
        let valueNode = cleanAttributeValue(node);
        let nameNode = cleanAttributeName(node);
        let nameKey = t.isIdentifier(nameNode) ? 'name' : 'value'; // Identifier | StringLiteral
        let rawName = nameNode[nameKey];
        let dir = nameNode._directive;
        let rootMember;
        
        // For directives, bound the string attribute value into a member expression
        // foo.x => this.foo.x
        if (dir && t.isStringLiteral(valueNode)) {
            if (dir === DIRECTIVES.repeat) { 
                // Special parse for `repeat:for="item of items"`
                const forStatement = parseForStatement(valueNode.value);
                rootMember = forStatement.for;
                // valueNode = transformBindingLiteral(rootMember);
            } else {
                rootMember = getMemberFromNodeStringLiteral(valueNode);
                valueNode = transformBindingLiteral(valueNode.value);
            }
        }

        if (dir === 'bind:on') {
            nameNode._on = rawName;
            dir = DIRECTIVES.bind;
        }

        /*
        * Apply the following transforms for events: 
        * bind:onclick="handleClick => this.handleClick.bind(this)
        * assign:onclick="handleClick => this.handleClick
        */
        if (dir === DIRECTIVES.bind && t.isMemberExpression(valueNode)) {
            const bindExpression = t.callExpression(t.memberExpression(valueNode, t.identifier('bind')), [t.identifier(CMP_INSTANCE)]);
            valueNode = memoizeSubtree(bindExpression, path);
            rootMember = null;
        }

        // Parse style
        if (nameNode.name === 'style') {
            valueNode = t.valueToNode(parseStyles(valueNode.value));
        }

        if (rootMember && !customScope.hasBinding(rootMember)) {
            addDependency(rootMember, state, t);
        }

        return t.objectProperty(nameNode, valueNode);
    }

    function cleanAttributeName(node) {
        if (t.isJSXNamespacedName(node.name)) {
            const nsNode = node.name;
            let directive = nsNode.namespace.name; // {directive}:{attr} <- get the directive part
            if (directive in DIRECTIVES) {
                let attr = nsNode.name.name;
                if (attr.indexOf(DIRECTIVES.on) === 0 && CONST.EVENT_KEYS[attr.substring(2)]) {
                    attr = attr.substring(2);
                    directive = 'bind:on';
                }

                const literal = t.stringLiteral(attr);
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

    function validateTemplateRootFormat(path) {
        const rootChildrens = path.get('body');

        if (!rootChildrens.length) {
            throw path.buildCodeFrameError('Missing root template tag');
        } else if (rootChildrens.length > 1) {
            throw rootChildrens.pop().buildCodeFrameError('Unexpected token');
        }

        const templateTagName = path.get('body.0.expression.openingElement.name');
        if (templateTagName.node.name !== 'template') {
            throw path.buildCodeFrameError('Root tag should be a template');
        }
    }
}