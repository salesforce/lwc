import State from './state';
import { mergeConfig, Config } from './config';

import parse from './parser';
import generate from './codegen';

import { TEMPLATE_MODULES_PARAMETER } from './shared/constants';
import { CompilationMetadata, CompilationWarning } from './shared/types';

export {
    ModuleDependency as TemplateModuleDependency,
    DependencyParameter as TemplateModuleDependencyParameter
} from './shared/types';

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
// TODO ERROR CODES:
    try {
        const parsingResults = parse(source, state);
        warnings.push(...parsingResults.warnings);

        const hasParsingError = parsingResults.warnings.some(
            warning => warning.level === 'error',
        );

        if (!hasParsingError && parsingResults.root) {
            const output = generate(parsingResults.root, state, options);
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
            templateDependencies: state.extendedDependencies,
        },
    };
}

export function compileToFunction(source: string): Function {
    const options = mergeConfig({});
    options.format = 'function';

    const state = new State(source, options);

    const parsingResults = parse(source, state);

    for (const { message, level } of parsingResults.warnings) {
        if (level === 'error') {
            throw new Error(message);
        } else if (level === 'warning') {
            /* tslint:disable-next-line:no-console */
            console.warn(message);
        } else {
            /* tslint:disable-next-line:no-console */
            console.log(message);
        }
    }

    if (!parsingResults.root) {
        throw new Error(`Invalid template`);
    }

    const { code } = generate(parsingResults.root, state, options);
    return new Function(TEMPLATE_MODULES_PARAMETER, code);
}
