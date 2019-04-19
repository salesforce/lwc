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

import { TEMPLATE_MODULES_PARAMETER } from './shared/constants';
import { CompilationMetadata } from './shared/types';

export {
    ModuleDependency as TemplateModuleDependency,
    DependencyParameter as TemplateModuleDependencyParameter,
    CompilationMetadata as TemplateMetadata,
    IRElement,
    IRAttributeType,
} from './shared/types';

export { default as State } from './state';

// TODO: perhaps don't allow the configuration from the outside?
export { Config, mergeConfig } from './config';

export function parse(source: string, config?: Config) {
    const options = mergeConfig(config || {});
    const state = new State(source, options);

    return parseTemplate(source, state);
}

export default function compiler(
    source: string,
    config: Config
): {
    code: string;
    warnings: CompilerDiagnostic[];
    metadata: CompilationMetadata;
} {
    const options = mergeConfig(config);
    const state = new State(source, options);

    let code = '';
    const warnings: CompilerDiagnostic[] = [];
    try {
        const parsingResults = parseTemplate(source, state);
        warnings.push(...parsingResults.warnings);

        const hasParsingError = parsingResults.warnings.some(
            warning => warning.level === DiagnosticLevel.Error
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
        metadata: {
            definedSlots: state.slots,
            templateUsedIds: state.ids,
            templateDependencies: state.extendedDependencies,
        },
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
