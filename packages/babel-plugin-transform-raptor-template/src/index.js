/* eslint-env node */
import * as CONST from './constants';
import customScope from './for-scope';
import { isTopLevelProp, parseStyles, toCamelCase, cleanJSXElementLiteralChild } from './utils';
import { addDependency } from './metadata';

const DIRECTIVES = CONST.DIRECTIVES;
const CMP_INSTANCE = CONST.CMP_INSTANCE;
const API_PARAM = CONST.API_PARAM;
const MODIFIERS = CONST.MODIFIERS;
const { ITERATOR, EMPTY, VIRTUAL_ELEMENT, CREATE_ELEMENT, CUSTOM_ELEMENT, FLATTENING, TEXT } = CONST.RENDER_PRIMITIVES;

export default function ({ types: t, template }) {
    // -- Helpers -----------------------------------------------------
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
        pre() { this.customScope = customScope },
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
                    const body = path.node.body;
                    const pos = body.findIndex(c => t.isExpressionStatement(c) && c.expression._jsxElement);
                    const rootElement = path.get(`body.${pos}.expression`);
                    const exportDeclaration = exportsDefaultTemplate({ STATEMENT: rootElement });
                    rootElement.replaceWithMultiple(exportDeclaration);

                    // Generate used identifiers
                    const usedIds = state.file.metadata.templateUsedIds || {};
                    const usedKeys = Object.keys(usedIds);

                    path.pushContainer('body',
                        t.exportNamedDeclaration(
                            t.variableDeclaration('const', [
                                t.variableDeclarator(t.identifier('templateUsedIds'), t.valueToNode(usedKeys))
                            ]), []
                        )
                    );
                }
            },
            JSXElement: {
                enter(path, state) {
                    const openElmt = path.get('openingElement').node;
                    const openElmtAttrs = openElmt.attributes;
                    const buildAttrs = openElmtAttrs ? buildOpeningElementAttributes(openElmtAttrs, path, state) : t.nullLiteral();
                    const scoped = buildAttrs._meta && buildAttrs._meta.scoped;
                    openElmt.attributes = buildAttrs;

                    if (scoped) {
                        customScope.registerScopePathBindings(path, scoped);
                    }
                },
                exit(path, status) {
                    const callExpr = buildElementCall(path.get('openingElement'), status);

                    prettyPrintExpr(callExpr);
                    path.replaceWith(t.inherits(callExpr, path.node));
                    path.node._jsxElement = true;

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
            // Transform container expressions from {foo.x.y} => {this.foo.x.y}
            MemberExpression(path, state) {
                if (isWithinJSXExpression(path)) {
                    path.stop();
                    path.traverse(BoundThisVisitor, state);
                }
            },
            // Transform container expressions from {foo} => {this.foo}
            Identifier(path, state) {
                path.stop();
                if (isWithinJSXExpression(path) && !customScope.hasBinding(path.node.name)) {
                    addDependency(path.node, state, t);
                    applyThisToIdentifier(path);
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

    function transformBindingLiteral(literal, inScope) {
        if (inScope) {
            return t.identifier(literal);
        }
        const computed = needsComputedCheck(literal);
        const member = computed ? t.stringLiteral(literal) : t.identifier(literal);
        return t.memberExpression(t.identifier(CMP_INSTANCE), member, computed);
    }

    function applyRepeatDirectiveToNode(directives, node) {
        const forExpr = directives[MODIFIERS.for];
        const args = directives.inForScope ? directives.inForScope.map((a) => t.identifier(a)) : [];
        const func = t.functionExpression(null, args, t.blockStatement([t.returnStatement(node)]));
        return t.callExpression(applyPrimitive(ITERATOR), [forExpr, func]);
    }

    function applyIfDirectiveToNode(directive, node, nextNode) {
        if (nextNode && nextNode._meta.modifiers[MODIFIERS.else]) {
            nextNode._processed = true;
        } else {
            nextNode = t.callExpression(applyPrimitive(EMPTY), []);
        }
        return t.conditionalExpression(directive, node, nextNode);
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
            let directives = child._meta;

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

                    elems.push(applyRepeatDirectiveToNode(directives, child));
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

    function parseForStatement(attrValue) {
        const inMatch = attrValue.match(/(.*?)\s+(?:in|of)\s+(.*)/);
        if (!inMatch) {
            throw new Error('For-loop value syntax is not correct');
        }

        const forSyntax = { for: null, args: [] };
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
        const exprTag = applyPrimitive(tag._primitive || CREATE_ELEMENT);
        const children = buildChildren(path.parent, path, state);
        const attribs = path.node.attributes;
        const args = [tag, attribs, children];

        if (tag._customElement) {
            args.unshift(t.stringLiteral(tag._customElement));
        }

        const createElementExpression = t.callExpression(exprTag, args);
        createElementExpression._meta = attribs._meta; // Push metadata up
        return createElementExpression;
    }

    function convertJSXIdentifier(node, path, state) {
        // <a.b.c/>
        if (t.isJSXMemberExpression(node)) { 
            throw path.buildCodeFrameError('Member expressions not supported');
        }

        // <a:b/>
        if (t.isJSXNamespacedName(node)) {
            const name = node.namespace.name + CONST.DIRECTIVE_SYMBOL + node.name.name;
            const devName = node.namespace.name + '$' + node.name.name;
            const id = state.file.addImport(name, 'default', devName);
            id._primitive = VIRTUAL_ELEMENT;
            return id;
        }

        // <div> -- Any name for now will work
        if (t.isJSXIdentifier(node)) {
            let name = node.name;
            if (name.indexOf('-') !== -1) {
                const devName = toCamelCase(name);
                const id = state.file.addImport(name, 'default', devName);
                id._primitive = CUSTOM_ELEMENT;
                id._customElement = name;
                return id;
            }
        }

        return t.stringLiteral(node.name);
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

    function transformProp(prop, scopedVars, path, state) {
        const meta = prop._meta;
        const directive = meta.directive;
        let valueName = prop.key.value || prop.key.name; // Identifier|Literal
        let valueNode = prop.value;
        let inScope = false;

        if (directive) {
            let rootMember;
            if (t.isStringLiteral(valueNode)) {
                rootMember = getMemberFromNodeStringLiteral(valueNode);
                inScope = scopedVars.indexOf(rootMember) !== -1;
                valueNode = transformBindingLiteral(valueNode.value, inScope);

                 if (!inScope && directive === DIRECTIVES.set || directive === DIRECTIVES.repeat) {
                    addDependency(rootMember, state, t);
                }
            }

            if (directive === DIRECTIVES.bind) {
                const bindExpression = t.callExpression(t.memberExpression(valueNode, t.identifier('bind')), [t.identifier(CMP_INSTANCE)]);
                valueNode = memoizeSubtree(bindExpression, path);
            }

        } else {
            if (valueName === 'style') {
                valueNode = t.valueToNode(parseStyles(prop.value.value));
            }
        }

        if (isDataAttributeName(valueName)) {
            meta.dataset = true;
            valueName = t.stringLiteral(fomatDataAttributeName(valueName));
        } else {
            valueName = t.identifier(toCamelCase(valueName));
        }

        prop.key = valueName;
        prop.value = valueNode;
        return prop;
    }

    function transformAndGroup(props, elementMeta, path, state) {
        const finalProps = [];
        const propKeys = {};

        function addGroupProp(key, value) {
            let group = propKeys[key];
            if (!group) {
                group = t.objectProperty(t.identifier(key), t.objectExpression([]));
                finalProps.push(group);
                propKeys[key] = group;
            }
            group.value.properties.push(value);
        }

        props.forEach((prop) => {
            const name = prop.key.value || prop.key.name; // Identifier|Literal
            const meta = prop._meta;

            prop = transformProp(prop, elementMeta.scoped, path, state);
            let groupName = CONST.PROPS;

            if (isTopLevelProp(name)) {
                finalProps.push(prop);
                return;
            }

            if (meta.directive && isDirectiveName(name)) {
                elementMeta[name] = prop.value;
                return;
            }

            if (meta.dataset) {
                groupName = CONST.DATASET;
            }

            if (meta.event) {
                groupName = 'on';
            }

            addGroupProp(groupName, prop);
        });

        const objExpression = t.objectExpression(finalProps);
        objExpression._meta = elementMeta;
        return objExpression;
    }

    function groupAttrMetadata(metaGroup, meta) {
        if (meta.directive) {
            metaGroup.directives[meta.directive] = meta.directive;
        }
        if (meta.modifier) {
            metaGroup.modifiers[meta.modifier] = meta.modifier;
        }
        if (meta.inForScope) {
            metaGroup.inForScope = meta.inForScope;
            metaGroup.scoped.push(...meta.inForScope);
        }
    }

    function buildOpeningElementAttributes(attributes, path, state) {
        const metaGroup = { directives: {}, modifiers: {}, scoped: customScope.getAllBindings() };
        attributes = attributes.map((attr) => {
            const { meta, node } = normalizeAttribute(attr, path, state);
            groupAttrMetadata(metaGroup, meta);
            return node;
        });
        return transformAndGroup(attributes, metaGroup, path, state); // Group attributes and generate directives
    }

    function memoizeSubtree(expression, path) {
        const root = path.find((path) => path.isProgram());
        const id = path.scope.generateUidIdentifier("m");
        const m = memoizeLookup({ ID: id });
        const hoistedMemoization = memoizeFunction({ ID: id, STATEMENT: expression });
        root.unshiftContainer('body', hoistedMemoization);
        return m.expression;
    }

    function normalizeAttributeName (node) {
        const meta = { directive: null, modifier: null, event: null, scoped: null };

        if (t.isJSXNamespacedName(node)) {
            const dNode = node.namespace;
            const mNode = node.name;

            if (dNode.name in DIRECTIVES) {
                meta.directive = DIRECTIVES[dNode.name];
            }

            if (mNode.name in MODIFIERS) {
                meta.modifier = MODIFIERS[mNode.name];
            }

            if (mNode.name.indexOf(DIRECTIVES.on) === 0) {
                meta.event = mNode.name.substring(2);
            }

            node = node.name;
        }

        if (t.isValidIdentifier(node.name)) {
            node.type = 'Identifier';
        } else {
            node = t.stringLiteral(node.name);
        }

        // nodeType: Identifier|StringLiteral
        return { node, meta };
    }

     function normalizeAttributeValue(node, meta, path) {
         node = node || t.booleanLiteral(true);
         if (t.isJSXExpressionContainer(node)) {
             throw path.buildCodeFrameError('Expressions not allowed in component attributes');  
        }
        t.assertLiteral(node);
        if (meta.directive === DIRECTIVES.repeat) {
            const parsedValue = parseForStatement(node.value);
            node.value = parsedValue.for;
            meta.inForScope = parsedValue.args;
        }

        return node;
    }

    function normalizeAttribute(jsxAttr, elementPath, state) {
        const { node, meta } = normalizeAttributeName(jsxAttr.name, elementPath);
        const value = normalizeAttributeValue(jsxAttr.value, meta, elementPath);
        const property = t.objectProperty(node, value);
        property._meta = meta; // Attach metadata for further inspection upstream
        return { node : property, meta };
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