/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    CompilerDiagnostic,
    CompilerError,
    TemplateErrors,
    DiagnosticLevel,
    generateCompilerError,
    normalizeToDiagnostic,
    ParserDiagnostics,
} from '@lwc/errors';

import State from './state';
import { mergeConfig, Config } from './config';

import parseTemplate from './parser';
import generate from './codegen';

import { TemplateCompileResult, TemplateParseResult } from './shared/types';
import { TEMPLATE_MODULES_PARAMETER } from './shared/constants';

export { IRElement } from './shared/types';
export { Config } from './config';

export function parse(source: string, config?: Config): TemplateParseResult {
    const options = mergeConfig(config || {});
    const state = new State(source, options);
    return parseTemplate(source, state);
}

export default function compile(source: string, config: Config): TemplateCompileResult {
    const options = mergeConfig(config);
    const state = new State(source, options);

    let code = '';
    const warnings: CompilerDiagnostic[] = [];
    try {
        const parsingResults = parseTemplate(source, state);
        warnings.push(...parsingResults.warnings);

        const hasParsingError = parsingResults.warnings.some(
            (warning) => warning.level === DiagnosticLevel.Error
        );

        if (!hasParsingError && parsingResults.root) {
            const output = generate(parsingResults.root, state);
            code = output.code;
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
export function compileToFunction(source: string): Function {
    const options = mergeConfig({});
    options.format = 'function';

    const state = new State(source, options);

    const parsingResults = parseTemplate(source, state);

    for (const warning of parsingResults.warnings) {
        if (warning.level === DiagnosticLevel.Error) {
            throw CompilerError.from(warning);
        } else if (warning.level === DiagnosticLevel.Warning) {
            /* eslint-disable-next-line no-console */
            console.warn(warning.message);
        } else {
            /* eslint-disable-next-line no-console */
            console.log(warning.message);
        }
    }

    if (!parsingResults.root) {
        throw generateCompilerError(TemplateErrors.INVALID_TEMPLATE);
    }

    const { code } = generate(parsingResults.root, state);
    return new Function(TEMPLATE_MODULES_PARAMETER, code);
}
