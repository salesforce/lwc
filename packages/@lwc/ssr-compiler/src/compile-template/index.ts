/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { generate } from 'astring';
import { is, builders as b } from 'estree-toolkit';
import { parse, type Config as TemplateCompilerConfig } from '@lwc/template-compiler';
import { DiagnosticLevel } from '@lwc/errors';
import { esTemplate } from '../estemplate';
import { getStylesheetImports } from '../compile-js/stylesheets';
import { addScopeTokenDeclarations } from '../compile-js/stylesheet-scope-token';
import { transmogrify } from '../transmogrify';
import { optimizeAdjacentYieldStmts } from './shared';
import { templateIrToEsTree } from './ir-to-es';
import type { ExportDefaultDeclaration as EsExportDefaultDeclaration } from 'estree';
import type { CompilationMode } from '@lwc/shared/ssr';

// TODO [#4663]: Render mode mismatch between template and compiler should throw.
const bExportTemplate = esTemplate`
    export default async function* tmpl(
            shadowSlottedContent,
            lightSlottedContent,
            scopedSlottedContent,
            Cmp,
            instance
    ) {
        // Deliberately using let so we can mutate as many times as we want in the same scope.
        // These should be scoped to the "tmpl" function however, to avoid conflicts with other templates.
        let textContentBuffer = '';
        let didBufferTextContent = false;

        // Establishes a contextual relationship between two components for ContextProviders.
        // This variable will typically get overridden (shadowed) within slotted content.
        const contextfulParent = instance;

        const isLightDom = Cmp.renderMode === 'light';
        if (!isLightDom) {
            yield \`<template shadowrootmode="open"\${Cmp.delegatesFocus ? ' shadowrootdelegatesfocus' : ''}>\`
        }
        
        const { stylesheets: staticStylesheets } = Cmp;
        if (defaultStylesheets || defaultScopedStylesheets || staticStylesheets) {
            yield renderStylesheets(
                defaultStylesheets, 
                defaultScopedStylesheets, 
                staticStylesheets,
                stylesheetScopeToken, 
                Cmp, 
                hasScopedStylesheets,
            );
        }

        ${is.statement};

        if (!isLightDom) {
            yield '</template>';
            if (shadowSlottedContent) {
                // instance must be passed in; this is used to establish the contextful relationship
                // between context provider (aka parent component) and context consumer (aka slotted content)
                yield* shadowSlottedContent(contextfulParent);
            }
        }
    }
`<EsExportDefaultDeclaration>;

export default function compileTemplate(
    src: string,
    filename: string,
    options: TemplateCompilerConfig,
    compilationMode: CompilationMode
) {
    const { root, warnings } = parse(src, {
        // `options` is from @lwc/compiler, and may have flags that @lwc/template-compiler doesn't
        // know about, so we must explicitly extract the relevant props.
        name: options.name,
        namespace: options.namespace,
        customRendererConfig: options.customRendererConfig,
        experimentalComputedMemberExpression: options.experimentalComputedMemberExpression,
        experimentalComplexExpressions: options.experimentalComplexExpressions,
        enableDynamicComponents: options.enableDynamicComponents,
        preserveHtmlComments: options.preserveHtmlComments,
        enableStaticContentOptimization: options.enableStaticContentOptimization,
        instrumentation: options.instrumentation,
        apiVersion: options.apiVersion,
        disableSyntheticShadowSupport: options.disableSyntheticShadowSupport,
        // TODO [#3331]: remove usage of lwc:dynamic in 246
        experimentalDynamicDirective: options.experimentalDynamicDirective,
    });
    if (!root || warnings.length) {
        let fatal = !root;
        for (const warning of warnings) {
            // eslint-disable-next-line no-console
            console.error('Cannot compile:', warning.message);
            if (
                warning.level === DiagnosticLevel.Fatal ||
                warning.level === DiagnosticLevel.Error
            ) {
                fatal = true;
            }
        }
        // || !root is just used here to make TypeScript happy
        if (fatal || !root) {
            throw new Error('Template compilation failure; see warnings in the console.');
        }
    }

    const preserveComments = !!root.directives.find(
        (directive) => directive.name === 'PreserveComments'
    )?.value?.value;
    const experimentalComplexExpressions = Boolean(options.experimentalComplexExpressions);

    const { addImport, getImports, statements } = templateIrToEsTree(root!, {
        preserveComments,
        experimentalComplexExpressions,
    });
    addImport(['renderStylesheets', 'hasScopedStaticStylesheets']);
    for (const [imports, source] of getStylesheetImports(filename)) {
        addImport(imports, source);
    }

    const moduleBody = [...getImports(), bExportTemplate(optimizeAdjacentYieldStmts(statements))];
    let program = b.program(moduleBody, 'module');

    addScopeTokenDeclarations(program, filename, options.namespace, options.name);

    if (compilationMode === 'async' || compilationMode === 'sync') {
        program = transmogrify(program, compilationMode);
    }

    return {
        code: generate(program, {}),
    };
}
