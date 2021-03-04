/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as esutils from 'esutils';

import * as t from '../shared/estree';
import { toPropertyName } from '../shared/utils';

type RenderPrimitive =
    | 'iterator'
    | 'flatten'
    | 'element'
    | 'slot'
    | 'customElement'
    | 'bind'
    | 'text'
    | 'dynamic'
    | 'dynamicCtor'
    | 'key'
    | 'tabindex'
    | 'scopedId'
    | 'scopedFragId'
    | 'comment';

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
    dynamic: { name: 'd', alias: 'api_dynamic' },
    key: { name: 'k', alias: 'api_key' },
    tabindex: { name: 'ti', alias: 'api_tab_index' },
    scopedId: { name: 'gid', alias: 'api_scoped_id' },
    scopedFragId: { name: 'fid', alias: 'api_scoped_frag_id' },
    comment: { name: 'co', alias: 'api_comment' },
};

export default class CodeGen {
    currentId = 0;
    currentKey = 0;

    usedApis: { [name: string]: t.Identifier } = {};
    usedSlots: { [name: string]: t.Identifier } = {};
    memorizedIds: t.Identifier[] = [];

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

    genText(value: string | t.Expression): t.Expression {
        if (typeof value === 'string') {
            return this._renderApiCall(RENDER_APIS.text, [t.literal(value)]);
        } else {
            return this._renderApiCall(RENDER_APIS.dynamic, [value]);
        }
    }

    genComment(value: string | t.Expression): t.Expression {
        if (typeof value === 'string') {
            return this._renderApiCall(RENDER_APIS.comment, [t.literal(value)]);
        } else {
            return this._renderApiCall(RENDER_APIS.comment, [value]);
        }
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
        const id = this._genUniqueIdentifier('_m');
        this.memorizedIds.push(id);

        return id;
    }

    genBooleanAttributeExpr(bindExpr: t.Expression) {
        return t.conditionalExpression(bindExpr, t.literal(''), t.literal(null));
    }

    private _genUniqueIdentifier(name: string) {
        const id = this.currentId++;
        const prefix = this._toValidIdentifier(name);

        return t.identifier(prefix + id);
    }

    private _toValidIdentifier(name: string) {
        return esutils.keyword.isIdentifierES6(name) ? name : toPropertyName(name);
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
