/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    CompilerDiagnostic,
    DiagnosticLevel,
    normalizeToDiagnostic,
    ParserDiagnostics,
} from '@lwc/errors';

import State from './state';
import { normalizeConfig, Config } from './config';

import parseTemplate from './parser';
import generate from './codegen';

import { TemplateCompileResult, TemplateParseResult } from './shared/types';

export * from './shared/types';
export { Config } from './config';

export function parse(source: string, config: Config = {}): TemplateParseResult {
    const options = normalizeConfig(config);
    const state = new State(options);
    return parseTemplate(source, state);
}

export default function compile(source: string, config: Config): TemplateCompileResult {
    const options = normalizeConfig(config);
    const state = new State(options);

    let code = '';
    const warnings: CompilerDiagnostic[] = [];
    try {
        const parsingResults = parseTemplate(source, state);
        warnings.push(...parsingResults.warnings);

        const hasParsingError = parsingResults.warnings.some(
            (warning) => warning.level === DiagnosticLevel.Error
        );

        if (!hasParsingError && parsingResults.root) {
            code = generate(parsingResults.root, options);
        }
    } catch (error) {
        const diagnostic = normalizeToDiagnostic(ParserDiagnostics.GENERIC_PARSING_ERROR, error);
        diagnostic.message = `Unexpected compilation error: ${diagnostic.message}`;
        warnings.push(diagnostic);
    }

    return {
        code,
        warnings,
    };
}
