import { Declaration } from 'postcss';
import balanced from 'balanced-match';
import { CSSTransformErrors, invariant } from 'lwc-errors';

import { VarTransformer } from '../config';
import { generateErrorFromDeclaration } from '../helpers/errors';

// Match on " var("
const VAR_FUNC_REGEX = /(^|[^\w-])var\(/;

// Match on "<property-name>" and "<property-name>, <fallback-value>"
const VAR_ARGUMENTS_REGEX = /[\f\n\r\t ]*([\w-]+)(?:[\f\n\r\t ]*,[\f\n\r\t ]*([\W\w]+))?/;

function transform(decl: Declaration, transformer: VarTransformer, value: string): string {
    const varMatch = VAR_FUNC_REGEX.exec(value);

    // Early exit of the value doesn't contain any `var` function call
    if (varMatch === null) {
        return value;
    }

    // Prefix is either an empty string or a whitespace depending if the `var()` function is
    // in the middle of the value or not. We need to preserve this whitespace in the final
    // output.
    const prefixWhitespace = varMatch[1];
    const start = varMatch.index;

    const parenthesisMatch = balanced('(', ')', value.slice(start));
    if (!parenthesisMatch) {
        throw generateErrorFromDeclaration(decl, {
            errorInfo: CSSTransformErrors.CUSTOM_PROPERTY_MISSING_CLOSING_PARENS,
            messageArgs: [value]
        });
    }

    // Extract the `var()` function arguments
    const varArgumentsMatch = VAR_ARGUMENTS_REGEX.exec(parenthesisMatch.body);
    if (varArgumentsMatch === null) {
        throw generateErrorFromDeclaration(decl, {
            errorInfo: CSSTransformErrors.CUSTOM_PROPERTY_INVALID_VAR_FUNC_SIGNATURE,
            messageArgs: [value]
        });
    }

    const [, name, fallback] = varArgumentsMatch;
    const res = transformer(name, fallback);

    invariant(typeof res === 'string', CSSTransformErrors.CUSTOM_PROPERTY_STRING_EXPECTED, [typeof res]);

    // Recursively calling transform to processed the remaining `var` function calls.
    const head = value.slice(0, varMatch.index);
    const tail = transform(decl, transformer, res + parenthesisMatch.post);

    return head + prefixWhitespace + tail;
}

export default function(decl: Declaration, transformer: VarTransformer) {
    const { value } = decl;
    decl.value = transform(decl, transformer, value);
}
