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
import { optimizeAdjacentYieldStmts } from './shared';
import { templateIrToEsTree } from './ir-to-es';
import type {
    Node as EsNode,
    ExportDefaultDeclaration as EsExportDefaultDeclaration,
    ImportDeclaration as EsImportDeclaration,
    SimpleLiteral,
} from 'estree';

type Nullable<T> = T | null | undefined;
type BooleanLiteral = SimpleLiteral & { value: boolean };

const isBool = (node: Nullable<EsNode>): node is BooleanLiteral => {
    return is.literal(node) && typeof node.value === 'boolean';
};

const bStyleValidationImport = esTemplate`
    import { validateStyleTextContents } from '@lwc/ssr-runtime';
`<EsImportDeclaration>;

const bExportTemplate = esTemplate`
    export default async function* tmpl(props, attrs, slottedContent, Cmp, instance) {
        if (!${isBool} && Cmp.renderMode !== 'light') {
            yield \`<template shadowrootmode="open"\${Cmp.delegatesFocus ? ' shadowrootdelegatesfocus' : ''}>\`
        }
        
        if (defaultStylesheets || defaultScopedStylesheets) {
            // Flatten all stylesheets infinitely and concatenate
            const stylesheets = [defaultStylesheets, defaultScopedStylesheets].filter(Boolean).flat(Infinity);
    
            for (const stylesheet of stylesheets) {
                const token = stylesheet.$scoped$ ? stylesheetScopeToken : undefined;
                const useActualHostSelector = !stylesheet.$scoped$ || Cmp.renderMode !== 'light';
                const useNativeDirPseudoclass = true;
                yield '<style' + stylesheetScopeTokenClass + ' type="text/css">';
                const styleContents = stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
                validateStyleTextContents(styleContents);
                yield styleContents;
                yield '</style>';
            }
        }

        ${is.statement};

        if (!${0} && Cmp.renderMode !== 'light') {
            yield '</template>';
        }

        if (slottedContent) {
            yield* slottedContent();
        }
    }
`<EsExportDefaultDeclaration>;

export default function compileTemplate(
    src: string,
    filename: string,
    options: TemplateCompilerConfig
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

    const tmplRenderMode =
        root.directives.find((directive) => directive.name === 'RenderMode')?.value?.value ??
        'shadow';
    const astShadowModeBool = b.literal(tmplRenderMode === 'light') as BooleanLiteral;

    const preserveComments = !!root.directives.find(
        (directive) => directive.name === 'PreserveComments'
    )?.value?.value;

    const { hoisted, statements } = templateIrToEsTree(root!, { preserveComments });

    const moduleBody = [
        ...hoisted,
        bStyleValidationImport(),
        bExportTemplate(astShadowModeBool, optimizeAdjacentYieldStmts(statements)),
    ];
    const program = b.program(moduleBody, 'module');

    addScopeTokenDeclarations(program, filename, options.namespace, options.name);

    const stylesheetImports = getStylesheetImports(filename);
    program.body.unshift(...stylesheetImports);

    return {
        code: generate(program, {}),
    };
}
