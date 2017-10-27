import State from './state';
import { mergeConfig, Config } from './config';

import parse from './parser';
import generate from './codegen';

import { CompilationMetadata, CompilationWarning } from './shared/types';

export default function compiler(
    source: string,
    config: Config,
): {
    code: string;
    warnings: CompilationWarning[];
    metadata: CompilationMetadata;
} {
    const options = mergeConfig(config);
    const state = new State(source, options);

    let code = '';
    const warnings: CompilationWarning[] = [];

    try {
        const parsingResults = parse(source, state);
        warnings.push(...parsingResults.warnings);

        const hasParsingError = parsingResults.warnings.some(
            warning => warning.level === 'error',
        );

        if (!hasParsingError && parsingResults.root) {
            const output = generate(parsingResults.root, state);
            code = output.code;
        }
    } catch (error) {
        warnings.push({
            level: 'error',
            message: `Unexpected compilation error: ${error.message}`,
            start: 0,
            length: 0,
        });
    }

    return {
        code,
        warnings,
        metadata: {
            definedSlots: state.slots,
            templateUsedIds: state.ids,
            templateDependencies: state.dependencies,
        },
    };
}
