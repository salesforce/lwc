/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is, builders as b } from 'estree-toolkit';
import { AriaPropNameToAttrNameMap } from '@lwc/shared';
import { esTemplate } from '../estemplate';
import { isIdentOrRenderCall, isNullableOf } from '../estree/validators';
import { bImportDeclaration } from '../estree/builders';

import type {
    ExportNamedDeclaration,
    ExpressionStatement,
    Program,
    ImportDeclaration,
    Property,
} from 'estree';
import type { ComponentMetaState } from './types';

const isNullableExpressionStatement = isNullableOf(is.expressionStatement);

const bGenerateMarkup = esTemplate<ExportNamedDeclaration>`
    export async function* generateMarkup(tagName, props, attrs, slotted) {
        attrs = attrs ?? {};
        ${isNullableExpressionStatement};
        const instance = new ${is.identifier}({
            tagName: tagName.toUpperCase(),
        });
        instance.__internal__setState(props, __REFLECTED_PROPS__, attrs);
        instance.isConnected = true;
        instance.connectedCallback?.();
        yield \`<\${tagName}\`;
        yield *__renderAttrs(attrs)
        yield '>';
        const tmplFn = ${isIdentOrRenderCall} ?? __fallbackTmpl;
        yield* tmplFn(props, attrs, slotted, ${is.identifier}, instance, defaultStylesheets);
        yield \`</\${tagName}>\`;
    }
`;

const bInsertFallbackTmplImport = esTemplate<ImportDeclaration>`
    import { fallbackTmpl as __fallbackTmpl, renderAttrs as __renderAttrs } from '@lwc/ssr-runtime';
`;

const bCreateReflectedPropArr = esTemplate<ExpressionStatement>`
    const __REFLECTED_PROPS__ = ${is.arrayExpression};
`;

function bReflectedAttrsObj(reflectedPropNames: (keyof typeof AriaPropNameToAttrNameMap)[]) {
    // This will build getter properties for each reflected property. It'll look
    // something like this:
    //
    //   get ['aria-checked']() {
    //      return props.ariaChecked;
    //   }
    //
    // The props object will be kept up-to-date with any new values set on the corresponding
    // property name in the component instance.
    const reflectedAttrGetters: Property[] = reflectedPropNames.map((propName) =>
        b.property(
            'get',
            b.literal(AriaPropNameToAttrNameMap[propName]),
            b.functionExpression(
                null,
                [],
                b.blockStatement([
                    b.returnStatement(
                        b.memberExpression(b.identifier('props'), b.identifier(propName))
                    ),
                ])
            )
        )
    );

    // attrs = {
    //   ...attrs,
    //   get ['aria-checked']() {
    //     return props.ariaChecked;
    //   }
    // }
    return b.expressionStatement(
        b.assignmentExpression(
            '=',
            b.identifier('attrs'),
            b.objectExpression([b.spreadElement(b.identifier('attrs')), ...reflectedAttrGetters])
        )
    );
}

export function addGenerateMarkupExport(
    program: Program,
    state: ComponentMetaState,
    filename: string
) {
    const { hasRenderMethod, tmplExplicitImports } = state;

    const classIdentifier = b.identifier(state.lwcClassName!);
    const renderCall = hasRenderMethod
        ? b.callExpression(b.memberExpression(b.identifier('instance'), b.identifier('render')), [])
        : b.identifier('tmpl');

    if (!tmplExplicitImports) {
        const defaultTmplPath = filename.replace(/\.js$/, '.html');
        program.body.unshift(bImportDeclaration(b.identifier('tmpl'), b.literal(defaultTmplPath)));
    }

    let attrsAugmentation: ExpressionStatement | null = null;
    if (state.reflectedPropsInPlay.size) {
        attrsAugmentation = bReflectedAttrsObj([...state.reflectedPropsInPlay]);
    }
    const reflectedPropArr = b.arrayExpression(
        [...state.reflectedPropsInPlay].map((propName) => b.literal(propName))
    );

    program.body.unshift(bInsertFallbackTmplImport());
    program.body.push(bCreateReflectedPropArr(reflectedPropArr));
    program.body.push(
        bGenerateMarkup(attrsAugmentation, classIdentifier, renderCall, classIdentifier)
    );
}
