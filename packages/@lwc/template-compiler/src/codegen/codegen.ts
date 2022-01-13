/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ResolvedConfig } from '../config';

import * as t from '../shared/estree';
import { IRElement, LWCDirectiveRenderMode } from '../shared/types';
import { TEMPLATE_PARAMS } from '../shared/constants';

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
    | 'key'
    | 'tabindex'
    | 'scopedId'
    | 'scopedFragId'
    | 'comment'
    | 'sanitizeHtmlContent';

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
    bind: { name: 'b', alias: 'api_bind' },
    text: { name: 't', alias: 'api_text' },
    dynamicText: { name: 'd', alias: 'api_dynamic_text' },
    key: { name: 'k', alias: 'api_key' },
    tabindex: { name: 'ti', alias: 'api_tab_index' },
    scopedId: { name: 'gid', alias: 'api_scoped_id' },
    scopedFragId: { name: 'fid', alias: 'api_scoped_frag_id' },
    comment: { name: 'co', alias: 'api_comment' },
    sanitizeHtmlContent: { name: 'shc', alias: 'api_sanitize_html_content' },
};

export default class CodeGen {
    /** The AST root. */
    readonly root: IRElement;

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

    currentId = 0;
    currentKey = 0;
    innerHtmlInstances = 0;

    usedApis: { [name: string]: t.Identifier } = {};
    usedLwcApis: Set<string> = new Set();

    slotNames: Set<string> = new Set();
    memorizedIds: t.Identifier[] = [];
    referencedComponents: Set<string> = new Set();

    constructor({
        root,
        config,
        scopeFragmentId,
    }: {
        root: IRElement;
        config: ResolvedConfig;
        scopeFragmentId: boolean;
    }) {
        this.root = root;
        this.renderMode = root.lwc?.renderMode ?? LWCDirectiveRenderMode.shadow;
        this.preserveComments = root.lwc?.preserveComments?.value ?? config.preserveHtmlComments;
        this.scopeFragmentId = scopeFragmentId;
    }

    generateKey() {
        return this.currentKey++;
    }

    genElement(tagName: string, data: t.ObjectExpression, children: t.Expression) {
        return this._renderApiCall(RENDER_APIS.element, [t.literal(tagName), data, children]);
    }

    genCustomElement(
        tagName: string,
        componentClass: t.Identifier,
        data: t.ObjectExpression,
        children: t.Expression
    ) {
        this.referencedComponents.add(tagName);

        return this._renderApiCall(RENDER_APIS.customElement, [
            t.literal(tagName),
            componentClass,
            data,
            children,
        ]);
    }
    genDynamicElement(
        tagName: string,
        ctor: t.Expression,
        data: t.ObjectExpression,
        children: t.Expression
    ) {
        return this._renderApiCall(RENDER_APIS.dynamicCtor, [
            t.literal(tagName),
            ctor,
            data,
            children,
        ]);
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

    getSlot(slotName: string, data: t.ObjectExpression, children: t.Expression) {
        this.slotNames.add(slotName);

        return this._renderApiCall(RENDER_APIS.slot, [
            t.literal(slotName),
            data,
            children,
            t.identifier('$slotset'),
        ]);
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
}
