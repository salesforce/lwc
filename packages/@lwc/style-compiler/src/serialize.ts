/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import postcss, { Result, Declaration } from 'postcss';
import postcssValueParser from 'postcss-value-parser';
import matchAll from 'string.prototype.matchall';
import { KEY__SCOPED_CSS, LWC_VERSION_COMMENT } from '@lwc/shared';
import { Config } from './index';
import { isImportMessage, isVarFunctionMessage } from './utils/message';
import { HOST_ATTRIBUTE, SHADOW_ATTRIBUTE } from './utils/selectors-scoping';
import {
    DIR_ATTRIBUTE_NATIVE_RTL,
    DIR_ATTRIBUTE_NATIVE_LTR,
    DIR_ATTRIBUTE_SYNTHETIC_RTL,
    DIR_ATTRIBUTE_SYNTHETIC_LTR,
} from './utils/dir-pseudoclass';

enum TokenType {
    text = 'text',
    expression = 'expression',
    identifier = 'identifier',
    divider = 'divider',
}
interface Token {
    type: TokenType;
    value: string;
}

// "1400 binary expressions are enough to reach Node.js maximum call stack size"
// https://github.com/salesforce/lwc/issues/1726
// The vast majority of stylesheet functions are much less than this, so we can set the limit lower
// to play it safe.
const BINARY_EXPRESSION_LIMIT = 100;

// Javascript identifiers used for the generation of the style module
const HOST_SELECTOR_IDENTIFIER = 'hostSelector';
const SHADOW_SELECTOR_IDENTIFIER = 'shadowSelector';
const SUFFIX_TOKEN_IDENTIFIER = 'suffixToken';
const USE_ACTUAL_HOST_SELECTOR = 'useActualHostSelector';
const USE_NATIVE_DIR_PSEUDOCLASS = 'useNativeDirPseudoclass';
const TOKEN = 'token';
const STYLESHEET_IDENTIFIER = 'stylesheet';
const VAR_RESOLVER_IDENTIFIER = 'varResolver';

export default function serialize(result: Result, config: Config): string {
    const { messages } = result;
    const collectVarFunctions = Boolean(
        config.customProperties && config.customProperties.resolverModule
    );
    const useVarResolver = messages.some(isVarFunctionMessage);
    const importedStylesheets = messages.filter(isImportMessage).map((message) => message.id);
    const disableSyntheticShadow = Boolean(config.disableSyntheticShadowSupport);
    const scoped = Boolean(config.scoped);

    let buffer = `import { registerStylesheet } from 'lwc';\n`;

    if (collectVarFunctions && useVarResolver) {
        buffer += `import ${VAR_RESOLVER_IDENTIFIER} from "${config.customProperties!
            .resolverModule!}";\n`;
    }

    for (let i = 0; i < importedStylesheets.length; i++) {
        buffer += `import ${STYLESHEET_IDENTIFIER + i} from "${importedStylesheets[i]}";\n`;
    }

    if (importedStylesheets.length) {
        buffer += '\n';
    }

    const stylesheetList = importedStylesheets.map((_str, i) => `${STYLESHEET_IDENTIFIER + i}`);
    const serializedStyle = serializeCss(result, collectVarFunctions).trim();

    if (serializedStyle) {
        // inline function
        if (disableSyntheticShadow && !scoped) {
            // If synthetic shadow DOM support is disabled and this is not a scoped stylesheet, then the
            // function signature will always be:
            //   stylesheet(token = undefined, useActualHostSelector = true, useNativeDirPseudoclass = true)
            // This means that we can just have a function that takes no arguments and returns a string,
            // reducing the bundle size when minified.
            buffer += `function ${STYLESHEET_IDENTIFIER}() {\n`;
            buffer += `  var ${TOKEN};\n`; // undefined
            buffer += `  var ${USE_ACTUAL_HOST_SELECTOR} = true;\n`;
            buffer += `  var ${USE_NATIVE_DIR_PSEUDOCLASS} = true;\n`;
        } else {
            buffer += `function ${STYLESHEET_IDENTIFIER}(${TOKEN}, ${USE_ACTUAL_HOST_SELECTOR}, ${USE_NATIVE_DIR_PSEUDOCLASS}) {\n`;
        }
        // For scoped stylesheets, we use classes, but for synthetic shadow DOM, we use attributes
        if (scoped) {
            buffer += `  var ${SHADOW_SELECTOR_IDENTIFIER} = ${TOKEN} ? ("." + ${TOKEN}) : "";\n`;
            buffer += `  var ${HOST_SELECTOR_IDENTIFIER} = ${TOKEN} ? ("." + ${TOKEN} + "-host") : "";\n`;
        } else {
            buffer += `  var ${SHADOW_SELECTOR_IDENTIFIER} = ${TOKEN} ? ("[" + ${TOKEN} + "]") : "";\n`;
            buffer += `  var ${HOST_SELECTOR_IDENTIFIER} = ${TOKEN} ? ("[" + ${TOKEN} + "-host]") : "";\n`;
        }
        // Used for keyframes
        buffer += `  var ${SUFFIX_TOKEN_IDENTIFIER} = ${TOKEN} ? ("-" + ${TOKEN}) : "";\n`;
        buffer += `  return ${serializedStyle};\n`;
        buffer += `  /*${LWC_VERSION_COMMENT}*/\n`;
        buffer += `}\n`;
        if (scoped) {
            // Mark the stylesheet as scoped so that we can distinguish it later at runtime
            buffer += `${STYLESHEET_IDENTIFIER}.${KEY__SCOPED_CSS} = true;\n`;
        }

        // register the stylesheet
        buffer += `registerStylesheet(${STYLESHEET_IDENTIFIER});\n`;

        // add import at the end
        stylesheetList.push(STYLESHEET_IDENTIFIER);
    }

    // exports
    if (stylesheetList.length) {
        buffer += `export default [${stylesheetList.join(', ')}];`;
    } else {
        buffer += `export default undefined;`;
    }

    return buffer;
}

function reduceTokens(tokens: Token[]): Token[] {
    return [{ type: TokenType.text, value: '' }, ...tokens, { type: TokenType.text, value: '' }]
        .reduce((acc: Token[], token: Token) => {
            const prev = acc[acc.length - 1];
            if (token.type === TokenType.text && prev && prev.type === TokenType.text) {
                // clone the previous token to avoid mutating it in-place
                acc[acc.length - 1] = {
                    type: prev.type,
                    value: prev.value + token.value,
                };
                return acc;
            } else {
                return [...acc, token];
            }
        }, [])
        .filter((t) => t.value !== '');
}

function normalizeString(str: string) {
    return str.replace(/(\r\n\t|\n|\r\t)/gm, '').trim();
}

function generateExpressionFromTokens(tokens: Token[]): string {
    const serializedTokens = reduceTokens(tokens).map(({ type, value }) => {
        switch (type) {
            // Note that we don't expect to get a TokenType.divider here. It should be converted into an
            // expression elsewhere.
            case TokenType.text:
                return JSON.stringify(value);
            // Expressions may be concatenated with " + ", in which case we must remove ambiguity
            case TokenType.expression:
                return `(${value})`;
            default:
                return value;
        }
    });

    if (serializedTokens.length === 0) {
        return '';
    } else if (serializedTokens.length === 1) {
        return serializedTokens[0];
    } else if (serializedTokens.length < BINARY_EXPRESSION_LIMIT) {
        return serializedTokens.join(' + ');
    } else {
        // #1726 Using Array.prototype.join() instead of a standard "+" operator to concatenate the
        // string to avoid running into a maximum call stack error when the stylesheet is parsed
        // again by the bundler.
        return `[${serializedTokens.join(', ')}].join('')`;
    }
}

function areTokensEqual(left: Token, right: Token): boolean {
    return left.type === right.type && left.value === right.value;
}

function calculateNumDuplicatedTokens(left: Token[], right: Token[]): number {
    // Walk backwards until we find a token that is different between left and right
    let i = 0;
    for (; i < left.length && i < right.length; i++) {
        const currentLeft = left[left.length - 1 - i];
        const currentRight = right[right.length - 1 - i];
        if (!areTokensEqual(currentLeft, currentRight)) {
            break;
        }
    }
    return i;
}

// For `:host` selectors, the token lists for native vs synthetic will be identical at the end of
// each list. So as an optimization, we can de-dup these tokens.
// See: https://github.com/salesforce/lwc/issues/3224#issuecomment-1353520052
function deduplicateHostTokens(nativeHostTokens: Token[], syntheticHostTokens: Token[]): Token[] {
    const numDuplicatedTokens = calculateNumDuplicatedTokens(nativeHostTokens, syntheticHostTokens);

    const numUniqueNativeTokens = nativeHostTokens.length - numDuplicatedTokens;
    const numUniqueSyntheticTokens = syntheticHostTokens.length - numDuplicatedTokens;

    const uniqueNativeTokens = nativeHostTokens.slice(0, numUniqueNativeTokens);
    const uniqueSyntheticTokens = syntheticHostTokens.slice(0, numUniqueSyntheticTokens);

    const nativeExpression = generateExpressionFromTokens(uniqueNativeTokens);
    const syntheticExpression = generateExpressionFromTokens(uniqueSyntheticTokens);

    // Generate a conditional ternary to switch between native vs synthetic for the unique tokens
    const conditionalToken = {
        type: TokenType.expression,
        value: `(${USE_ACTUAL_HOST_SELECTOR} ? ${nativeExpression} : ${syntheticExpression})`,
    };

    return [
        conditionalToken,
        // The remaining tokens are the same between native and synthetic
        ...syntheticHostTokens.slice(numUniqueSyntheticTokens),
    ];
}

function serializeCss(result: Result, collectVarFunctions: boolean): string {
    const tokens: Token[] = [];
    let currentRuleTokens: Token[] = [];
    let nativeHostTokens: Token[] | undefined;

    // Walk though all nodes in the CSS...
    postcss.stringify(result.root, (part, node, nodePosition) => {
        // When consuming the beginning of a rule, first we tokenize the selector
        if (node && node.type === 'rule' && nodePosition === 'start') {
            currentRuleTokens.push(...tokenizeCss(normalizeString(part)));

            // When consuming the end of a rule we normalize it and produce a new one
        } else if (node && node.type === 'rule' && nodePosition === 'end') {
            currentRuleTokens.push({ type: TokenType.text, value: part });

            // If we are in synthetic shadow or scoped light DOM, we don't want to have native :host selectors
            // Note that postcss-lwc-plugin should ensure that _isNativeHost appears before _isSyntheticHost
            if ((node as any)._isNativeHost) {
                // Save native tokens so in the next rule we can apply a conditional ternary
                nativeHostTokens = [...currentRuleTokens];
            } else if ((node as any)._isSyntheticHost) {
                /* istanbul ignore if */
                if (!nativeHostTokens) {
                    throw new Error('Unexpected host rules ordering');
                }

                const hostTokens = deduplicateHostTokens(nativeHostTokens, currentRuleTokens);
                tokens.push(...hostTokens);

                nativeHostTokens = undefined;
            } else {
                /* istanbul ignore if */
                if (nativeHostTokens) {
                    throw new Error('Unexpected host rules ordering');
                }
                tokens.push(...currentRuleTokens);
            }

            // Reset rule
            currentRuleTokens = [];

            // When inside a declaration, tokenize it and push it to the current token list
        } else if (node && node.type === 'decl') {
            if (collectVarFunctions) {
                const declTokens = tokenizeCssDeclaration(node);
                currentRuleTokens.push(...declTokens);
                currentRuleTokens.push({ type: TokenType.text, value: ';' });
            } else {
                currentRuleTokens.push(...tokenizeCss(part));
            }
        } else if (node && node.type === 'atrule') {
            // Certain atrules have declaration associated with for example @font-face. We need to add the rules tokens
            // when it's the case.
            if (currentRuleTokens.length) {
                tokens.push(...currentRuleTokens);
                currentRuleTokens = [];
            }

            tokens.push(...tokenizeCss(normalizeString(part)));
        } else {
            // When inside anything else but a comment just push it
            if (!node || node.type !== 'comment') {
                currentRuleTokens.push({ type: TokenType.text, value: normalizeString(part) });
            }
        }
    });

    return generateExpressionFromTokens(tokens);
}

// Given any CSS string, replace the scope tokens from the CSS with code to properly
// replace it in the stylesheet function.
function tokenizeCss(data: string): Token[] {
    data = data.replace(/( {2,})/gm, ' '); // remove when there are more than two spaces

    const tokens: Token[] = [];
    const attributes = [
        SHADOW_ATTRIBUTE,
        HOST_ATTRIBUTE,
        DIR_ATTRIBUTE_NATIVE_LTR,
        DIR_ATTRIBUTE_NATIVE_RTL,
        DIR_ATTRIBUTE_SYNTHETIC_LTR,
        DIR_ATTRIBUTE_SYNTHETIC_RTL,
    ];
    const regex = new RegExp(`[[-](${attributes.join('|')})]?`, 'g');

    let lastIndex = 0;
    for (const match of matchAll(data, regex)) {
        const index = match.index!;
        const [matchString, substring] = match;

        if (index > lastIndex) {
            tokens.push({ type: TokenType.text, value: data.substring(lastIndex, index) });
        }

        const identifier =
            substring === SHADOW_ATTRIBUTE ? SHADOW_SELECTOR_IDENTIFIER : HOST_SELECTOR_IDENTIFIER;

        if (matchString.startsWith('[')) {
            if (substring === SHADOW_ATTRIBUTE || substring === HOST_ATTRIBUTE) {
                // attribute in a selector, e.g. `[__shadowAttribute__]` or `[__hostAttribute__]`
                tokens.push({
                    type: TokenType.identifier,
                    value: identifier,
                });
            } else {
                // :dir pseudoclass placeholder, e.g. `[__dirAttributeNativeLtr__]` or `[__dirAttributeSyntheticRtl__]`
                const native =
                    substring === DIR_ATTRIBUTE_NATIVE_LTR ||
                    substring === DIR_ATTRIBUTE_NATIVE_RTL;
                const dirValue =
                    substring === DIR_ATTRIBUTE_NATIVE_LTR ||
                    substring === DIR_ATTRIBUTE_SYNTHETIC_LTR
                        ? 'ltr'
                        : 'rtl';
                tokens.push({
                    type: TokenType.expression,
                    // use the native :dir() pseudoclass for native shadow, the [dir] attribute otherwise
                    value: native
                        ? `${USE_NATIVE_DIR_PSEUDOCLASS} ? ':dir(${dirValue})' : ''`
                        : `${USE_NATIVE_DIR_PSEUDOCLASS} ? '' : '[dir="${dirValue}"]'`,
                });
            }
        } else {
            // suffix for an at-rule, e.g. `@keyframes spin-__shadowAttribute__`
            tokens.push({
                type: TokenType.identifier,
                // Suffix the keyframe (i.e. "-" plus the token)
                value: SUFFIX_TOKEN_IDENTIFIER,
            });
        }

        lastIndex = index + matchString.length;
    }

    if (lastIndex < data.length) {
        tokens.push({ type: TokenType.text, value: data.substring(lastIndex, data.length) });
    }

    return tokens;
}

function isTextOrExpression(token: Token): boolean {
    return token.type === TokenType.text || token.type == TokenType.expression;
}

/*
 * This method takes a tokenized CSS property value `1px solid var(--foo , bar)`
 * and transforms its custom variables in function calls
 */
function recursiveValueParse(node: any, inVarExpression = false): Token[] {
    const { type, nodes, value } = node;

    // If it has not type it means is the root, process its children
    if (!type && nodes) {
        return nodes.reduce((acc: Token[], n: any) => {
            acc.push(...recursiveValueParse(n, inVarExpression));
            return acc;
        }, []);
    }

    if (type === 'comment') {
        return [];
    }

    if (type === 'div') {
        return [
            {
                type: inVarExpression ? TokenType.divider : TokenType.text,
                value,
            },
        ];
    }

    if (type === 'string') {
        const { quote } = node;
        return [
            {
                type: TokenType.text,
                value: quote ? quote + value + quote : value,
            },
        ];
    }

    // If we are inside a var() expression use need to stringify since we are converting it into a function
    if (type === 'word') {
        const convertIdentifier = value.startsWith('--');
        if (convertIdentifier) {
            return [{ type: TokenType.identifier, value: `"${value}"` }];
        }
        // For animation properties, the shadow/host attributes may be in this text
        return tokenizeCss(value);
    }

    // If we inside a var() function we need to prepend and append to generate an expression
    if (type === 'function') {
        if (value === 'var') {
            // `tokens` may include tokens of type `divider`, `expression`, `identifier`,
            // and `text`. However, an identifier will only ever be adjacent to a divider,
            // whereas text and expression tokens may be adjacent to one another. This is
            // important below when inserting concatenetors.
            //
            // For fuller context, see the following conversation:
            //   https://github.com/salesforce/lwc/pull/2902#discussion_r904626421
            let tokens = recursiveValueParse({ nodes }, true);
            tokens = reduceTokens(tokens);
            const exprToken = tokens.reduce((buffer, token, index) => {
                const isTextToken = token.type === TokenType.text;
                const normalizedToken = isTextToken ? JSON.stringify(token.value) : token.value;
                const nextToken = tokens[index + 1];

                // If we have a token sequence of text + expression or expression + text,
                // we need to add the concatenation operator. Examples:
                //
                //   Input:  var(--x, 0 0 2px var(--y, #fff))
                //   Output: varResolver("--x", "0 0 2px " + varResolver("--y", "#fff"))
                //
                //   Input:  var(--x, var(--y, #fff) 0 0 2px)
                //   Output: varResolver("--x", varResolver("--y", "#fff") + " 0 0 2px"))
                //
                // Since identifier tokens will never be adjacent to text or expression
                // tokens (see above comment), a concatenator will never be required if
                // `token` or `nextToken` is an identifier.
                const shouldAddConcatenator =
                    isTextOrExpression(token) && nextToken && isTextOrExpression(nextToken);
                const concatOperator = shouldAddConcatenator ? ' + ' : '';

                return buffer + normalizedToken + concatOperator;
            }, '');

            // Generate the function call for runtime evaluation
            return [
                {
                    type: TokenType.expression,
                    value: `${VAR_RESOLVER_IDENTIFIER}(${exprToken})`,
                },
            ];
            // for any other function just do the equivalent string concatenation (no need for expressions)
        } else {
            const tokens = nodes.reduce((acc: Token[], n: any) => {
                acc.push(...recursiveValueParse(n, false));
                return acc;
            }, []);
            return [
                { type: TokenType.text, value: `${value}(` },
                ...reduceTokens(tokens),
                { type: TokenType.text, value: ')' },
            ];
        }
    }

    // For any other token types we just need to return text
    return [{ type: TokenType.text, value }];
}

function tokenizeCssDeclaration(node: Declaration): Token[] {
    const valueRoot = postcssValueParser(node.value);
    const parsed = recursiveValueParse(valueRoot);
    return [{ type: TokenType.text, value: `${node.prop.trim()}: ` }, ...parsed];
}
