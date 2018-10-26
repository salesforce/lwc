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
const SHADOW_DOM_ENABLED_IDENTIFIER = 'realShadow';
const STYLESHEET_IDENTIFIER = 'styleSheet';
const VAR_RESOLVER_IDENTIFIER = 'varResolver';

export default function serialize(result: LazyResult, config: Config): string {
    const { messages } = result;
    const useVarResolver = messages.some(isVarFunctionMessage);
    const importedStylesheets = messages.filter(isImportMessage).map(message => message.id);

    let buffer = '';

    if (useVarResolver) {
        buffer += `import ${VAR_RESOLVER_IDENTIFIER} from "${config.customProperties!.resolverModule!}";\n`;
    }

    for (let i = 0; i < importedStylesheets.length; i++) {
        buffer += `import ${STYLESHEET_IDENTIFIER + i} from "${importedStylesheets[i]}";\n`;
    }

    if (importedStylesheets.length) {
        buffer += '\n';
    }

    buffer += `export default function(${HOST_SELECTOR_IDENTIFIER}, ${SHADOW_SELECTOR_IDENTIFIER}, ${SHADOW_DOM_ENABLED_IDENTIFIER}) {\n`;
    buffer += `  let content = "";\n`;

    for (let i = 0; i < importedStylesheets.length; i++) {
        buffer += `  content += ${STYLESHEET_IDENTIFIER + i}(${HOST_SELECTOR_IDENTIFIER}, ${SHADOW_SELECTOR_IDENTIFIER}, ${SHADOW_DOM_ENABLED_IDENTIFIER});\n`;
    }

    const serializedStyle = serializeCss(result);
    if (serializedStyle) {
        buffer += `  content += ${serializedStyle};\n`;
        buffer += `  return content;\n`;
    }
    buffer += '}\n';

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

function serializeCss(result: LazyResult): string {
    const tokens: Token[] = [];
    let currentRuleTokens: Token[] = [];

    postcss.stringify(result.root, (part, node, nodePosition) => {

        // When consuming the beggining of a rule, first we tozenize the selector
        if (node && node.type === 'rule' && nodePosition === 'start') {
            currentRuleTokens.push(...tokenizeCssSelector(part));

        // When consuming the end of a rule we normalize it and produce a new one
        } else if (node && node.type === 'rule' && nodePosition === 'end') {
            currentRuleTokens.push({ type: TokenType.text, value: part });
            currentRuleTokens = reduceTokens(currentRuleTokens);

            if (currentRuleTokens.some((t) => t.value.startsWith(':host'))) {
                const exprToken = currentRuleTokens.map(({type, value}) => type === 'text' ? `"${value}"` : value).join(' + ');
                tokens.push({
                    type: TokenType.expression,
                    value: `${SHADOW_DOM_ENABLED_IDENTIFIER} ? (${exprToken}) : ''`
                });
            } else {
                tokens.push(...currentRuleTokens);
            }
            currentRuleTokens = [];
        // When inside a declaration, tokenize it and push it to the current token list
        } else if (node && node.type === 'decl') {
            const declTokens = tokenizeCssDeclaration(node);
            currentRuleTokens.push(...declTokens);
            currentRuleTokens.push({ type: TokenType.text, value: ';' });

        // When inside anything else just push it
        } else {
            currentRuleTokens.push({ type: TokenType.text, value: normalizeString(part) });
        }
    });

    const buffer =
        reduceTokens(tokens)
        .map(t => t.type === TokenType.text ? JSON.stringify(t.value) : t.value).join(',\n  ');

    if (buffer) {
        return `[\n  ${buffer}\n  ].join('')`;
    }
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
            type: quote ? TokenType.identifier : TokenType.text,
            value: quote ? JSON.stringify(quote + value + quote) : value
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

    // If we inside a var() function prepare for a function call
    if (type === 'function') {
        if (value === 'var') {
            let tokens = recursiveValueParse({ nodes }, true);
            tokens = reduceTokens(tokens);
            const exprToken = tokens.reduce((buffer, n) => {
                return buffer + (n.type === TokenType.text ? JSON.stringify(n.value) : n.value);
            }, '');
            return [{
                type: TokenType.expression,
                value: `${VAR_RESOLVER_IDENTIFIER}(${exprToken})`
            }];
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
