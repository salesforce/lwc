/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as astring from 'astring';

import {
    isBooleanAttribute,
    SVG_NAMESPACE,
    LWC_VERSION_COMMENT,
    isUndefined,
    parseStyleText,
} from '@lwc/shared';
import { CompilerMetrics, generateCompilerError, TemplateErrors } from '@lwc/errors';

import {
    isComment,
    isText,
    isSlot,
    isStringLiteral,
    isForBlock,
    isIf,
    isIfBlock,
    isForEach,
    isBaseElement,
    isExpression,
    isProperty,
    isComponent,
    isInnerHTMLDirective,
    isDynamicDirective,
    isKeyDirective,
    isDomDirective,
    isRefDirective,
    isSpreadDirective,
    isElement,
    isElseifBlock,
    isExternalComponent,
    isScopedSlotFragment,
    isSlotBindDirective,
    isLwcIsDirective,
    isOnDirective,
} from '../shared/ast';
import { TEMPLATE_PARAMS, TEMPLATE_FUNCTION_NAME, RENDERER } from '../shared/constants';
import * as t from '../shared/estree';
import {
    isAllowedFragOnlyUrlsXHTML,
    isAttribute,
    isFragmentOnlyUrl,
    isIdReferencingAttribute,
    isSvgUseHref,
} from '../parser/attribute';
import { isCustomRendererHookRequired } from '../shared/renderer-hooks';
import CodeGen from './codegen';
import {
    identifierFromComponentName,
    objectToAST,
    shouldFlatten,
    parseClassNames,
    hasIdAttribute,
    styleMapToStyleDeclsAST,
} from './helpers';
import { format as formatModule } from './formatters/module';
import { bindAttributeExpression } from './expression';
import type State from '../state';
import type {
    Root,
    ParentNode,
    ChildNode,
    Text,
    If,
    IfBlock,
    ForBlock,
    ForEach,
    Attribute,
    Property,
    Comment,
    ForOf,
    BaseElement,
    ElseifBlock,
    ScopedSlotFragment,
    StaticElement,
} from '../shared/types';

function transform(codeGen: CodeGen): t.Expression {
    const instrumentation = codeGen.state.config.instrumentation;
    function transformElement(element: BaseElement, slotParentName?: string): t.Expression {
        // TODO [#4077]: Move databag gathering to after static element check as it doesn't seem to be used by static
        // content optimization.
        const databag = elementDataBag(element, slotParentName);

        if (codeGen.staticNodes.has(element) && isElement(element)) {
            // do not process children of static nodes.
            return codeGen.genStaticElement(element as StaticElement, slotParentName);
        }

        const children = transformChildren(element);
        let res: t.Expression;

        const { name } = element;
        // lwc:dynamic directive
        const deprecatedDynamicDirective = element.directives.find(isDynamicDirective);
        // lwc:is directive
        const dynamicDirective = element.directives.find(isLwcIsDirective);

        if (deprecatedDynamicDirective) {
            const expression = codeGen.bindExpression(deprecatedDynamicDirective.value);
            res = codeGen.genDeprecatedDynamicElement(name, expression, databag, children);
        } else if (dynamicDirective) {
            const expression = codeGen.bindExpression(dynamicDirective.value);
            res = codeGen.genDynamicElement(expression, databag, children);
        } else if (isComponent(element)) {
            res = codeGen.genCustomElement(
                name,
                identifierFromComponentName(name),
                databag,
                children
            );
        } else if (isSlot(element)) {
            const defaultSlot = children;

            res = codeGen.getSlot(element.slotName, databag, defaultSlot);
        } else {
            res = codeGen.genElement(name, databag, children);
        }

        return res;
    }

    function transformText(consecutiveText: Text[]): t.Expression {
        return codeGen.genText(
            consecutiveText.map(({ value }) => {
                return isStringLiteral(value) ? value.value : codeGen.bindExpression(value);
            })
        );
    }

    function transformComment(comment: Comment): t.Expression {
        return codeGen.genComment(comment.value);
    }

    function transformChildren(parent: ParentNode): t.Expression {
        const res: t.Expression[] = [];
        const children = parent.children;
        const childrenIterator = children[Symbol.iterator]();
        let current: IteratorResult<ChildNode>;

        function isTextOrIgnoredComment(node: ChildNode): node is Text | Comment {
            return isText(node) || (isComment(node) && !codeGen.preserveComments);
        }

        while ((current = childrenIterator.next()) && !current.done) {
            let child = current.value;

            // Concatenate contiguous text nodes together (while skipping ignored comments)
            // E.g. `<div>{foo}{bar}</div>` can be concatenated into a single text node expression,
            // and so can `<div>{foo}<!-- baz -->{bar}</div>` if comments are ignored.
            if (isTextOrIgnoredComment(child)) {
                const continuousText: Text[] = [];

                // Consume all the contiguous text nodes.
                do {
                    if (isText(child)) {
                        continuousText.push(child);
                    }
                    current = childrenIterator.next();
                    child = current.value;
                } while (!current.done && isTextOrIgnoredComment(child));

                // Only push an api_text call if we actually have text to render.
                // (We might just have iterated through a sequence of ignored comments.)
                if (continuousText.length) {
                    res.push(transformText(continuousText));
                }

                // Early exit if a text node is the last child node.
                if (current.done) {
                    break;
                }
            }

            if (isForBlock(child)) {
                res.push(transformForBlock(child));
            } else if (isIf(child)) {
                const children = transformIf(child);
                if (Array.isArray(children)) {
                    res.push(...children);
                } else {
                    res.push(children);
                }
            } else if (isBaseElement(child)) {
                const slotParentName = isSlot(parent) ? parent.slotName : undefined;
                res.push(transformElement(child, slotParentName));
            } else if (isComment(child) && codeGen.preserveComments) {
                res.push(transformComment(child));
            } else if (isIfBlock(child)) {
                res.push(transformConditionalParentBlock(child));
            } else if (isScopedSlotFragment(child)) {
                res.push(transformScopedSlotFragment(child));
            }
        }

        if (shouldFlatten(codeGen, children)) {
            if (children.length === 1) {
                return res[0];
            } else {
                return codeGen.genFlatten([t.arrayExpression(res)]);
            }
        } else {
            return t.arrayExpression(res);
        }
    }

    function transformScopedSlotFragment(scopedSlotFragment: ScopedSlotFragment): t.Expression {
        const {
            slotName,
            slotData: { value: dataIdentifier },
        } = scopedSlotFragment;
        codeGen.beginScope();
        codeGen.declareIdentifier(dataIdentifier);

        // At runtime, the 'key' of the <slot> element will be propagated to the fragment vnode
        // produced by the ScopedSlotFactory
        const key = t.identifier('key');
        codeGen.declareIdentifier(key);

        const fragment = codeGen.genFragment(key, transformChildren(scopedSlotFragment));
        codeGen.endScope();

        // The factory is invoked with two parameters:
        // 1. The value of the binding specified in lwc:slot-bind directive
        // 2. The key to be applied to the fragment vnode, this will be used for diffing
        const slotFragmentFactory = t.functionExpression(
            null,
            [dataIdentifier, key],
            t.blockStatement([t.returnStatement(fragment)])
        );
        let slotNameTransformed: t.Expression | t.SimpleLiteral;
        if (t.isLiteral(slotName)) {
            slotNameTransformed = t.literal(slotName.value);
        } else {
            slotNameTransformed = codeGen.bindExpression(slotName);
        }
        return codeGen.getScopedSlotFactory(slotFragmentFactory, slotNameTransformed);
    }

    function transformIf(ifNode: If): t.Expression | t.Expression[] {
        const expression = transformChildren(ifNode);
        let res: t.Expression | t.Expression[];

        if (t.isArrayExpression(expression)) {
            // Bind the expression once for all the template children
            const testExpression = codeGen.bindExpression(ifNode.condition);

            res = t.arrayExpression(
                expression.elements.map((element) =>
                    element !== null
                        ? applyInlineIf(ifNode, element as t.Expression, testExpression)
                        : null
                )
            );
        } else {
            // If the template has a single children, make sure the ternary expression returns an array
            res = applyInlineIf(ifNode, expression, undefined, t.arrayExpression([]));
        }

        if (t.isArrayExpression(res)) {
            // The `if` transformation does not use the SpreadElement, neither null, therefore we can safely
            // typecast it to t.Expression[]
            res = res.elements as t.Expression[];
        }

        return res;
    }

    /**
     * Transforms an IfBlock or ElseifBlock along with both its direct descendants and its 'else' descendants.
     * @param conditionalParentBlock The IfBlock or ElseifBlock to transform into a conditional expression
     * @param key The key to use for this chain of IfBlock/ElseifBlock branches, if applicable
     * @returns A conditional expression representing the full conditional tree with conditionalParentBlock as the root node
     */
    function transformConditionalParentBlock(
        conditionalParentBlock: IfBlock | ElseifBlock,
        key?: number
    ): t.Expression {
        const ifBlockKey = key ?? codeGen.generateKey();

        const childrenExpression = codeGen.genFragment(
            t.literal(ifBlockKey),
            transformChildren(conditionalParentBlock)
        );

        let elseExpression: t.Expression = t.literal(null);
        if (conditionalParentBlock.else) {
            elseExpression = isElseifBlock(conditionalParentBlock.else)
                ? transformConditionalParentBlock(conditionalParentBlock.else, ifBlockKey)
                : codeGen.genFragment(
                      t.literal(ifBlockKey),
                      transformChildren(conditionalParentBlock.else)
                  );
        }

        return t.conditionalExpression(
            codeGen.bindExpression(conditionalParentBlock.condition),
            childrenExpression,
            elseExpression
        );
    }

    function applyInlineIf(
        ifNode: If,
        node: t.Expression,
        testExpression?: t.Expression,
        falseValue?: t.Expression
    ): t.Expression {
        if (!testExpression) {
            testExpression = codeGen.bindExpression(ifNode.condition);
        }

        let leftExpression: t.Expression;
        const modifier = ifNode.modifier;

        /* istanbul ignore else */
        if (modifier === 'true') {
            leftExpression = testExpression;
        } else if (modifier === 'false') {
            leftExpression = t.unaryExpression('!', testExpression);
        } else if (modifier === 'strict-true') {
            leftExpression = t.binaryExpression('===', testExpression, t.literal(true));
        } else {
            // This is a defensive check, should be taken care of during parsing.
            throw generateCompilerError(TemplateErrors.UNKNOWN_IF_MODIFIER, {
                messageArgs: [modifier],
            });
        }

        return t.conditionalExpression(leftExpression, node, falseValue ?? t.literal(null));
    }

    function transformForBlock(forBlock: ForBlock): t.Expression {
        let expression = transformForChildren(forBlock);

        if (t.isArrayExpression(expression) && expression.elements.length === 1) {
            expression = expression.elements[0] as t.Expression;
        }

        let res: t.Expression;
        if (isForEach(forBlock)) {
            res = applyInlineFor(forBlock, expression);
        } else {
            res = applyInlineForOf(forBlock, expression);
        }

        return res;
    }

    function transformForChildren(forBlock: ForBlock): t.Expression {
        codeGen.beginScope();

        if (isForEach(forBlock)) {
            const { item, index } = forBlock;
            if (index) {
                codeGen.declareIdentifier(index);
            }

            codeGen.declareIdentifier(item);
        } else {
            codeGen.declareIdentifier(forBlock.iterator);
        }

        const children = transformChildren(forBlock);
        codeGen.endScope();

        return children;
    }

    function applyInlineFor(forEach: ForEach, node: t.Expression): t.Expression {
        const { expression, item, index } = forEach;
        const params = [item];
        if (index) {
            params.push(index);
        }

        const iterable = codeGen.bindExpression(expression);
        const iterationFunction = t.functionExpression(
            null,
            params,
            t.blockStatement([t.returnStatement(node)])
        );

        return codeGen.genIterator(iterable, iterationFunction);
    }

    function applyInlineForOf(forOf: ForOf, node: t.Expression): t.Expression {
        const { expression, iterator } = forOf;
        const { name: iteratorName } = iterator;

        const argsMapping = {
            value: `${iteratorName}Value`,
            index: `${iteratorName}Index`,
            first: `${iteratorName}First`,
            last: `${iteratorName}Last`,
        };

        const iteratorArgs = Object.values(argsMapping).map((arg) => t.identifier(arg));
        const iteratorObject = t.objectExpression(
            Object.entries(argsMapping).map(([prop, arg]) =>
                t.property(t.identifier(prop), t.identifier(arg))
            )
        );

        const iterable = codeGen.bindExpression(expression);
        const iterationFunction = t.functionExpression(
            null,
            iteratorArgs,
            t.blockStatement([
                t.variableDeclaration('const', [
                    t.variableDeclarator(t.identifier(iteratorName), iteratorObject),
                ]),
                t.returnStatement(node),
            ])
        );

        return codeGen.genIterator(iterable, iterationFunction);
    }

    function computeAttrValue(
        attr: Attribute | Property,
        element: BaseElement,
        addLegacySanitizationHook: boolean
    ): t.Expression {
        const { name: elmName, namespace = '' } = element;
        const { value: attrValue } = attr;
        // Evaluate properties based on their attribute name
        const attrName = isProperty(attr) ? attr.attributeName : attr.name;
        const isUsedAsAttribute = isAttribute(element, attrName);

        if (isExpression(attrValue)) {
            return bindAttributeExpression(attr, element, codeGen, addLegacySanitizationHook);
        } else if (isStringLiteral(attrValue)) {
            if (attrName === 'id') {
                return codeGen.genScopedId(attrValue.value);
            }

            // `spellcheck` string values are specially handled to massage them into booleans.
            if (attrName === 'spellcheck') {
                return t.literal(attrValue.value.toLowerCase() !== 'false');
            }

            if (!isUsedAsAttribute && isBooleanAttribute(attrName, elmName)) {
                // We are in presence of a string value, for a recognized boolean attribute, which is used as
                // property. for these cases, always set the property to true.
                return t.literal(true);
            }

            if (isIdReferencingAttribute(attrName)) {
                return codeGen.genScopedId(attrValue.value);
            }

            if (
                codeGen.scopeFragmentId &&
                isAllowedFragOnlyUrlsXHTML(elmName, attrName, namespace) &&
                isFragmentOnlyUrl(attrValue.value)
            ) {
                return codeGen.genScopedFragId(attrValue.value);
            }

            if (isSvgUseHref(elmName, attrName, namespace)) {
                // Apply the fragment id scoping transformation if necessary.
                // This scoping can be skipped if the value is a string literal that doesn't start with a "#"
                const value = isFragmentOnlyUrl(attrValue.value)
                    ? codeGen.genScopedFragId(attrValue.value)
                    : t.literal(attrValue.value);
                if (addLegacySanitizationHook) {
                    codeGen.usedLwcApis.add('sanitizeAttribute');

                    return t.callExpression(t.identifier('sanitizeAttribute'), [
                        t.literal(elmName),
                        t.literal(namespace),
                        t.literal(attrName),
                        value,
                    ]);
                }
                return value;
            }

            return t.literal(attrValue.value);
        } else {
            // A boolean value used in an attribute should always generate .setAttribute(attr.name, ''),
            // regardless if is a boolean attribute or not.
            return isUsedAsAttribute ? t.literal('') : t.literal(attrValue.value);
        }
    }

    function elementDataBag(element: BaseElement, slotParentName?: string): t.ObjectExpression {
        const data: t.Property[] = [];

        const { attributes, properties, listeners } = element;

        const innerHTML = element.directives.find(isInnerHTMLDirective);
        const forKey = element.directives.find(isKeyDirective);
        const dom = element.directives.find(isDomDirective);
        const ref = element.directives.find(isRefDirective);
        const spread = element.directives.find(isSpreadDirective);
        const onDirective = element.directives.find(isOnDirective);
        const addSanitizationHook = isCustomRendererHookRequired(element, codeGen.state);
        const slotBindDirective = element.directives.find(isSlotBindDirective);

        // Attributes
        if (attributes.length) {
            const rest: { [name: string]: t.Expression } = {};

            for (const attr of attributes) {
                const { name, value } = attr;
                if (name === 'class') {
                    // Handle class attribute:
                    // - expression values are turned into a `className` property.
                    // - string values are parsed and turned into a `classMap` object associating
                    //   each individual class name with a `true` boolean.
                    if (isExpression(value)) {
                        data.push(
                            t.property(t.identifier('className'), codeGen.genClassExpression(value))
                        );
                    } else if (isStringLiteral(value)) {
                        const classNames = parseClassNames(value.value);
                        const classMap = t.objectExpression(
                            classNames.map((name) => t.property(t.literal(name), t.literal(true)))
                        );
                        data.push(t.property(t.identifier('classMap'), classMap));
                    }
                } else if (name === 'style') {
                    // Handle style attribute:
                    // - expression values are turned into a `style` property.
                    // - string values are parsed and turned into a `styles` array
                    // containing triples of [name, value, important (optional)]
                    if (isExpression(value)) {
                        const styleExpression = codeGen.bindExpression(value);
                        data.push(t.property(t.identifier('style'), styleExpression));
                    } else if (isStringLiteral(value)) {
                        const styleMap = parseStyleText(value.value);
                        const styleAST = styleMapToStyleDeclsAST(styleMap);
                        data.push(t.property(t.identifier('styleDecls'), styleAST));
                    }
                } else if (name === 'slot') {
                    let slotValue;
                    if (isExpression(value)) {
                        slotValue = codeGen.bindExpression(value);
                    } else {
                        slotValue = isStringLiteral(value) ? t.literal(value.value) : t.literal('');
                    }
                    data.push(t.property(t.identifier('slotAssignment'), slotValue));
                } else {
                    rest[name] = computeAttrValue(attr, element, !addSanitizationHook);
                }
            }

            // Add all the remaining attributes to an `attrs` object where the key is the attribute
            // name and the value is the computed attribute value.
            if (Object.keys(rest).length) {
                const attrsObj = objectToAST(rest, (key) => rest[key]);
                data.push(t.property(t.identifier('attrs'), attrsObj));
            }
        }

        // Properties
        const propsObj = t.objectExpression([]);

        // Properties
        if (properties.length) {
            for (const prop of properties) {
                propsObj.properties.push(
                    t.property(
                        t.literal(prop.name),
                        computeAttrValue(prop, element, !addSanitizationHook)
                    )
                );
            }
        }

        // Properties: lwc:inner-html directive
        if (innerHTML) {
            const expr = isStringLiteral(innerHTML.value)
                ? t.literal(innerHTML.value.value)
                : codeGen.bindExpression(innerHTML.value);
            propsObj.properties.push(
                t.property(
                    t.identifier('innerHTML'),
                    // If lwc:inner-html is added as a directive requiring custom renderer, no need
                    // to add the legacy sanitizeHtmlContent hook
                    addSanitizationHook ? expr : codeGen.genSanitizedHtmlExpr(expr)
                )
            );
        }

        // Properties: lwc:ref directive
        if (ref) {
            data.push(codeGen.genRef(ref));
        }

        // Properties: lwc:spread directive
        if (spread) {
            // spread goes last, so it can be used to override any other properties
            propsObj.properties.push(t.spreadElement(codeGen.bindExpression(spread.value)));
            instrumentation?.incrementCounter(CompilerMetrics.LWCSpreadDirective);
        }
        if (propsObj.properties.length) {
            data.push(t.property(t.identifier('props'), propsObj));
        }

        // Context
        if (dom || innerHTML) {
            const contextObj = t.objectExpression([
                t.property(
                    t.identifier('lwc'),
                    t.objectExpression([t.property(t.identifier('dom'), t.literal('manual'))])
                ),
            ]);
            data.push(t.property(t.identifier('context'), contextObj));
        }

        // Key property on VNode
        data.push(
            t.property(t.identifier('key'), codeGen.genKeyExpression(forKey, slotParentName))
        );

        // Event handler
        if (listeners.length) {
            data.push(codeGen.genEventListeners(listeners));
        }

        // dynamic event listeners: lwc:on directive
        // codeGen.genDynamicEventListeners returns an array containing 2 properties: 'dynamicOn' & 'dynamicOnRaw'
        if (onDirective) {
            data.push(...codeGen.genDynamicEventListeners(onDirective));
        }

        // SVG handling
        if (element.namespace === SVG_NAMESPACE) {
            data.push(t.property(t.identifier('svg'), t.literal(true)));
        }

        if (addSanitizationHook) {
            codeGen.usedLwcApis.add(RENDERER);
            data.push(t.property(t.identifier(RENDERER), t.identifier(RENDERER)));
        }

        if (!isUndefined(slotBindDirective)) {
            data.push(
                t.property(
                    t.identifier('slotData'),
                    codeGen.bindExpression(slotBindDirective.value)
                )
            );
        }

        if (isExternalComponent(element)) {
            data.push(t.property(t.identifier('external'), t.literal(true)));
        }

        return t.objectExpression(data);
    }

    return transformChildren(codeGen.root);
}

function generateTemplateFunction(codeGen: CodeGen): t.FunctionDeclaration {
    const returnedValue = transform(codeGen);

    const args = [
        TEMPLATE_PARAMS.API,
        TEMPLATE_PARAMS.INSTANCE,
        TEMPLATE_PARAMS.SLOT_SET,
        TEMPLATE_PARAMS.CONTEXT,
    ].map((id) => t.identifier(id));

    const usedApis = Object.keys(codeGen.usedApis);
    const body: t.Statement[] =
        usedApis.length === 0
            ? []
            : [
                  t.variableDeclaration('const', [
                      t.variableDeclarator(
                          t.objectPattern(
                              usedApis.map((name) =>
                                  t.assignmentProperty(t.identifier(name), codeGen.usedApis[name])
                              )
                          ),
                          t.identifier(TEMPLATE_PARAMS.API)
                      ),
                  ]),
              ];

    if (codeGen.memoizedIds.length) {
        body.push(
            t.variableDeclaration('const', [
                t.variableDeclarator(
                    t.objectPattern(
                        codeGen.memoizedIds.map((id) =>
                            t.assignmentProperty(id, id, { shorthand: true })
                        )
                    ),
                    t.identifier(TEMPLATE_PARAMS.CONTEXT)
                ),
            ])
        );
    }

    body.push(t.returnStatement(returnedValue));

    return t.functionDeclaration(
        t.identifier(TEMPLATE_FUNCTION_NAME),
        args,
        t.blockStatement(body, {
            trailingComments: [t.comment(LWC_VERSION_COMMENT)],
        })
    );
}

export default function (root: Root, state: State): string {
    const scopeFragmentId = hasIdAttribute(root);
    const codeGen = new CodeGen({
        root,
        state,
        scopeFragmentId,
    });

    const templateFunction = generateTemplateFunction(codeGen);

    const program: t.Program = formatModule(templateFunction, codeGen);

    return astring.generate(program, { comments: true });
}
