import { Declaration } from 'postcss';

import { VarTransformer } from '../config';

// Match on " var("
const VAR_FUNC_REGEX = /(^|[^\w-])var\(/;

// Match on "<property-name>" and "<property-name>, <fallback-value>"
const VAR_ARGUMENTS_REGEX = /[\f\n\r\t ]*([\w-]+)(?:[\f\n\r\t ]*,[\f\n\r\t ]*([\W\w]+))?/;

/**
 * Returns the index of the matching closing parenthesis. If no matching parenthesis is found
 * the method returns -1.
 */
function indexOfMatchingParenthesis(value: string, start: number): number {
    let i = start;

    // Counter keeping track of the function call nesting count.
    let nesting = 0;

    while (i < value.length) {
        const ch = value.charAt(i);

        // When the function arguments contains an open parenthesis, it means that the function
        // arguments contains nested function calls.
        // For example: `var(--min-width, calc(100% - 80px));`
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

    // Handle case where no matching closing parenthesis has been found.
    return -1;
}

function transform(decl: Declaration, transformer: VarTransformer, value: string): string {
    const varMatch = VAR_FUNC_REGEX.exec(value);

    // Early exit of the value doesn't contain any `var` function call
    if (varMatch === null) {
        return value;
    }

    const [, prefix] = varMatch;

    // Extract start and end location of the function call
    const varStart = varMatch.index;
    const varEnd = indexOfMatchingParenthesis(value, varStart + varMatch[0].length);

    if (varEnd === -1) {
        throw decl.error(
            `Missing closing ")" for "${value.slice(varStart)}"`
        );
    }

    // Extract function call arguments
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

    // Recursively calling transform to processed the remaining `var` function calls.
    const processed = value.slice(0, varStart);
    const toProcess = transformationResult + value.slice(varEnd + 1);
    const tail = transform(decl, transformer, toProcess);

    return processed + prefix + tail;
}

export default function(decl: Declaration, transformer: VarTransformer) {
    const { value } = decl;
    decl.value = transform(decl, transformer, value);
}
