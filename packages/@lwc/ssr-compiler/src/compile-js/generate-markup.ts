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
import { bWireAdaptersPlumbing } from './decorators/wire';
import type { CompilationMode } from '@lwc/shared';

import type { Program } from 'estree';
import type { ComponentMetaState } from './types';

const bSetStaticInternals = esTemplate`__setStaticInternals(
${/* Component */ is.identifier},
${/* tag name */ is.literal},
${/* public props */ is.arrayExpression},
${/* wire adapters */ is.expression} ?? null,
${/* compilation mode */ is.literal},
${/* default template */ is.identifier}
)`;

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
    filename: string,
    compilationMode: CompilationMode
) {
    const { publicProperties } = state;

    // The default tag name represents the component name that's passed to the transformer.
    // This is needed to generate markup for dynamic components which are invoked through
    // the generateMarkup function on the constructor.
    // At the time of generation, the invoker does not have reference to its tag name to pass as an argument.
    const defaultTagName = b.literal(tagName);
    // Use the default export identifier if available; fall back to the class name.
    const exportedIdentifier = b.identifier((state.lwcDefaultExportName ?? state.lwcClassName)!);

    const defaultTmplPath = `./${pathParse(filename).name}.html`;
    const tmplVar = b.identifier('__lwcTmpl');
    program.body.unshift(bImportDeclaration({ default: tmplVar.name }, defaultTmplPath));

    // If no wire adapters are detected on the component, we don't bother injecting the wire-related code.
    const wireAdapterInfo =
        state.wireAdapters.length > 0 ? bWireAdaptersPlumbing(state.wireAdapters) : b.literal(null);

    program.body.unshift(
        bImportDeclaration({
            setStaticInternals: '__setStaticInternals',
        })
    );
    program.body.push(
        bSetStaticInternals(
            exportedIdentifier,
            defaultTagName,
            b.arrayExpression([...publicProperties.keys()].map(b.literal)),
            wireAdapterInfo,
            b.literal(compilationMode),
            tmplVar
        )
    );
}
