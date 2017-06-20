import generate from './codegen';
import parse from './parser';

import {
    CompilationOptions,
    CompilationMetadata,
    CompilationWarning,
} from './shared/types';

const DEFAULT_CONFIG = {
    computedMemberExpression: false,
};

export let config: CompilationOptions = DEFAULT_CONFIG;

export default function compiler(source: string, compilationOptions: CompilationOptions = {}) {
    config = {
        ...DEFAULT_CONFIG,
        ...compilationOptions,
    };

    let code = '';
    let metadata: CompilationMetadata | undefined;
    const warnings: CompilationWarning[] = [];

    try {
        const parsingResults = parse(source);
        metadata = parsingResults.metadata;
        warnings.push(...parsingResults.warnings);

        const hasParsingError = parsingResults.warnings.some((warning) => (
            warning.level === 'error'
        ));

        if (!hasParsingError && parsingResults.root) {
            const output = generate(parsingResults.root, metadata);
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
        metadata,
    };
}
