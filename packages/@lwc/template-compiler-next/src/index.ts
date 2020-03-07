import { parseTemplate } from './parser/template';
import { generateTemplate } from './codegen/template';

import { CompilerConfig, CompilerOutput } from './types';

export function compile(str: string, config: CompilerConfig = {}): CompilerOutput {
    const root = parseTemplate(str, config);
    const code = generateTemplate(root);

    return {
        code,
        ast: root,
        warnings: [],
    };
}
