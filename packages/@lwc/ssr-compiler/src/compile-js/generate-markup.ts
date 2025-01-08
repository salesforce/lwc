/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { parse as pathParse } from 'node:path';
import { is, builders as b } from 'estree-toolkit';
import { esTemplate } from '../estemplate';
import { bImportDeclaration } from '../estree/builders';
import { bWireAdaptersPlumbing } from './wire';

import type { Program, Statement, IfStatement } from 'estree';
import type { ComponentMetaState } from './types';

const bGenerateMarkup = esTemplate`
    // These variables may mix with component-authored variables, so should be reasonably unique
    const __lwcPublicFields__ = new Set(${/*public fields*/ is.arrayExpression});
    const __lwcPrivateFields__ = new Set(${/*private fields*/ is.arrayExpression});

    async function* generateMarkup(
            tagName, 
            props, 
            attrs, 
            shadowSlottedContent,
            lightSlottedContent, 
            parent, 
            scopeToken,
            contextfulParent
    ) {
        tagName = tagName ?? ${/*component tag name*/ is.literal};
        attrs = attrs ?? Object.create(null);
        props = props ?? Object.create(null);
        const instance = new ${/* Component class */ is.identifier}({
            tagName: tagName.toUpperCase(),
        });

        __establishContextfulRelationship(contextfulParent, instance);
        ${/*connect wire*/ is.statement}

        instance[__SYMBOL__SET_INTERNALS](
            props,
            attrs,
            __lwcPublicFields__,
            __lwcPrivateFields__,
        );
        instance.isConnected = true;
        if (instance.connectedCallback) {
            __mutationTracker.enable(instance);
            instance.connectedCallback();
            __mutationTracker.disable(instance);
        }
        // If a render() function is defined on the class or any of its superclasses, then that takes priority.
        // Next, if the class or any of its superclasses has an implicitly-associated template, then that takes
        // second priority (e.g. a foo.html file alongside a foo.js file). Finally, there is a fallback empty template.
        const tmplFn = instance.render?.() ?? ${/*component class*/ 3}[__SYMBOL__DEFAULT_TEMPLATE] ?? __fallbackTmpl;
        yield \`<\${tagName}\`;

        const hostHasScopedStylesheets =
            tmplFn.hasScopedStylesheets ||
            hasScopedStaticStylesheets(${/*component class*/ 3});
        const hostScopeToken = hostHasScopedStylesheets ? tmplFn.stylesheetScopeToken + "-host" : undefined;

        yield* __renderAttrs(instance, attrs, hostScopeToken, scopeToken);
        yield '>';
        yield* tmplFn(
            shadowSlottedContent,
            lightSlottedContent,
            ${/*component class*/ 3},
            instance
        );
        yield \`</\${tagName}>\`;
    }
    ${/* component class */ 3}[__SYMBOL__GENERATE_MARKUP] = generateMarkup;
`<[Statement]>;

const bExposeTemplate = esTemplate`
    if (${/*template*/ is.identifier}) {
        ${/* component class */ is.identifier}[__SYMBOL__DEFAULT_TEMPLATE] = ${/*template*/ 0}
    }
`<IfStatement>;

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
export function addGenerateMarkupFunction(
    program: Program,
    state: ComponentMetaState,
    tagName: string,
    filename: string
) {
    const { privateFields, publicFields, tmplExplicitImports } = state;

    // The default tag name represents the component name that's passed to the transformer.
    // This is needed to generate markup for dynamic components which are invoked through
    // the generateMarkup function on the constructor.
    // At the time of generation, the invoker does not have reference to its tag name to pass as an argument.
    const defaultTagName = b.literal(tagName);
    const classIdentifier = b.identifier(state.lwcClassName!);

    let exposeTemplateBlock: IfStatement | null = null;
    if (!tmplExplicitImports) {
        const defaultTmplPath = `./${pathParse(filename).name}.html`;
        const tmplVar = b.identifier('tmpl');
        program.body.unshift(bImportDeclaration({ default: tmplVar.name }, defaultTmplPath));
        program.body.unshift(
            bImportDeclaration({ SYMBOL__DEFAULT_TEMPLATE: '__SYMBOL__DEFAULT_TEMPLATE' })
        );
        exposeTemplateBlock = bExposeTemplate(tmplVar, classIdentifier);
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
            b.arrayExpression(publicFields.map(b.literal)),
            b.arrayExpression(privateFields.map(b.literal)),
            defaultTagName,
            classIdentifier,
            connectWireAdapterCode
        )
    );

    if (exposeTemplateBlock) {
        program.body.push(exposeTemplateBlock);
    }
}
