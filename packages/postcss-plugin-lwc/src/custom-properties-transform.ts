import { Declaration } from "postcss";

import { VarTransformer } from "./config";

const VAR_FUNC_REGEX = /(^|[^\w-])var\(/;
const VAR_ARGUMENTS_REGEX = /[\f\n\r\t ]*([\w-]+)(?:[\f\n\r\t ]*,[\f\n\r\t ]*([\W\w]+))?/;

function indexOfVarEnd(value: string, start: number): number {
    let i = start;
    let nesting = 0;

    while (i < value.length) {
        const ch = value.charAt(i);

        if (ch === '(') {
            nesting += 1;
        }

        if (ch === ')') {
            if (nesting === 0) {
                return i;
            } else {
                nesting -= 1;
            }
        }

        i += 1;
    }

    return -1;
}

function transform(decl: Declaration, transformer: VarTransformer, value: string): string {
    const varMatch = VAR_FUNC_REGEX.exec(value);

    if (varMatch === null) {
        return value;
    }

    const [, prefix] = varMatch;

    const varStart = varMatch.index;
    const varEnd = indexOfVarEnd(value, varStart + varMatch[0].length);

    if (varEnd === -1) {
        throw decl.error(
            `Missing closing ")" for "${value.slice(varStart)}"`
        );
    }

    const varFunction = value.slice(varStart, varEnd + 1);
    const varArguments = value.slice(varStart + varMatch[0].length, varEnd);
    const varArgumentsMatch = VAR_ARGUMENTS_REGEX.exec(varArguments);

    if (varArgumentsMatch === null) {
        throw decl.error(
            `Invalid var function signature for "${varFunction}"`
        );
    }

    const [, name, fallback] = varArgumentsMatch;
    const transformationResult = transformer(name, fallback);

    if (typeof transformationResult !== 'string') {
        throw new TypeError(`Expected a string, but received instead "${typeof transformationResult}"`);
    }

    const processed = value.slice(0, varStart);
    const rest = transform(decl, transformer, transformationResult + value.slice(varEnd + 1));

    return processed + prefix + rest;
}

export default function(decl: Declaration, transformer: VarTransformer) {
    const { value } = decl;
    decl.value = transform(decl, transformer, value);
}
