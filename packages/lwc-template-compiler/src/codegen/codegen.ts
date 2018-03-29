import * as t from 'babel-types';
import * as esutils from 'esutils';
import * as toCamelCase from 'camelcase';

type RenderPrimitive =
    | 'iterator'
    | 'flatten'
    | 'element'
    | 'customElement'
    | 'bind'
    | 'text'
    | 'dynamic'
    | 'key';

interface RenderPrimitiveDefinition {
    name: string;
    alias: string;
}

const RENDER_APIS: {
    [primitive in RenderPrimitive]: RenderPrimitiveDefinition
} = {
    iterator: { name: 'i', alias: 'api_iterator' },
    flatten: { name: 'f', alias: 'api_flatten' },
    element: { name: 'h', alias: 'api_element' },
    customElement: { name: 'c', alias: 'api_custom_element' },
    bind: { name: 'b', alias: 'api_bind' },
    text: { name: 't', alias: 'api_text' },
    dynamic: { name: 'd', alias: 'api_dynamic' },
    key: { name: 'k', alias: 'api_key' },
};

const SLOT_ID_PREFIX = 'slot';

export default class CodeGen {
    currentId = 0;

    usedApis: { [name: string]: t.Identifier } = {};
    usedSlots: { [name: string]: t.Identifier } = {};
    memorizedIds: t.Identifier[] = [];

    genElement(
        tagName: string,
        data: t.ObjectExpression,
        children: t.Expression,
    ) {
        return this._renderApiCall(RENDER_APIS.element, [
            t.stringLiteral(tagName),
            data,
            children,
        ]);
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
            return this._renderApiCall(RENDER_APIS.text, [
                t.stringLiteral(value),
            ]);
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

    genFlatten(children: t.Expression[]) {
        return this._renderApiCall(RENDER_APIS.flatten, children);
    }

    genKey(compilerKey: t.NumericLiteral, value: t.Expression) {
        return this._renderApiCall(RENDER_APIS.key, [compilerKey, value]);
    }

    getSlotId(name: string) {
        let slotIdentifier = this.usedSlots[name];

        if (!slotIdentifier) {
            const slotCount = Object.keys(this.usedSlots).length;
            slotIdentifier = t.identifier(SLOT_ID_PREFIX + slotCount);

            this.usedSlots[name] = slotIdentifier;
        }

        return slotIdentifier;
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
