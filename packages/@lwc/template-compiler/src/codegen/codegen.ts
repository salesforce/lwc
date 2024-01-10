/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { walk } from 'estree-walker';
import { APIVersion, getAPIVersionFromNumber, SVG_NAMESPACE } from '@lwc/shared';

import * as t from '../shared/estree';
import {
    ChildNode,
    Expression,
    ComplexExpression,
    Literal,
    LWCDirectiveRenderMode,
    Root,
    EventListener,
    RefDirective,
    Text,
    StaticElement,
} from '../shared/types';
import {
    PARSE_FRAGMENT_METHOD_NAME,
    PARSE_SVG_FRAGMENT_METHOD_NAME,
    TEMPLATE_PARAMS,
} from '../shared/constants';
import {
    isComment,
    isElement,
    isPreserveCommentsDirective,
    isRenderModeDirective,
} from '../shared/ast';
import { isArrayExpression } from '../shared/estree';
import State from '../state';
import { getStaticNodes, memorizeHandler, objectToAST } from './helpers';
import { serializeStaticElement } from './static-element-serializer';
import { bindComplexExpression } from './expression';

// structuredClone is only available in Node 17+
// https://developer.mozilla.org/en-US/docs/Web/API/structuredClone#browser_compatibility
const doStructuredClone =
    typeof structuredClone === 'function'
        ? structuredClone
        : (obj: any) => JSON.parse(JSON.stringify(obj));

type RenderPrimitive =
    | 'iterator'
    | 'flatten'
    | 'element'
    | 'slot'
    | 'customElement'
    | 'bind'
    | 'text'
    | 'dynamicText'
    | 'dynamicCtor'
    | 'deprecatedDynamicCtor'
    | 'key'
    | 'tabindex'
    | 'scopedId'
    | 'scopedFragId'
    | 'comment'
    | 'sanitizeHtmlContent'
    | 'fragment'
    | 'staticFragment'
    | 'scopedSlotFactory'
    | 'staticPart';

interface RenderPrimitiveDefinition {
    name: string;
    alias: string;
}

const RENDER_APIS: { [primitive in RenderPrimitive]: RenderPrimitiveDefinition } = {
    iterator: { name: 'i', alias: 'api_iterator' },
    flatten: { name: 'f', alias: 'api_flatten' },
    element: { name: 'h', alias: 'api_element' },
    slot: { name: 's', alias: 'api_slot' },
    customElement: { name: 'c', alias: 'api_custom_element' },
    dynamicCtor: { name: 'dc', alias: 'api_dynamic_component' },
    // TODO [#3331]: remove usage of lwc:dynamic in 246
    deprecatedDynamicCtor: { name: 'ddc', alias: 'api_deprecated_dynamic_component' },
    bind: { name: 'b', alias: 'api_bind' },
    text: { name: 't', alias: 'api_text' },
    dynamicText: { name: 'd', alias: 'api_dynamic_text' },
    key: { name: 'k', alias: 'api_key' },
    tabindex: { name: 'ti', alias: 'api_tab_index' },
    scopedId: { name: 'gid', alias: 'api_scoped_id' },
    scopedFragId: { name: 'fid', alias: 'api_scoped_frag_id' },
    comment: { name: 'co', alias: 'api_comment' },
    sanitizeHtmlContent: { name: 'shc', alias: 'api_sanitize_html_content' },
    fragment: { name: 'fr', alias: 'api_fragment' },
    staticFragment: { name: 'st', alias: 'api_static_fragment' },
    scopedSlotFactory: { name: 'ssf', alias: 'api_scoped_slot_factory' },
    staticPart: { name: 'sp', alias: 'api_static_part' },
};

interface Scope {
    parent: Scope | null;
    declaration: Set<string>;
}

export default class CodeGen {
    /** The AST root. */
    readonly root: Root;

    /** The template render mode. */
    readonly renderMode: LWCDirectiveRenderMode;

    /** Indicates whether the generated code should preserve HTML comments or not. */
    readonly preserveComments: boolean;

    /**
     * This flag indicates if the generated code should scope the template fragment id. It is set to
     * true if the template also contains ids.
     *
     * TODO [#1150]: Remove this code once we can figure out how to do this in a deterministic
     * fashion.
     */
    readonly scopeFragmentId: boolean;

    /**
     * The scope keeps track of the identifiers that have been seen while traversing the AST.
     * Currently, we are keeping track of item, index and iterator on the ForEach and ForOf nodes respectively.
     *
     * Scope is used in bindExpression to determine if the expression is a known identifier.
     * A known identifier exists if it exists in the scope chain.
     */
    private scope: Scope;

    readonly staticNodes: Set<ChildNode> = new Set<ChildNode>();
    readonly hoistedNodes: Array<{ identifier: t.Identifier; expr: t.Expression }> = [];

    /** True if this template contains the lwc:ref directive */
    hasRefs: boolean = false;

    /**
     * State maintains information about the current compilation configs.
     */
    readonly state: State;

    currentId = 0;
    currentKey = 0;
    innerHtmlInstances = 0;

    usedApis: { [name: string]: t.Identifier } = {};
    usedLwcApis: Set<string> = new Set();

    slotNames: Set<string> = new Set();
    memorizedIds: t.Identifier[] = [];
    referencedComponents: Set<string> = new Set();
    apiVersion: APIVersion;

    constructor({
        root,
        state,
        scopeFragmentId,
    }: {
        root: Root;
        state: State;
        scopeFragmentId: boolean;
    }) {
        this.root = root;

        if (state.config.enableStaticContentOptimization) {
            this.staticNodes = getStaticNodes(root, state);
        }
        this.renderMode =
            root.directives.find(isRenderModeDirective)?.value.value ??
            LWCDirectiveRenderMode.shadow;
        this.preserveComments =
            root.directives.find(isPreserveCommentsDirective)?.value.value ??
            state.config.preserveHtmlComments;

        this.scopeFragmentId = scopeFragmentId;
        this.scope = this.createScope();
        this.state = state;
        this.apiVersion = getAPIVersionFromNumber(state.config.apiVersion);
    }

    generateKey() {
        return this.currentKey++;
    }

    genElement(tagName: string, data: t.ObjectExpression, children: t.Expression) {
        const args: t.Expression[] = [t.literal(tagName), data];
        if (!isArrayExpression(children) || children.elements.length > 0) {
            args.push(children); // only generate children if non-empty
        }
        return this._renderApiCall(RENDER_APIS.element, args);
    }

    genCustomElement(
        tagName: string,
        componentClass: t.Identifier,
        data: t.ObjectExpression,
        children: t.Expression
    ) {
        this.referencedComponents.add(tagName);

        const args: t.Expression[] = [t.literal(tagName), componentClass, data];
        if (!isArrayExpression(children) || children.elements.length > 0) {
            args.push(children); // only generate children if non-empty
        }

        return this._renderApiCall(RENDER_APIS.customElement, args);
    }

    genDynamicElement(ctor: t.Expression, data: t.ObjectExpression, children: t.Expression) {
        const args: t.Expression[] = [ctor, data];
        if (!isArrayExpression(children) || children.elements.length > 0) {
            args.push(children); // only generate children if non-empty
        }

        return this._renderApiCall(RENDER_APIS.dynamicCtor, args);
    }

    genDeprecatedDynamicElement(
        tagName: string,
        ctor: t.Expression,
        data: t.ObjectExpression,
        children: t.Expression
    ) {
        const args: t.Expression[] = [t.literal(tagName), ctor, data];
        if (!isArrayExpression(children) || children.elements.length > 0) {
            args.push(children); // only generate children if non-empty
        }

        return this._renderApiCall(RENDER_APIS.deprecatedDynamicCtor, args);
    }

    genText(value: Array<string | t.Expression>): t.Expression {
        const mappedValues = value.map((v) => {
            return typeof v === 'string'
                ? t.literal(v)
                : this._renderApiCall(RENDER_APIS.dynamicText, [v]);
        });

        let textConcatenation: t.Expression = mappedValues[0];

        for (let i = 1, n = mappedValues.length; i < n; i++) {
            textConcatenation = t.binaryExpression('+', textConcatenation, mappedValues[i]);
        }

        return this._renderApiCall(RENDER_APIS.text, [textConcatenation]);
    }

    genComment(value: string): t.Expression {
        return this._renderApiCall(RENDER_APIS.comment, [t.literal(value)]);
    }

    genSanitizeHtmlContent(content: t.Expression): t.Expression {
        return this._renderApiCall(RENDER_APIS.sanitizeHtmlContent, [content]);
    }

    genFragment(
        key: t.Expression | t.SimpleLiteral,
        children: t.Expression,
        stable: boolean = false
    ): t.Expression {
        const isStable = stable ? t.literal(1) : t.literal(0);
        return this._renderApiCall(RENDER_APIS.fragment, [key, children, isStable]);
    }

    genIterator(iterable: t.Expression, callback: t.FunctionExpression) {
        return this._renderApiCall(RENDER_APIS.iterator, [iterable, callback]);
    }

    genBind(handler: t.Expression) {
        return this._renderApiCall(RENDER_APIS.bind, [handler]);
    }

    genFlatten(children: t.Expression[]) {
        return this._renderApiCall(RENDER_APIS.flatten, children);
    }

    genKey(compilerKey: t.SimpleLiteral, value: t.Expression) {
        return this._renderApiCall(RENDER_APIS.key, [compilerKey, value]);
    }

    genScopedId(id: string | t.Expression): t.CallExpression {
        if (typeof id === 'string') {
            return this._renderApiCall(RENDER_APIS.scopedId, [t.literal(id)]);
        }
        return this._renderApiCall(RENDER_APIS.scopedId, [id]);
    }

    genScopedFragId(id: string | t.Expression): t.CallExpression {
        if (typeof id === 'string') {
            return this._renderApiCall(RENDER_APIS.scopedFragId, [t.literal(id)]);
        }
        return this._renderApiCall(RENDER_APIS.scopedFragId, [id]);
    }

    /**
     * Generates childs vnodes when slot content is static.
     */
    getSlot(slotName: string, data: t.ObjectExpression, children: t.Expression) {
        this.slotNames.add(slotName);

        return this._renderApiCall(RENDER_APIS.slot, [
            t.literal(slotName),
            data,
            children,
            t.identifier('$slotset'),
        ]);
    }

    /**
     * Generates a factory function that inturn generates child vnodes for scoped slot content.
     */
    getScopedSlotFactory(callback: t.FunctionExpression, slotName: t.Expression | t.SimpleLiteral) {
        return this._renderApiCall(RENDER_APIS.scopedSlotFactory, [slotName, callback]);
    }

    genTabIndex(children: [t.Expression]) {
        return this._renderApiCall(RENDER_APIS.tabindex, children);
    }

    getMemorizationId() {
        const currentId = this.currentId++;
        const memorizationId = t.identifier(`_m${currentId}`);

        this.memorizedIds.push(memorizationId);

        return memorizationId;
    }

    genBooleanAttributeExpr(bindExpr: t.Expression) {
        return t.conditionalExpression(bindExpr, t.literal(''), t.literal(null));
    }

    genEventListeners(listeners: EventListener[]) {
        const listenerObj = Object.fromEntries(
            listeners.map((listener) => [listener.name, listener])
        );
        const listenerObjectAST = objectToAST(listenerObj, (key) => {
            const componentHandler = this.bindExpression(listenerObj[key].handler);
            const handler = this.genBind(componentHandler);

            return memorizeHandler(this, componentHandler, handler);
        });

        return t.property(t.identifier('on'), listenerObjectAST);
    }

    genRef(ref: RefDirective) {
        this.hasRefs = true;
        return t.property(t.identifier('ref'), ref.value);
    }

    /**
     * This routine generates an expression that avoids
     * computing the sanitized html of a raw html if it does not change
     * between renders.
     *
     * @param expr
     * @returns sanitizedHtmlExpr
     */
    genSanitizedHtmlExpr(expr: t.Expression) {
        const instance = this.innerHtmlInstances++;

        // Optimization for static html.
        // Example input: <div lwc:inner-html="foo">
        // Output: $ctx._sanitizedHtml$0 || ($ctx._sanitizedHtml$0 = api_sanitize_html_content("foo"))
        if (t.isLiteral(expr)) {
            return t.logicalExpression(
                '||',
                t.memberExpression(
                    t.identifier(TEMPLATE_PARAMS.CONTEXT),
                    t.identifier(`_sanitizedHtml$${instance}`)
                ),
                t.assignmentExpression(
                    '=',
                    t.memberExpression(
                        t.identifier(TEMPLATE_PARAMS.CONTEXT),
                        t.identifier(`_sanitizedHtml$${instance}`)
                    ),
                    this.genSanitizeHtmlContent(expr)
                )
            );
        }

        // Example input: <div lwc:inner-html={foo}>
        // Output: $ctx._rawHtml$0 !== ($ctx._rawHtml$0 = $cmp.foo)
        //             ? ($ctx._sanitizedHtml$0 = api_sanitize_html_content($cmp.foo))
        //             : $ctx._sanitizedHtml$0
        //
        // Note: In the case of iterations, when the lwc:inner-html bound value depends on the
        //       iteration item, the generated expression won't be enough, and `sanitizeHtmlContent`
        //       will be called every time because this expression is based on the specific template
        //       usage of the lwc:inner-html, and in an iteration, usages are dynamically generated.
        return t.conditionalExpression(
            t.binaryExpression(
                '!==',
                t.memberExpression(
                    t.identifier(TEMPLATE_PARAMS.CONTEXT),
                    t.identifier(`_rawHtml$${instance}`)
                ),
                t.assignmentExpression(
                    '=',
                    t.memberExpression(
                        t.identifier(TEMPLATE_PARAMS.CONTEXT),
                        t.identifier(`_rawHtml$${instance}`)
                    ),
                    expr
                )
            ),
            t.assignmentExpression(
                '=',
                t.memberExpression(
                    t.identifier(TEMPLATE_PARAMS.CONTEXT),
                    t.identifier(`_sanitizedHtml$${instance}`)
                ),
                this.genSanitizeHtmlContent(expr)
            ),
            t.memberExpression(
                t.identifier(TEMPLATE_PARAMS.CONTEXT),
                t.identifier(`_sanitizedHtml$${instance}`)
            )
        );
    }

    private _renderApiCall(
        primitive: RenderPrimitiveDefinition,
        params: t.Expression[]
    ): t.CallExpression {
        const { name, alias } = primitive;

        let identifier = this.usedApis[name];
        if (!identifier) {
            identifier = this.usedApis[name] = t.identifier(alias);
        }

        return t.callExpression(identifier, params);
    }

    beginScope(): void {
        this.scope = this.createScope(this.scope);
    }

    private createScope(parent: Scope | null = null): Scope {
        return {
            parent,
            declaration: new Set(),
        };
    }

    endScope(): void {
        /* istanbul ignore if */
        if (!this.scope.parent) {
            throw new Error("Can't invoke endScope if the current scope has no parent");
        }

        this.scope = this.scope.parent;
    }

    declareIdentifier(identifier: t.Identifier): void {
        this.scope.declaration.add(identifier.name);
    }

    /**
     * Searches the scopes to find an identifier with a matching name.
     */
    isLocalIdentifier(identifier: t.Identifier): boolean {
        let scope: Scope | null = this.scope;

        while (scope !== null) {
            if (scope.declaration.has(identifier.name)) {
                return true;
            }

            scope = scope.parent;
        }

        return false;
    }

    /**
     * Bind the passed expression to the component instance. It applies the following transformation to the expression:
     * - {value} --> {$cmp.value}
     * - {value[index]} --> {$cmp.value[$cmp.index]}
     */
    bindExpression(expression: Expression | Literal | ComplexExpression): t.Expression {
        if (t.isIdentifier(expression)) {
            if (!this.isLocalIdentifier(expression)) {
                return t.memberExpression(t.identifier(TEMPLATE_PARAMS.INSTANCE), expression);
            } else {
                return expression;
            }
        }

        // TODO [#3370]: remove experimental template expression flag
        if (this.state.config.experimentalComplexExpressions) {
            return bindComplexExpression(expression as ComplexExpression, this);
        }

        const scope = this;

        // Cloning here is necessary because `this.replace()` is destructive, and we might use the
        // node later during static content optimization
        expression = doStructuredClone(expression);
        walk(expression, {
            leave(node, parent) {
                if (
                    parent !== null &&
                    t.isIdentifier(node) &&
                    t.isMemberExpression(parent) &&
                    parent.object === node &&
                    !scope.isLocalIdentifier(node)
                ) {
                    this.replace(t.memberExpression(t.identifier(TEMPLATE_PARAMS.INSTANCE), node));
                }
            },
        });

        return expression as t.Expression;
    }

    genStaticElement(element: StaticElement, slotParentName?: string): t.Expression {
        const key =
            slotParentName !== undefined
                ? `@${slotParentName}:${this.generateKey()}`
                : this.generateKey();
        const html = serializeStaticElement(element, this.preserveComments);

        const parseMethod =
            element.name !== 'svg' && element.namespace === SVG_NAMESPACE
                ? PARSE_SVG_FRAGMENT_METHOD_NAME
                : PARSE_FRAGMENT_METHOD_NAME;

        this.usedLwcApis.add(parseMethod);

        // building the taggedTemplate expression as if it were a string
        const expr = t.taggedTemplateExpression(
            t.identifier(parseMethod),
            t.templateLiteral(
                [
                    {
                        type: 'TemplateElement',
                        tail: true,
                        value: {
                            raw: html,
                            cooked: html,
                        },
                    },
                ],
                []
            )
        );

        const identifier = t.identifier(`$fragment${this.hoistedNodes.length + 1}`);
        this.hoistedNodes.push({
            identifier,
            expr,
        });

        const args: t.Expression[] = [t.callExpression(identifier, []), t.literal(key)];

        // Only add the third argument (staticParts) if this element needs it
        const staticParts = this.genStaticParts(element);
        if (staticParts) {
            args.push(staticParts);
        }

        return this._renderApiCall(RENDER_APIS.staticFragment, args);
    }

    genStaticParts(element: StaticElement): t.ArrayExpression | undefined {
        const stack: (StaticElement | Text)[] = [element];
        const partIdsToDatabagProps = new Map<number, t.Property[]>();
        let partId = -1;

        const addDatabagProp = (prop: t.Property) => {
            let databags = partIdsToDatabagProps.get(partId);
            if (!databags) {
                databags = [];
                partIdsToDatabagProps.set(partId, databags);
            }
            databags.push(prop);
        };

        // Depth-first traversal. We assign a partId to each element, which is an integer based on traversal order.
        while (stack.length > 0) {
            const node = stack.shift()!;

            // Skip comment nodes in parts count, as they will be stripped in production, unless when `lwc:preserve-comments` is enabled
            if (!isComment(node) || this.preserveComments) {
                partId++;
            }

            if (isElement(node)) {
                // has event listeners
                if (node.listeners.length) {
                    addDatabagProp(this.genEventListeners(node.listeners));
                }

                // see STATIC_SAFE_DIRECTIVES for what's allowed here
                for (const directive of node.directives) {
                    if (directive.name === 'Ref') {
                        addDatabagProp(this.genRef(directive));
                    }
                }

                // For depth-first traversal, children must be preprended in order, so that they are processed before
                // siblings. Note that this is consistent with the order used in the diffing algo as well as
                // `traverseAndSetElements` in @lwc/engine-core.
                stack.unshift(...node.children);
            }
        }

        if (partIdsToDatabagProps.size === 0) {
            return undefined; // no databags needed
        }

        return t.arrayExpression(
            [...partIdsToDatabagProps.entries()].map(([partId, databagProperties]) => {
                return this.genStaticPart(partId, databagProperties);
            })
        );
    }

    genStaticPart(partId: number, databagProperties: t.Property[]): t.CallExpression {
        return this._renderApiCall(RENDER_APIS.staticPart, [
            t.literal(partId),
            t.objectExpression(databagProperties),
        ]);
    }
}
