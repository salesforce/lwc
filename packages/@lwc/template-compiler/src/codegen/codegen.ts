/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as babylon from '@babel/parser';
import * as t from '@babel/types';
import * as esutils from 'esutils';
import toCamelCase from 'camelcase';
import { isUndefined } from 'util';

type RenderPrimitive =
    | 'iterator'
    | 'flatten'
    | 'element'
    | 'slot'
    | 'customElement'
    | 'bind'
    | 'functionBind'
    | 'locatorListenerBind'
    | 'text'
    | 'dynamic'
    | 'key'
    | 'tabindex'
    | 'scopedId';

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
    bind: { name: 'b', alias: 'api_bind' },
    functionBind: { name: 'fb', alias: 'function_bind' },
    locatorListenerBind: { name: 'll', alias: 'locator_listener' },
    text: { name: 't', alias: 'api_text' },
    dynamic: { name: 'd', alias: 'api_dynamic' },
    key: { name: 'k', alias: 'api_key' },
    tabindex: { name: 'ti', alias: 'api_tab_index' },
    scopedId: { name: 'gid', alias: 'api_scoped_id' },
};

export default class CodeGen {
    currentId = 0;

    usedApis: { [name: string]: t.Identifier } = {};
    usedSlots: { [name: string]: t.Identifier } = {};
    memorizedIds: t.Identifier[] = [];
    inlineStyleImports: t.ImportDeclaration[] = [];
    inlineStyleBody: t.Statement[] = [];

    genInlineStyles(src: string | undefined): void {
        if (src) {
            // We get back a AST module which may have three pieces:
            // 1) import statements
            // 2) the inline function
            // 3) default export
            // We need to separate the imports and change the default export for a correct inlining
            const importDeclarations: t.ImportDeclaration[] = [];
            const styleBody: t.Statement[] = [];

            // Parse the generated module code and return it's body.
            const parsed = babylon.parse(src, { sourceType: 'module' });
            const inlineStylesAst = parsed.program.body;

            inlineStylesAst.forEach(node => {
                if (t.isImportDeclaration(node)) {
                    importDeclarations.push(node);
                } else if (t.isExportDefaultDeclaration(node)) {
                    const stylesheetDeclaration = t.variableDeclaration('const', [
                        t.variableDeclarator(
                            t.identifier('stylesheets'),
                            node.declaration as t.ArrayExpression,
                        ),
                    ]);

                    styleBody.push(stylesheetDeclaration);
                } else {
                    styleBody.push(node);
                }
            });

            this.inlineStyleImports = importDeclarations;
            this.inlineStyleBody = styleBody;
        }
    }

    genElement(tagName: string, data: t.ObjectExpression, children: t.Expression) {
        return this._renderApiCall(RENDER_APIS.element, [t.stringLiteral(tagName), data, children]);
    }

    genCustomElement(
        tagName: string,
        componentClass: t.Identifier,
        data: t.ObjectExpression,
        children: t.Expression,
    ) {
        return this._renderApiCall(RENDER_APIS.customElement, [
            t.stringLiteral(tagName),
            componentClass,
            data,
            children,
        ]);
    }

    genText(value: string | t.Expression): t.Expression {
        if (typeof value === 'string') {
            return this._renderApiCall(RENDER_APIS.text, [t.stringLiteral(value)]);
        } else {
            return this._renderApiCall(RENDER_APIS.dynamic, [value]);
        }
    }

    genIterator(iterable: t.Expression, callback: t.FunctionExpression) {
        return this._renderApiCall(RENDER_APIS.iterator, [iterable, callback]);
    }

    genBind(handler: t.Expression) {
        return this._renderApiCall(RENDER_APIS.bind, [handler]);
    }

    genFunctionBind(fn: t.Expression) {
        return this._renderApiCall(RENDER_APIS.functionBind, [fn]);
    }

    genLocatorBind(
        handler: t.Expression,
        locatorId: string,
        locatorProvider: t.Expression | undefined,
    ) {
        const argsList = [handler, t.stringLiteral(locatorId)];
        if (!isUndefined(locatorProvider)) {
            argsList.push(locatorProvider);
        }
        return this._renderApiCall(RENDER_APIS.locatorListenerBind, argsList);
    }

    genFlatten(children: t.Expression[]) {
        return this._renderApiCall(RENDER_APIS.flatten, children);
    }

    genKey(compilerKey: t.NumericLiteral, value: t.Expression) {
        return this._renderApiCall(RENDER_APIS.key, [compilerKey, value]);
    }

    genScopedId(id: string | t.Expression): t.CallExpression {
        if (typeof id === 'string') {
            return this._renderApiCall(RENDER_APIS.scopedId, [t.stringLiteral(id)]);
        }
        return this._renderApiCall(RENDER_APIS.scopedId, [id]);
    }

    getSlot(slotName: string, data: t.ObjectExpression, children: t.Expression) {
        return this._renderApiCall(RENDER_APIS.slot, [
            t.stringLiteral(slotName),
            data,
            children,
            t.identifier('$slotset'),
        ]);
    }

    genTabIndex(children: [t.Expression]) {
        return this._renderApiCall(RENDER_APIS.tabindex, children);
    }

    getMemorizationId() {
        const id = this._genUniqueIdentifier('_m');
        this.memorizedIds.push(id);

        return id;
    }

    private _genUniqueIdentifier(name: string) {
        const id = this.currentId++;
        const prefix = this._toValidIdentifier(name);

        return t.identifier(prefix + id);
    }

    private _toValidIdentifier(name: string) {
        return esutils.keyword.isIdentifierES6(name) ? name : toCamelCase(name);
    }

    private _renderApiCall(
        primitive: RenderPrimitiveDefinition,
        params: t.Expression[],
    ): t.CallExpression {
        const { name, alias } = primitive;

        let identifier = this.usedApis[name];
        if (!identifier) {
            identifier = this.usedApis[name] = t.identifier(alias);
        }

        return t.callExpression(identifier, params);
    }
}
