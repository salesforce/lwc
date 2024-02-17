/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { generate } from 'astring';
import { is, builders as b } from 'estree-toolkit';
import { parse } from '@lwc/template-compiler';
import { esTemplate } from '../estemplate';
import { templateIrToEsTree } from './ir-to-es';
import { optimizeAdjacentYieldStmts } from './shared';

import type {
    Node as EsNode,
    Statement as EsStatement,
    Literal as EsLiteral,
    ExportDefaultDeclaration as EsExportDefaultDeclaration,
} from 'estree';

const isBool = (node: EsNode | null) => is.literal(node) && typeof node.value === 'boolean';

const bExportTemplate = esTemplate<
    EsExportDefaultDeclaration,
    [EsLiteral, EsStatement[], EsLiteral]
>`
    export default async function* tmpl(props, attrs, slotted, Cmp, instance, stylesheets) {
        if (!${isBool} && Cmp.renderMode !== 'light') {
            yield \`<template shadowrootmode="open"\${Cmp.delegatesFocus ? ' shadowrootdelegatesfocus' : ''}>\`
        }

        for (const stylesheet of stylesheets ?? []) {
            // TODO
            const token = null;
            const useActualHostSelector = true;
            const useNativeDirPseudoclass = null;
            yield '<style type="text/css">';
            yield stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
            yield '</style>';
        }

        ${is.statement};

        if (!${isBool} && Cmp.renderMode !== 'light') {
            yield '</template>'
        }
    }
`;

export default function compileTemplate(src: string, _filename: string) {
    const { root, warnings } = parse(src);
    if (!root || warnings.length) {
        for (const warning of warnings) {
            // eslint-disable-next-line no-console
            console.error('Cannot compile:', warning.message);
        }
        throw new Error('Template compilation failure; see warnings in the console.');
    }

    const tmplRenderMode =
        root!.directives.find((directive) => directive.name === 'RenderMode')?.value?.value ??
        'shadow';
    const astShadowModeBool = tmplRenderMode === 'light' ? b.literal(true) : b.literal(false);

    const preserveComments = !!root.directives.find(
        (directive) => directive.name === 'PreserveComments'
    )?.value?.value;

    const { hoisted, statements } = templateIrToEsTree(root!, { preserveComments });

    const moduleBody = [
        ...hoisted,
        bExportTemplate(
            astShadowModeBool,
            optimizeAdjacentYieldStmts(statements),
            astShadowModeBool
        ),
    ];
    const program = b.program(moduleBody, 'module');

    return {
        code: generate(program, {}),
    };
}
