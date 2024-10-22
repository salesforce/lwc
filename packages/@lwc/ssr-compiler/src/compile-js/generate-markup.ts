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
    SimpleLiteral,
    SimpleCallExpression,
    Identifier,
    MemberExpression,
} from 'estree';
import type { ComponentMetaState } from './types';

/** Node representing `<something>.render()`. */
type RenderCallExpression = SimpleCallExpression & {
    callee: MemberExpression & { property: Identifier & { name: 'render' } };
};

/** Node representing a string literal. */
type StringLiteral = SimpleLiteral & { value: string };

const bGenerateMarkup = esTemplate`
    export async function* generateMarkup(tagName, props, attrs, slotted) {
        attrs = attrs ?? {};
        ${isNullableOf(is.expressionStatement)};
        const instance = new ${is.identifier}({
            tagName: tagName.toUpperCase(),
        });
        instance[__SYMBOL__SET_INTERNALS](props, __REFLECTED_PROPS__, attrs);
        instance.isConnected = true;
        if (instance.connectedCallback) {
            __mutationTracker.enable(instance);
            instance.connectedCallback();
            __mutationTracker.disable(instance);
        }
        const tmplFn = ${isIdentOrRenderCall} ?? __fallbackTmpl;
        yield \`<\${tagName}\`;
        yield tmplFn.stylesheetScopeTokenHostClass ?? '';
        yield* __renderAttrs(instance, attrs)
        yield '>';
        yield* tmplFn(props, attrs, slotted, ${1}, instance);
        yield \`</\${tagName}>\`;
    }
`<ExportNamedDeclaration>;

const bInsertFallbackTmplImport = esTemplate`
    import {
        fallbackTmpl as __fallbackTmpl,
	mutationTracker as __mutationTracker,
        renderAttrs as __renderAttrs,
        SYMBOL__SET_INTERNALS as __SYMBOL__SET_INTERNALS,
    } from '@lwc/ssr-runtime';
`<ImportDeclaration>;

const bCreateReflectedPropArr = esTemplate`
    const __REFLECTED_PROPS__ = ${is.arrayExpression};
`<ExpressionStatement>;

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
    const reflectedAttrAccessors: Property[] = [];
    for (const propName of reflectedPropNames) {
        reflectedAttrAccessors.push(
            b.property(
                'get',
                b.literal(AriaPropNameToAttrNameMap[propName]),
                b.functionExpression(
                    null,
                    [],
                    b.blockStatement([
                        b.returnStatement(
                            b.callExpression(b.identifier('String'), [
                                b.memberExpression(b.identifier('props'), b.identifier(propName)),
                            ])
                        ),
                    ])
                )
            ),
            b.property(
                'set',
                b.literal(AriaPropNameToAttrNameMap[propName]),
                b.functionExpression(
                    null,
                    [b.identifier('val')],
                    b.blockStatement([
                        b.expressionStatement(
                            b.assignmentExpression(
                                '=',
                                b.memberExpression(b.identifier('props'), b.identifier(propName)),
                                b.identifier('val')
                            )
                        ),
                    ])
                )
            )
        );
    }

    // This mutates the `attrs` object, adding the reflected aria attributes that have been
    // detected. Example:
    //
    //   attrs = {
    //     ...attrs,
    //     get ['aria-checked']() {
    //       return props.ariaChecked;
    //     }
    //   }
    return b.expressionStatement(
        b.assignmentExpression(
            '=',
            b.identifier('attrs'),
            b.objectExpression([b.spreadElement(b.identifier('attrs')), ...reflectedAttrAccessors])
        )
    );
}

/**
 * This builds a generator function `generateMarkup` and adds it to the component JS's
 * compilation output. `generateMarkup` acts as the glue between component JS and its
 * template(s), including:
 *
 *  - managing reflection of attrs & props
 *  - instantiating the component instance
 *  - setting the internal state of that component instance
 *  - invoking component lifecycle methods
 *  - yielding the tag name & attributes
 *  - deferring to the template function for yielding child content
 */
export function addGenerateMarkupExport(
    program: Program,
    state: ComponentMetaState,
    filename: string
) {
    const { hasRenderMethod, tmplExplicitImports } = state;

    const classIdentifier = b.identifier(state.lwcClassName!);
    const renderCall = hasRenderMethod
        ? (b.callExpression(
              b.memberExpression(b.identifier('instance'), b.identifier('render')),
              []
          ) as RenderCallExpression)
        : b.identifier('tmpl');

    if (!tmplExplicitImports) {
        const defaultTmplPath = filename.replace(/\.js$/, '.html');
        program.body.unshift(
            bImportDeclaration(b.identifier('tmpl'), b.literal(defaultTmplPath) as StringLiteral)
        );
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
    program.body.push(bGenerateMarkup(attrsAugmentation, classIdentifier, renderCall));
}
