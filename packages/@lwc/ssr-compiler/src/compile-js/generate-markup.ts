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
import { bWireAdaptersPlumbing } from './wire';

import type {
    ExportNamedDeclaration,
    Program,
    SimpleCallExpression,
    Identifier,
    MemberExpression,
    Statement,
    ExpressionStatement,
} from 'estree';
import type { ComponentMetaState } from './types';

/** Node representing `<something>.render()`. */
type RenderCallExpression = SimpleCallExpression & {
    callee: MemberExpression & { property: Identifier & { name: 'render' } };
};

const bGenerateMarkup = esTemplate`
    export async function* generateMarkup(tagName, props, attrs, slotted, parent, scopeToken) {
        tagName = tagName ?? ${/*component tag name*/ is.literal};
        attrs = attrs ?? Object.create(null);
        props = props ?? Object.create(null);
        props = __filterProperties(
            props,
            ${/*public fields*/ is.arrayExpression},
            ${/*private fields*/ is.arrayExpression},
        );
        const instance = new ${/* Component class */ is.identifier}({
            tagName: tagName.toUpperCase(),
        });

        __establishContextfulRelationship(parent, instance);
        ${/*connect wire*/ is.statement}

        instance[__SYMBOL__SET_INTERNALS](props, attrs);
        instance.isConnected = true;
        if (instance.connectedCallback) {
            __mutationTracker.enable(instance);
            instance.connectedCallback();
            __mutationTracker.disable(instance);
        }
        const tmplFn = ${isIdentOrRenderCall} ?? __fallbackTmpl;
        yield \`<\${tagName}\`;

        const hostHasScopedStylesheets =
            tmplFn.hasScopedStylesheets ||
            hasScopedStaticStylesheets(${/*component class*/ 3});
        const hostScopeToken = hostHasScopedStylesheets ? tmplFn.stylesheetScopeToken + "-host" : undefined;

        yield* __renderAttrs(instance, attrs, hostScopeToken, scopeToken);
        yield '>';
        yield* tmplFn(props, attrs, slotted, ${/*component class*/ 3}, instance);
        yield \`</\${tagName}>\`;
    }
    ${/* component class */ 3}[__SYMBOL__GENERATE_MARKUP] = generateMarkup;
`<[ExportNamedDeclaration, ExpressionStatement]>;

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
    tagName: string,
    filename: string
) {
    const { hasRenderMethod, privateFields, publicFields, tmplExplicitImports } = state;

    // The default tag name represents the component name that's passed to the transformer.
    // This is needed to generate markup for dynamic components which are invoked through
    // the generateMarkup function on the constructor.
    // At the time of generation, the invoker does not have reference to its tag name to pass as an argument.
    const defaultTagName = b.literal(tagName);
    const classIdentifier = b.identifier(state.lwcClassName!);
    const renderCall = hasRenderMethod
        ? (b.callExpression(
              b.memberExpression(b.identifier('instance'), b.identifier('render')),
              []
          ) as RenderCallExpression)
        : b.identifier('tmpl');

    if (!tmplExplicitImports) {
        const defaultTmplPath = `./${pathParse(filename).name}.html`;
        program.body.unshift(bImportDeclaration({ default: 'tmpl' }, defaultTmplPath));
    }

    // If no wire adapters are detected on the component, we don't bother injecting the wire-related code.
    let connectWireAdapterCode: Statement[] = [];
    if (state.wireAdapters.length) {
        connectWireAdapterCode = bWireAdaptersPlumbing(state.wireAdapters);
        program.body.unshift(bImportDeclaration({ connectContext: '__connectContext' }));
    }

    program.body.unshift(
        bImportDeclaration({
            fallbackTmpl: '__fallbackTmpl',
            filterProperties: '__filterProperties',
            hasScopedStaticStylesheets: undefined,
            mutationTracker: '__mutationTracker',
            renderAttrs: '__renderAttrs',
            SYMBOL__GENERATE_MARKUP: '__SYMBOL__GENERATE_MARKUP',
            SYMBOL__SET_INTERNALS: '__SYMBOL__SET_INTERNALS',
            establishContextfulRelationship: '__establishContextfulRelationship',
        })
    );
    program.body.push(
        ...bGenerateMarkup(
            defaultTagName,
            b.arrayExpression(publicFields.map(b.literal)),
            b.arrayExpression(privateFields.map(b.literal)),
            classIdentifier,
            connectWireAdapterCode,
            renderCall
        )
    );
}
