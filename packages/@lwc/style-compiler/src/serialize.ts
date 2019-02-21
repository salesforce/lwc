/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import postcss from 'postcss';
import postcssValueParser from 'postcss-value-parser';

import { Config } from './index';
import { isImportMessage, isVarFunctionMessage } from './utils/message';
import { HOST_ATTRIBUTE, SHADOW_ATTRIBUTE } from './utils/selectors-scoping';

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

// Javascript identifiers used for the generation of the style module
const HOST_SELECTOR_IDENTIFIER = 'hostSelector';
const SHADOW_SELECTOR_IDENTIFIER = 'shadowSelector';
const SHADOW_DOM_ENABLED_IDENTIFIER = 'nativeShadow';
const STYLESHEET_IDENTIFIER = 'stylesheet';
const VAR_RESOLVER_IDENTIFIER = 'varResolver';

export default function serialize(result: postcss.LazyResult, config: Config): string {
    const { messages } = result;
    const collectVarFunctions = Boolean(
        config.customProperties && config.customProperties.resolverModule
    );
    const minify = Boolean(config.outputConfig && config.outputConfig.minify);
    const useVarResolver = messages.some(isVarFunctionMessage);
    const importedStylesheets = messages.filter(isImportMessage).map(message => message.id);

    let buffer = '';

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
    const serializedStyle = serializeCss(result, collectVarFunctions, minify).trim();

    if (serializedStyle) {
        // inline function
        buffer += `function stylesheet(${HOST_SELECTOR_IDENTIFIER}, ${SHADOW_SELECTOR_IDENTIFIER}, ${SHADOW_DOM_ENABLED_IDENTIFIER}) {\n`;
        buffer += `  return ${serializedStyle};\n`;
        buffer += `}\n`;

        // add import at the end
        stylesheetList.push(STYLESHEET_IDENTIFIER);
    }

    // exports
    buffer += `export default [${stylesheetList.join(', ')}];`;

    return buffer;
}

function reduceTokens(tokens: Token[]): Token[] {
    return [{ type: TokenType.text, value: '' }, ...tokens, { type: TokenType.text, value: '' }]
        .reduce(
            (acc, token) => {
                const prev = acc[acc.length - 1];
                if (token.type === TokenType.text && prev && prev.type === TokenType.text) {
                    prev.value += token.value;
                    return acc;
                } else {
                    return [...acc, token];
                }
            },
            [] as Token[]
        )
        .filter(t => t.value !== '');
}

function normalizeString(str: string) {
    return str.replace(/(\r\n\t|\n|\r\t)/gm, '').trim();
}

function generateExpressionFromTokens(tokens: Token[]): string {
    return tokens
        .map(({ type, value }) => (type === TokenType.text ? JSON.stringify(value) : value))
        .join(' + ');
}

function serializeCss(
    result: postcss.LazyResult,
    collectVarFunctions: boolean,
    minify: boolean
): string {
    const tokens: Token[] = [];
    let currentRuleTokens: Token[] = [];
    let tmpHostExpression: string | null;

    // Walk though all nodes in the CSS...
    postcss.stringify(result.root, (part, node, nodePosition) => {
        // When consuming the beggining of a rule, first we tokenize the selector
        if (node && node.type === 'rule' && nodePosition === 'start') {
            currentRuleTokens.push(...tokenizeCssSelector(normalizeString(part)));

            // When consuming the end of a rule we normalize it and produce a new one
        } else if (node && node.type === 'rule' && nodePosition === 'end') {
            currentRuleTokens.push({ type: TokenType.text, value: part });
            currentRuleTokens = reduceTokens(currentRuleTokens);

            // If we are in fakeShadow we dont want to have :host selectors
            if ((node as any)._isHostNative) {
                // create an expression for all the tokens (concatenation of strings)
                // Save it so in the next rule we can apply a ternary
                tmpHostExpression = generateExpressionFromTokens(currentRuleTokens);
            } else if ((node as any)._isFakeNative) {
                const exprToken = generateExpressionFromTokens(currentRuleTokens);

                tokens.push({
                    type: TokenType.expression,
                    value: `(${SHADOW_DOM_ENABLED_IDENTIFIER} ? (${tmpHostExpression}) : (${exprToken}))`,
                });

                tmpHostExpression = null;
            } else {
                if (tmpHostExpression) {
                    throw new Error('Unexpected host rules ordering');
                }
                tokens.push(...currentRuleTokens);
            }

            // Reset rule
            currentRuleTokens = [];

            // Add spacing per rule
            if (!minify) {
                tokens.push({ type: TokenType.text, value: '\n' });
            }

            // When inside a declaration, tokenize it and push it to the current token list
        } else if (node && node.type === 'decl') {
            if (collectVarFunctions) {
                const declTokens = tokenizeCssDeclaration(node);
                currentRuleTokens.push(...declTokens);
                currentRuleTokens.push({ type: TokenType.text, value: ';' });
            } else {
                currentRuleTokens.push({ type: TokenType.text, value: part });
            }
        } else if (node && node.type === 'atrule') {
            // Certain atrules have declaration associated with for example @font-face. We need to add the rules tokens
            // when it's the case.
            if (currentRuleTokens.length) {
                tokens.push(...currentRuleTokens);
                currentRuleTokens = [];
            }

            tokens.push({ type: TokenType.text, value: part });
        } else {
            // When inside anything else but a comment just push it
            if (!node || node.type !== 'comment') {
                currentRuleTokens.push({ type: TokenType.text, value: normalizeString(part) });
            }
        }
    });

    const buffer = reduceTokens(tokens)
        .map(t => (t.type === TokenType.text ? JSON.stringify(t.value) : t.value))
        .join(' + ');

    return buffer;
}

// TODO: this code needs refactor, it could be simpler by using a native post-css walker
function tokenizeCssSelector(data: string): Token[] {
    data = data.replace(/( {2,})/gm, ' '); // remove when there are more than two spaces
    const tokens: Token[] = [];
    let pos = 0;
    let next = 0;
    const max = data.length;

    while (pos < max) {
        if (data.indexOf(`[${HOST_ATTRIBUTE}]`, pos) === pos) {
            tokens.push({ type: TokenType.identifier, value: HOST_SELECTOR_IDENTIFIER });

            next += HOST_ATTRIBUTE.length + 2;
        } else if (data.indexOf(`[${SHADOW_ATTRIBUTE}]`, pos) === pos) {
            tokens.push({ type: TokenType.identifier, value: SHADOW_SELECTOR_IDENTIFIER });

            next += SHADOW_ATTRIBUTE.length + 2;
        } else {
            next += 1;

            while (data.charAt(next) !== '[' && next < max) {
                next++;
            }

            tokens.push({ type: TokenType.text, value: data.slice(pos, next) });
        }

        pos = next;
    }

    return tokens;
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
        return [
            {
                type: convertIdentifier ? TokenType.identifier : TokenType.text,
                value: convertIdentifier ? `"${value}"` : value,
            },
        ];
    }

    // If we inside a var() function we need to prepend and append to generate an expression
    if (type === 'function') {
        if (value === 'var') {
            let tokens = recursiveValueParse({ nodes }, true);
            tokens = reduceTokens(tokens);
            // The children tokens are a combination of identifiers, text and other expressions
            // Since we are producing evaluatable javascript we need to do the right scaping:
            const exprToken = tokens.reduce((buffer, n) => {
                return buffer + (n.type === TokenType.text ? JSON.stringify(n.value) : n.value);
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

function tokenizeCssDeclaration(node: postcss.Declaration): Token[] {
    const valueRoot = postcssValueParser(node.value);
    const parsed = recursiveValueParse(valueRoot);

    return [{ type: TokenType.text, value: `${node.prop.trim()}: ` }, ...parsed];
}
