/*
 * Copyright (c) 2024, Salesforce, Inc.
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

import { Root, TemplateCompileResult, TemplateParseResult } from './shared/types';

export * from './shared/types';
export { CustomRendererConfig, CustomRendererElementConfig } from './shared/renderer-hooks';
export { Config } from './config';
export { toPropertyName } from './shared/utils';
export { kebabcaseToCamelcase } from './shared/naming';

/**
 * Parses HTML markup into an AST
 * @param source HTML markup to parse
 * @param config HTML template compilation config
 * @returns Object containing the AST
 */
export function parse(source: string, config: Config = {}): TemplateParseResult {
    const options = normalizeConfig(config);
    // The file name is never used in this function, defaulting it to an empty string.
    const state = new State(options, '');
    return parseTemplate(source, state);
}

// Export as a named export as well for easier importing in certain environments (e.g. Jest)
export { compile };

/**
 * Compiles a LWC template to JavaScript source code consumable by the engine.
 * @param source HTML markup to compile
 * @param filename HTML filename
 * @param config HTML template compilation config
 * @returns Object containing the compiled code and any warnings that occurred.
 */
export default function compile(
    source: string,
    filename: string,
    config: Config
): TemplateCompileResult {
    const options = normalizeConfig(config);
    // Note the file name is required to generate implicit css imports and style tokens.
    // It is not part of the config because all values in the config are optional by convention.
    const state = new State(options, filename);

    let code = '';
    let root: Root | undefined;
    const warnings: CompilerDiagnostic[] = [];

    try {
        const parsingResults = parseTemplate(source, state);
        warnings.push(...parsingResults.warnings);

        const hasParsingError = parsingResults.warnings.some(
            (warning) => warning.level === DiagnosticLevel.Error
        );

        if (!hasParsingError && parsingResults.root) {
            code = generate(parsingResults.root, state);
            root = parsingResults.root;
        }
    } catch (error) {
        const diagnostic = normalizeToDiagnostic(ParserDiagnostics.GENERIC_PARSING_ERROR, error);
        diagnostic.message = `Unexpected compilation error: ${diagnostic.message}`;
        warnings.push(diagnostic);
    }

    const {
        scopeTokens: { cssScopeTokens },
    } = state;

    return {
        code,
        root,
        warnings,
        cssScopeTokens,
    };
}
