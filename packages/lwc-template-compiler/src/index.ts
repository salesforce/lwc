import {
    CompilerDiagnostic,
    TemplateErrors,
    Level,
    convertDiagnosticToError,
    convertErrorToDiagnostic,
    generateCompilerError
} from 'lwc-errors';

import State from './state';
import { mergeConfig, Config } from './config';

import parse from './parser';
import generate from './codegen';

import { TEMPLATE_MODULES_PARAMETER } from './shared/constants';
import { CompilationMetadata } from './shared/types';

export {
    ModuleDependency as TemplateModuleDependency,
    DependencyParameter as TemplateModuleDependencyParameter
} from './shared/types';

export default function compiler(
    source: string,
    config: Config,
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
        const parsingResults = parse(source, state);
        warnings.push(...parsingResults.warnings);

        const hasParsingError = parsingResults.warnings.some(
            warning => warning.level === Level.Error,
        );

        if (!hasParsingError && parsingResults.root) {
            const output = generate(parsingResults.root, state, options);
            code = output.code;
        }
    } catch (error) {
        const diagnostic = convertErrorToDiagnostic(error);
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

    const parsingResults = parse(source, state);

    for (const warning of parsingResults.warnings) {
        if (warning.level === Level.Error) {
            throw convertDiagnosticToError(warning);
        } else if (warning.level === Level.Warning) {
            /* tslint:disable-next-line:no-console */
            console.warn(warning.message);
        } else {
            /* tslint:disable-next-line:no-console */
            console.log(warning.message);
        }
    }

    if (!parsingResults.root) {
        throw generateCompilerError(TemplateErrors.INVALID_TEMPLATE);
    }

    const { code } = generate(parsingResults.root, state, options);
    return new Function(TEMPLATE_MODULES_PARAMETER, code);
}
