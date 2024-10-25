/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { parse as pathParse } from 'node:path';
import { is, builders as b } from 'estree-toolkit';
import { esTemplate } from '../estemplate';
import { isIdentOrRenderCall } from '../estree/validators';
import { bImportDeclaration } from '../estree/builders';

import type {
    ExportNamedDeclaration,
    Program,
    ImportDeclaration,
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
        const instance = new ${is.identifier}({
            tagName: tagName.toUpperCase(),
        });
        instance[__SYMBOL__SET_INTERNALS](props, attrs);
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
        yield* tmplFn(props, attrs, slotted, ${0}, instance);
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
        const defaultTmplPath = `./${pathParse(filename).name}.html`;
        program.body.unshift(
            bImportDeclaration(b.identifier('tmpl'), b.literal(defaultTmplPath) as StringLiteral)
        );
    }

    program.body.unshift(bInsertFallbackTmplImport());
    program.body.push(bGenerateMarkup(classIdentifier, renderCall));
}
