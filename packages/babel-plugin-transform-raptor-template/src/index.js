/* eslint-env node */
// $FlowFixMe: not sure why this does not work
import jsxPlugin from 'babel-plugin-syntax-jsx';
import * as CONST from './constants';
import * as validator from './validators';
import CustomScope from './custom-scope';
import metadata from './metadata';
import { moduleExports, memoizeFunction, memoizeLookup} from './templates';
import { isTopLevelProp, parseStyles, toCamelCase, cleanJSXElement } from './utils';
import { isSvgNsAttribute, isSVG, getPropertyNameFromAttrName, isProp } from './html-attrs';

const DIRECTIVES = CONST.DIRECTIVES;
const CMP_INSTANCE = CONST.CMP_INSTANCE;
const SLOT_SET = CONST.SLOT_SET;
const IF_MODIFIERS = CONST.IF_MODIFIERS;
const EVAL_MODIFIERS = CONST.EVAL_MODIFIERS;
const API_PARAM = CONST.API_PARAM;
const { ITERATOR, EMPTY, VIRTUAL_ELEMENT, CREATE_ELEMENT, CUSTOM_ELEMENT, FLATTENING, TEXT } = CONST.RENDER_PRIMITIVES;

export default function({ types: t }: BabelTypes): any {
    // -- Helpers ------------------------------------------------------
    const applyThisToIdentifier = (path: any): any => path.replaceWith(t.memberExpression(t.identifier(CMP_INSTANCE), path.node));
    const isWithinJSXExpression = (path: any) => path.find((p: any): boolean => p.isJSXExpressionContainer());
    const getMemberFromNodeStringLiteral = (node: BabelNodeStringLiteral, i: number = 0): string => node.value.split('.')[i];
    const applyPrimitive = (primitive: string) => {
        const id = t.identifier(`${API_PARAM}.${primitive}`);
        id._primitive = primitive; // Expando used for grouping slots (optimization)
        return id;
    };

    const BoundThisVisitor = {
        ThisExpression(path: Path) {
            throw path.buildCodeFrameError('You can\'t use `this` within a template');
        },
        Identifier: {
            exit(path: Path, state: any) {
                if (!path.node._ignore) {
                    path.stop();
                    if (state.customScope.hasBinding(path.node.name)) {
                        state.isThisApplied = true;
                        return;
                    }

                    if (path.parentPath.node.computed || !state.isThisApplied) {
                        state.isThisApplied = true;
                        metadata.addUsedId(path.node, state, t);
                        applyThisToIdentifier(path);
                    }
                }
            }
        }
    };

    const NormalizeAttributeVisitor = {
        JSXAttribute(path: Path) {
            validator.validatePrimitiveValues(path);
            const { node, attrMeta } = normalizeAttributeName(path.node.name, path.get('name'));
            const value = normalizeAttributeValue(path.node.value, attrMeta, path.get('value'));
            // $FlowFixMe: Wrong babel union types
            const nodeProperty = t.objectProperty(node, value);
            nodeProperty._meta = attrMeta; // Attach metadata for further inspection
            path.replaceWith(nodeProperty);
        }
    };

   // -- Plugin Visitor ------------------------------------------
    return {
        name: 'raptor-template',
        inherits: jsxPlugin, // Enables JSX grammar
        pre(file) {
            this.customScope = new CustomScope();
            metadata.initialize(file.metadata);
        },
        visitor: {
            Program: {
                enter(path) {
                    validator.validateTemplateRootFormat(path);
                    // Create an artificial scope for bindings and varDeclarations
                    this.customScope.registerScopePathBindings(path);
                },
                exit(path: any, state: PluginState) {
                    // Collect the remaining var declarations to hoist them within the export function later
                    const vars = this.customScope.getAllVarDeclarations();
                    const varDeclarations = vars && vars.length ? createVarDeclaration(vars): null;

                    const bodyPath = path.get('body');
                    const rootElement = bodyPath.find((child: Path): boolean => {
                        // $FlowFixMe: How to annotate the refinement here?
                        return child.isExpressionStatement() && child.node.expression._jsxElement;
                    });

                    const exportDeclaration = moduleExports({ STATEMENT: rootElement.node, HOISTED_IDS: varDeclarations });
                    rootElement.replaceWithMultiple(exportDeclaration);

                    // Generate used identifiers
                    const usedIds =  state.file.metadata.templateUsedIds;
                    path.pushContainer('body',
                        t.exportNamedDeclaration(
                            t.variableDeclaration('const', [t.variableDeclarator(t.identifier('templateUsedIds'), t.valueToNode(usedIds))]), []
                        )
                    );
                }
            },
            JSXElement: {
                exit(path, status) {
                    const callExpr = buildElementCall(path, status);
                    prettyPrintExpr(callExpr);
                    path.replaceWith(t.inherits(callExpr, path.node));
                    path.node._jsxElement = true;

                    if (path.node._meta.directives[DIRECTIVES.repeat]) {
                        path.node._meta.varDeclarations = this.customScope.getAllVarDeclarations();
                        this.customScope.removeScopePathBindings(path);
                    }
                }
            },
            JSXOpeningElement: {
                enter(path, state) {
                    const meta = { directives: {}, scoped: state.customScope.getAllBindings() };
                    path.traverse(NormalizeAttributeVisitor);
                    path.node.attributes.reduce((m, attr) => mergeAttrMetadata(m, attr._meta), meta);
                    path.node.name = convertJSXIdentifier(path.node.name, meta, path, state);

                    validator.validateElementMetadata(meta, path);

                    const createsScope = !!meta.directives[DIRECTIVES.repeat];
                    if (createsScope) {
                        this.customScope.registerScopePathBindings(path, meta.scoped);
                    }

                    path.node.attributes = transformAndGroup(path.node.attributes, meta, path.get('attributes'), state);
                    path.node._meta = meta;
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
                    path.traverse(BoundThisVisitor, { customScope : state.customScope });
                }
            },
            // Transform container expressions from {foo} => {this.foo}
            Identifier(path, state) {
                path.stop();
                if (isWithinJSXExpression(path) && !this.customScope.hasBinding(path.node.name)) {
                    metadata.addUsedId(path.node, state, t);
                    applyThisToIdentifier(path);
                }
            },
            JSXText(path) {
                const cleanedText = cleanJSXElement(path.node);
                if (cleanedText) {
                    path.replaceWith(t.stringLiteral(cleanedText));
                } else {
                    path.remove();
                }
            }
        }
    };

    function prettyPrintExpr (callExpr) {
        if (!t.isArrayExpression(callExpr)) {
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

    function createVarDeclaration(varDeclarations) {
        return t.variableDeclaration('const', varDeclarations.map(d => t.variableDeclarator(d.id, d.init)));
    }

    function applyRepeatDirectiveToNode(meta, node) {
        const forExpr = meta[DIRECTIVES.repeat];
        const args = meta.inForScope ? meta.inForScope.map((a) => t.identifier(a)) : [];
        const blockNodes = meta.varDeclarations.length ? [createVarDeclaration(meta.varDeclarations)] : [];

        if (t.isArrayExpression(node) && node.elements.length === 1) {
            node = node.elements[0];
        }

        blockNodes.push(t.returnStatement(node));

        const func = t.functionExpression(null, args, t.blockStatement(blockNodes));
        const iterator = t.callExpression(applyPrimitive(ITERATOR), [forExpr, func]);
        return iterator;
    }

    function applyIfDirectiveToNode(meta, node, nextNode) {
        const modifier = meta.directives[DIRECTIVES.if];
        const negation = modifier === IF_MODIFIERS.false;
        let exprNode = meta[DIRECTIVES.if];

        if (negation) {
            exprNode = t.unaryExpression('!', exprNode);
        }

        if (nextNode && nextNode._meta && nextNode._meta.applyElseTransform /*TBI*/) {
            nextNode._processed = true;
        } else {
            nextNode = t.callExpression(applyPrimitive(EMPTY), []);
        }

        return t.conditionalExpression(exprNode, node, nextNode);
    }

    function applyFlatteningToNode(elems) {
        return t.callExpression(applyPrimitive(FLATTENING), [elems]);
    }

    // Convert JSX AST into regular javascript AST
    function buildChildren(node, path, state) {
        const children = node.children;
        let hasIteration = false;
        let hasSlotTag = false;
        let innerIteration = false;
        let elems = [];

        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            let nextChild = children[i + 1]
            let meta = child._meta;

            if (t.isJSXEmptyExpression(child) || child._processed) {
                continue;
            }

            if (t.isJSXExpressionContainer(child)) {
                // remove the JSXContainer <wrapper></wrapper>
                child = t.callExpression(applyPrimitive(TEXT), [child.expression]);
            }

            if (meta && meta.isSlotTag) {
                hasSlotTag = true;
            }

            if (meta && (t.isCallExpression(child) || t.isArrayExpression(child))) {

                if (meta.applyRepeatTransform) {
                    if (meta.applyIfTransform) {
                        child = applyIfDirectiveToNode(meta, child, nextChild);
                    }

                    const forTransform = applyRepeatDirectiveToNode(meta, child, state);
                    forTransform._iteration = true;
                    hasIteration = true;
                    elems.push(forTransform);

                    continue;
                }

                if (meta.applyIfTransform) {
                    if (meta.isTemplate) {
                        const modifier = meta.directives[DIRECTIVES.if];
                        const negation = modifier === IF_MODIFIERS.false;
                        let exprNode = meta[DIRECTIVES.if];

                        if (negation) {
                            exprNode = t.unaryExpression('!', exprNode);
                        }

                        const init = t.logicalExpression('||', exprNode, t.callExpression(applyPrimitive(EMPTY), []));
                        const id = path.scope.generateUidIdentifier('expr');
                        state.customScope.pushVarDeclaration({ id, init, kind: 'const' });

                        if (t.isArrayExpression(child)) {
                            child.elements.forEach(c => elems.push(t.logicalExpression('&&', id, c)));
                        } else {
                            elems.push(t.logicalExpression('&&', id, child));
                            innerIteration = child._iteration;
                        }

                    } else {
                        elems.push(applyIfDirectiveToNode(meta, child, nextChild));
                    }
                    continue;
                }
            }
            elems.push(child);
        }

        const multipleChilds = elems.length > 1;
        const hasArrayInChildren = (hasIteration || hasSlotTag || innerIteration);
        if (!multipleChilds && hasArrayInChildren) {
            return elems[0];
        } else {
            elems = t.arrayExpression(elems);
            return hasArrayInChildren ? applyFlatteningToNode(elems): elems;
        }
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


    function groupSlots(attrs: any, wrappedChildren: any) {
        let slotGroups = {};
        function addSlotElement(child) {
            const slotName = child._meta && child._meta.slot || CONST.DEFAULT_SLOT_NAME;

            if (!slotGroups[slotName]) {
                slotGroups[slotName] = [];
            }

            slotGroups[slotName].push(child);
            const isIterationOrFlattening = t.isCallExpression(child) && (child.callee._primitive === FLATTENING || child.callee._primitive === ITERATOR);
            const hasMultipleNodes = isIterationOrFlattening || (t.isLogicalExpression(child) && child.right._iteration);
            if (hasMultipleNodes) {
                slotGroups[slotName]._hasArrayNode = true;
            }
        }

        if (t.isArrayExpression(wrappedChildren)) {
            wrappedChildren.elements.forEach(addSlotElement);
        } else {
            addSlotElement(wrappedChildren);
        }

        const slotGroupsList = Object.keys(slotGroups).map((groupKey: any): any => {
            let slotGroup = slotGroups[groupKey];
            const multipleChilds = slotGroup.length > 1;
            const hasArrayInChildren = slotGroup._hasArrayNode;

            if (!multipleChilds && hasArrayInChildren) {
                slotGroup = slotGroup[0];
            } else {
                slotGroup = t.arrayExpression(slotGroup);
                slotGroup = hasArrayInChildren ? applyFlatteningToNode(slotGroup) : slotGroup;
            }

            return t.objectProperty(t.identifier(groupKey), slotGroup);
        });

        if (slotGroupsList.length) {
            attrs.properties.push(t.objectProperty(t.identifier('slotset'), t.objectExpression(slotGroupsList)))
        }
    }

    function buildElementCall(path, state) {
        const openingElmtPath = path.get('openingElement');
        const meta = openingElmtPath.node._meta;
        const tag = openingElmtPath.node.name;
        const tagName = tag.value; // (This will be null for customElements since is an Identifier constructor)
        const children = buildChildren(path.node, path, state);
        const attribs = openingElmtPath.node.attributes;

        // For templates, we dont need the element call
        if (tagName === CONST.TEMPLATE_TAG) {
            meta.isTemplate = true;
            children._meta = meta;
            return children;
        }

        // Slots transform
        if (meta.isSlotTag) {
            const slotName = meta.maybeSlotNameDef || CONST.DEFAULT_SLOT_NAME;
            const slotSet = t.identifier(`${SLOT_SET}.${slotName}`);
            const slot = t.logicalExpression('||', slotSet, children);
            slot._meta = meta;
            return slot;
        }

        const exprTag = applyPrimitive(tag._primitive || CREATE_ELEMENT);
        const args = [tag, attribs, children];

        if (tag._customElement) {
            groupSlots(attribs, children); // changes attribs as side-effect
            args.unshift(t.stringLiteral(tag._customElement));
            args.pop(); //remove children
        }

        // Return null when no attributes
        // TODO: Fix engine to support either null or undefined here
        // if (!attribs.properties || !attribs.properties.length) {
            //attribs.type = 'NullLiteral';
        // }

        const createElementExpression = t.callExpression(exprTag, args);
        createElementExpression._meta = meta; // Push metadata up
        return createElementExpression;
    }

    function convertJSXIdentifier(node, meta, path, state) {
        const hasIsDirective = meta.hasIsDirective = DIRECTIVES.is in meta.directives;
        // <a.b.c/>
        if (t.isJSXMemberExpression(node)) {
            throw path.buildCodeFrameError('Member expressions not supported');
        }

        // TODO: Deprecate this
        //<a:b/>
        if (t.isJSXNamespacedName(node)) {
            const name = node.namespace.name + CONST.MODULE_SYMBOL + node.name.name;
            const devName = node.namespace.name + '$' + node.name.name;
            const id = state.file.addImport(name, 'default', devName);
            metadata.addComponentDependency(name);
            id._primitive = VIRTUAL_ELEMENT;
            return id;
        }

        meta.tagName = node.name;

        // <div> -- Any name for now will work
        if (t.isJSXIdentifier(node) && (hasIsDirective || node.name.indexOf('-') !== -1)) {
            const originalName = node.name;
            const name = hasIsDirective ? meta.rootElement : originalName;
            const devName = toCamelCase(name);
            const id = state.file.addImport(name, 'default', devName);
            metadata.addComponentDependency(name);
            meta.isCustomElementTag = true;
            id._primitive = CUSTOM_ELEMENT;
            id._customElement = originalName;
            return id;
        }

        if (isSVG(node.name)) {
            meta.isSvgTag = true;
        }

        meta.isSlotTag = node.name === CONST.SLOT_TAG;

        return t.stringLiteral(node.name);
    }

    function isNSAttributeName(name) {
        return name.indexOf(':') !== -1;
    }

    function isMetaDirective(name) {
        return name === DIRECTIVES.if || name === DIRECTIVES.repeat;
    }

    function transformProp(prop, path, meta, state) {
        const attrMeta = prop._meta;
        const directive = attrMeta.directive;
        const scopedVars = meta.scoped;
        const tagName = meta.tagName;
        let valueName = prop.key.value || prop.key.name; // Identifier|Literal
        let valueNode = prop.value;
        let inScope = false;

        // Check to make sure the attribute name is allowed to the current tag
        if (meta.isCustomElementTag) {
            validator.validateCustomElementAtribute(tagName,valueName, path);
        } else if (!meta.isCustomElementTag && !directive && !meta.isSvgTag) {
            validator.validateHTMLAttribute(tagName, valueName, path);
        }

        valueName = getPropertyNameFromAttrName(valueName, tagName);
        if (attrMeta.expressionContainer) {
            prop.key._ignore = true; // This is to prevent infinite loop on the next traversal
            path.traverse(BoundThisVisitor, { customScope : state.customScope });
            valueNode = path.node.value;
        }

        if (directive) {
            let rootMember;
            if (t.isStringLiteral(valueNode) && directive !== DIRECTIVES.is /* allow `is` attribute */) {
                rootMember = getMemberFromNodeStringLiteral(valueNode);
                inScope = scopedVars.indexOf(rootMember) !== -1;
                valueNode = transformBindingLiteral(valueNode.value, inScope);

                if (!inScope && directive === DIRECTIVES.if || directive === DIRECTIVES.repeat) {
                    metadata.addUsedId(rootMember, state, t);
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

            if (valueName === 'className' && t.isStringLiteral(valueNode)) {
                const classObj = valueNode.value.trim().split(' ').reduce((r, k) => { r[k] = true; return r; }, {});
                valueNode = t.valueToNode(classObj);
                valueName = 'classMap';
            }
        }

        if (isNSAttributeName(valueName)) {
            attrMeta.svg = true;
            valueName = t.stringLiteral(valueName);
        } else {
            valueName = isTopLevelProp(valueName) || !needsComputedCheck(valueName) ? t.identifier(valueName) : t.stringLiteral(valueName);
        }

        prop.key = valueName;
        prop.value = valueNode;
        return prop;
    }

    function transformAndGroup(props: any, meta: any, path: any, state: any): any {
        const finalProps = [];
        const propKeys = {};
        function addGroupProp(key: string, value: any) {
            let group = propKeys[key];
            if (!group) {
                group = t.objectProperty(t.identifier(key), t.objectExpression([]));
                finalProps.push(group);
                propKeys[key] = group;
            }
            group.value.properties.push(value);
        }

        props.forEach((prop: any, index: number) => {
            const name = prop.key.value || prop.key.name; // Identifier|Literal
            const attrMeta = prop._meta;
            let groupName = CONST.ATTRS;
            prop = transformProp(prop, path[index], meta, state);

            if (isTopLevelProp(name)) {
                finalProps.push(prop);
                return;
            }

            if (attrMeta.isSlotAttr) {
                return;
            }

            if (attrMeta.directive && isMetaDirective(attrMeta.directive)) {
                meta[attrMeta.directive] = prop.value;
                return;
            }

            if (isProp(meta.tagName, name, meta.hasIsDirective) && !meta.isSvgTag) {
                groupName = CONST.PROPS;
            }

            if (attrMeta.event) {
                groupName = 'on';
            }

            addGroupProp(groupName, prop);
        });

        const objExpression = t.objectExpression(finalProps);
        objExpression._meta = meta;
        return objExpression;
    }

    function mergeAttrMetadata(meta, attrMeta: MetaConfig): MetaConfig {
        var skip = { 'modifier' : 1, 'expressionContainer': 1 };
        Object.keys(attrMeta).forEach(key => {
            if (key in skip) { return; }

            if (key === 'directive') {
                meta.directives[attrMeta[key]] = attrMeta.modifier || true;
                return;
            }

            if (key === 'inForScope') {
                meta.scoped.push(...attrMeta.inForScope);
            }

            meta[key] = attrMeta[key];
        });

        return meta;
    }

    function memoizeSubtree(expression: any, path: Path) {
        const root = path.find((path) => path.isProgram());
        const id = path.scope.generateUidIdentifier("m");
        const m = memoizeLookup({ ID: id });
        const hoistedMemoization = memoizeFunction({ ID: id, STATEMENT: expression });
        hoistedMemoization._memoize = true;
        root.unshiftContainer('body', hoistedMemoization);
        return m.expression;
    }

    function normalizeDirectives(attrMeta: MetaConfig, directive: string, modifier: string) {
        if (directive === DIRECTIVES.eval) {
            directive = DIRECTIVES.if;
            modifier = modifier === EVAL_MODIFIERS.if ? IF_MODIFIERS.true : IF_MODIFIERS.false;
        }

        if (directive === DIRECTIVES.for) {
            directive = DIRECTIVES.repeat;
            modifier = 'for';
        }

        if (directive === DIRECTIVES.if) {
            attrMeta.applyIfTransform = true;
        }

        if (directive === DIRECTIVES.repeat) {
            attrMeta.applyRepeatTransform = true;
        }

        attrMeta.directive = directive;
        attrMeta.modifier = modifier;
    }

    function normalizeAttributeName(node: any, path: Path): any {
        const attrMeta: MetaConfig = {};

        // If namespace, apply directive and modifier
        if (t.isJSXNamespacedName(node)) {
            const nsNode = node.namespace;
            const nameNode = node.name;

            // Transform nampespaced svg attrs correctly
            if (isSvgNsAttribute(nsNode.name)) {
                nameNode.name = `${nsNode.name}:${nameNode.name}`;
            } else {
                const directive = validator.validateDirective(nsNode.name, path);
                const modifier = validator.validateModifier(nameNode.name, directive, path);
                normalizeDirectives(attrMeta, directive, modifier);
            }
            node = nameNode;
        }

        // Autowire bind for properties prefixed with on
        if (node.name.indexOf(DIRECTIVES.on) === 0) {
            const rawEventName = node.name.substring(2);
            node.name = attrMeta.event = rawEventName;
            attrMeta.directive = DIRECTIVES.bind;

        // Special is directive
        } else if (node.name === DIRECTIVES.is) {
            attrMeta.directive = DIRECTIVES.is;

        // Potential slot name
        } else if (node.name === 'name') {
            attrMeta.hasNameAttribute = true;

        // Slot
        } else if (node.name === 'slot') {
            attrMeta.isSlotAttr = true;
            attrMeta.hasSlot = true;
        }

        // Replace node with an identifier
        if (t.isValidIdentifier(node.name)) {
            node.type = 'Identifier';
        } else {
            node = t.stringLiteral(node.name);
        }

        // Return nodeType: Identifier|StringLiteral
        return { node, attrMeta };
    }

    function normalizeAttributeValue(node: any, attrMeta: MetaConfig): BabelNode {
         node = node || t.booleanLiteral(true);

         if (t.isJSXExpressionContainer(node)) {
             // $FlowFixMe: Wrong Literal casting
             node = node.expression;
             attrMeta.expressionContainer = true;
         } else {
            t.assertLiteral(node);
         }

        if (attrMeta.directive === DIRECTIVES.is) {
            attrMeta.rootElement = node.value;
        }

        if (attrMeta.hasNameAttribute) {
            // Save the value name so in the slots is easy to transform going up
            attrMeta.maybeSlotNameDef = node.value;
        }

        if (attrMeta.isSlotAttr && !t.isBooleanLiteral(node)) {
            attrMeta.slot = node.value;
        }

        if (attrMeta.directive === DIRECTIVES.repeat) {
            const parsedValue = parseForStatement(node.value);
            // $FlowFixMe: Wrong Literal casting
            node.value = parsedValue.for;
            attrMeta.inForScope = parsedValue.args;
        }

        return node;
    }
}
