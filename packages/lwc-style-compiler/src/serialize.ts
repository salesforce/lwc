import postcss, { LazyResult } from 'postcss';
import parseValue from 'postcss-value-parser';

import { Config } from './index';
import { isImportMessage, isVarFunctionMessage } from './utils/message';
import { HOST_ATTRIBUTE, SHADOW_ATTRIBUTE } from './utils/selectors-scoping';

enum TokenType {
    text = 'text',
    expression = 'expression',
    identifier = 'identifier',
    divider = 'divider'
}
interface Token {
    type: TokenType;
    value: string;
}

// Javascript identifiers used for the generation of the style module
const HOST_SELECTOR_IDENTIFIER = 'hostSelector';
const SHADOW_SELECTOR_IDENTIFIER = 'shadowSelector';
const STYLESHEET_IDENTIFIER = 'styleSheet';
const VAR_RESOLVER_IDENTIFIER = 'varResolver';

export default function serialize(result: LazyResult, config: Config): string {
    const { messages } = result;
    const collectVarFunctions = Boolean(config.customProperties && config.customProperties.resolverModule);
    const useVarResolver = messages.some(isVarFunctionMessage);
    const importedStylesheets = messages.filter(isImportMessage).map(message => message.id);

    let buffer = '';

    if (collectVarFunctions && useVarResolver) {
        buffer += `import ${VAR_RESOLVER_IDENTIFIER} from "${config.customProperties!.resolverModule!}";\n`;
    }

    for (let i = 0; i < importedStylesheets.length; i++) {
        buffer += `import ${STYLESHEET_IDENTIFIER + i} from "${importedStylesheets[i]}";\n`;
    }

    if (importedStylesheets.length) {
        buffer += '\n';
    }

    buffer += `function stylesheet(${HOST_SELECTOR_IDENTIFIER}, ${SHADOW_SELECTOR_IDENTIFIER}) {\n`;
    buffer += `  return \`\n`;

    const serializedStyle = serializeCss(result, collectVarFunctions);
    buffer += serializedStyle + "`\n}\n";

    buffer += 'export default [\n  stylesheet';

    for (let i = 0; i < importedStylesheets.length; i++) {
        buffer += `,\n  ${STYLESHEET_IDENTIFIER + i}\n`;
    }
    buffer += '];';

    return buffer;
}

function reduceTokens(tokens: Token[]): Token[] {
    return [
        { type: TokenType.text, value: '' },
        ...tokens,
        { type: TokenType.text, value: '' }
    ].reduce((acc, token) => {
        const prev = acc[acc.length - 1];
        if (token.type === TokenType.text && prev && prev.type === TokenType.text) {
            prev.value += token.value;
            return acc;
        } else {
            return [...acc, token];
        }
    }, [] as Token[])
    .filter((t) => t.value !== '');
}

function normalizeString(str: string) {
    return str.replace(/(\r\n\t|\n|\r\t)/gm, '').trim();
}

/* We might need this regex in the future, commenting it for now...
function escapeDoubleQuotes(str: string) {
    return str.replace(/\\([\s\S])|(")/g, "\\$1$2");
}
*/

function serializeCss(result: LazyResult, collectVarFunctions: boolean): string {
    const tokens: Token[] = [];
    let currentRuleTokens: Token[] = [];

    // Walk though all nodes in the CSS...
    postcss.stringify(result.root, (part, node, nodePosition) => {
        // When consuming the beggining of a rule, first we tokenize the selector
        if (node && node.type === 'rule' && nodePosition === 'start') {
            currentRuleTokens.push(...tokenizeCssSelector(part));

        // When consuming the end of a rule we normalize it and produce a new one
        } else if (node && node.type === 'rule' && nodePosition === 'end') {
            currentRuleTokens.push({ type: TokenType.text, value: part });
            currentRuleTokens = reduceTokens(currentRuleTokens);
            tokens.push(...currentRuleTokens);
            currentRuleTokens = [];

            // Add spacing per rule
            tokens.push({ type: TokenType.text, value: '\n' });

        // When inside a declaration, tokenize it and push it to the current token list
        } else if (node && node.type === 'decl') {
            if (collectVarFunctions) {
                const declTokens = tokenizeCssDeclaration(node);
                currentRuleTokens.push(...declTokens);
                currentRuleTokens.push({ type: TokenType.text, value: ';' });
            } else {
                currentRuleTokens.push({
                    type: TokenType.text,
                    value: part
                });
            }

        // When inside anything else just push it
        } else {
            currentRuleTokens.push({ type: TokenType.text, value: normalizeString(part) });
        }
    });

    const buffer =
        reduceTokens(tokens)
        .map(t => t.type === TokenType.expression || t.type === TokenType.identifier ? '${' + t.value + '}' : t.value).join('');

    return buffer;
}

// TODO: this code needs refactor, it could be simpler by using a native post-css walker
function tokenizeCssSelector(data: string): Token[] {
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
        return [{
            type: inVarExpression ? TokenType.divider : TokenType.text,
            value
        }];
    }

    if (type === 'string') {
        const { quote } = node;
        return [{
            type: TokenType.text,
            value: quote ? (quote + value + quote) : value
        }];
    }

    // If we are inside a var() expression use need to stringify since we are converting it into a function
    if (type === 'word') {
        const convertIdentifier = value.startsWith('--');
        return [{
            type: convertIdentifier ? TokenType.identifier : TokenType.text,
            value: convertIdentifier ? `"${value}"` : value
        }];
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
            return [{
                type: TokenType.expression,
                value: `${VAR_RESOLVER_IDENTIFIER}(${exprToken})`
            }];
        // for any other function just do the equivalent string concatenation (no need for expressions)
        } else {
            const tokens = nodes.reduce((acc: Token[], n: any) => {
                acc.push(...recursiveValueParse(n, false));
                return acc;
            }, []);
            return [
                { type: TokenType.text, value: `${value}(`},
                ...reduceTokens(tokens),
                { type: TokenType.text, value: ')'},
            ];
        }
    }

    // For any other token types we just need to return text
    return [{ type: TokenType.text, value }];
}

function tokenizeCssDeclaration(node: any): Token[] {
    const tokens: Token[] = [];
    const valueRoot = parseValue(node.value);
    const parsed = recursiveValueParse(valueRoot);

    tokens.push({ type: TokenType.text, value: `${node.prop.trim()}: ` });
    tokens.push(...parsed);

    return tokens;
}
