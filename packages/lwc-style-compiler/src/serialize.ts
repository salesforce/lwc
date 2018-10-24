import postcss, { LazyResult } from 'postcss';
// import balanced from 'balanced-match';

import { Config } from './index';
import { isImportMessage, isVarFunctionMessage } from './utils/message';
import { HOST_ATTRIBUTE, SHADOW_ATTRIBUTE } from './utils/selectors-scoping';

interface TextToken {
    type: 'text';
    value: string;
}

interface ExpressionToken {
    type: 'expression';
    value: string;
}

type Token = TextToken | ExpressionToken;

// Match on custom selector scoping attributes added during transformation
// const HOST_ATTRIBUTE_RE = new RegExp(`\\[${HOST_ATTRIBUTE}\\]`, 'g');
// const SHADOW_ATTRIBUTE_RE = new RegExp(`\\[${SHADOW_ATTRIBUTE}\\]`, 'g');

// Match on " var("
// const VAR_FUNC_REGEX = /(^|[^\w-])var\(/;

// Match on "<property-name>" and "<property-name>, <fallback-value>"
// const VAR_ARGUMENTS_REGEX = /[\f\n\r\t ]*([\w-]+)(?:[\f\n\r\t ]*,[\f\n\r\t ]*([\W\w]+))?/;

// Javascript identifiers used for the generation of the style module
const HOST_SELECTOR_IDENTIFIER = 'hostSelector';
const SHADOW_SELECTOR_IDENTIFIER = 'shadowSelector';
const STYLESHEET_IDENTIFIER = 'styleSheet';
// const VAR_RESOLVER_IDENTIFIER = 'varResolver';

export default function serialize(result: LazyResult, config: Config): string {
    const { messages } = result;

    const useVarResolver = messages.some(isVarFunctionMessage);
    const importedStylesheets = messages
        .filter(isImportMessage)
        .map(message => {
            return message.id;
        });

    let buffer = '';

    if (useVarResolver) {
        buffer += `import varResolver from "${config.customProperties!
            .resolverModule!}";\n`;
    }

    for (let i = 0; i < importedStylesheets.length; i++) {
        buffer += `import ${STYLESHEET_IDENTIFIER + i} from "${
            importedStylesheets[i]
        }";\n`;
    }

    if (importedStylesheets.length) {
        buffer += '\n';
    }

    buffer += `export default function(${HOST_SELECTOR_IDENTIFIER}, ${SHADOW_SELECTOR_IDENTIFIER}) {\n`;
    buffer += `    let content = "";\n`;

    for (let i = 0; i < importedStylesheets.length; i++) {
        buffer += `    content += ${STYLESHEET_IDENTIFIER +
            i}(${HOST_SELECTOR_IDENTIFIER}, ${SHADOW_SELECTOR_IDENTIFIER});\n`;
    }

    const serializedStyle = serializeCss(result);

    buffer += `    content += ${serializedStyle};\n`;
    buffer += `    return content;\n`;
    buffer += '}\n';

    return buffer;
}

function serializeCss(result: LazyResult): string {
    const tokens: Token[] = [];

    postcss.stringify(result.root, (part, node, type) => {
        if (node && node.type === 'rule' && type === 'start') {
            const ruleTokens = tokenizeRule(part);
            tokens.push(...ruleTokens);
        } else if (node && node.type === 'decl') {
            const declTokens = tokenizeDecl(part);
            tokens.push(...declTokens);
        } else {
            tokens.push({
                type: 'text',
                value: part,
            });
        }
    });

    const reducedTokens = [
        {
            type: 'text',
            value: '',
        },
        ...tokens,
        {
            type: 'text',
            value: '',
        },
    ].reduce(
        (acc, token) => {
            const prev = acc[acc.length - 1];

            if (token.type === 'text' && prev && prev.type === 'text') {
                prev.value += token.value;
                return acc;
            } else {
                return [...acc, token];
            }
        },
        [] as Token[],
    );

    return reducedTokens
        .map(token => {
            return token.type === 'text'
                ? JSON.stringify(token.value)
                : token.value;
        })
        .join('');
}

function tokenizeRule(data: string): Token[] {
    const tokens: Token[] = [];

    let pos = 0;
    let next = 0;
    const max = data.length;

    while (pos < max) {
        if (data.indexOf(`[${HOST_ATTRIBUTE}]`, pos) === pos) {
            tokens.push({
                type: 'expression',
                value: ` + ${HOST_SELECTOR_IDENTIFIER} + `,
            });

            next += HOST_ATTRIBUTE.length + 2;
        } else if (data.indexOf(`[${SHADOW_ATTRIBUTE}]`, pos) === pos) {
            tokens.push({
                type: 'expression',
                value: ` + ${SHADOW_SELECTOR_IDENTIFIER} + `,
            });

            next += SHADOW_ATTRIBUTE.length + 2;
        } else {
            next += 1;

            while (data.charAt(next) !== '[' && next < max) {
                next++;
            }

            tokens.push({
                type: 'text',
                value: data.slice(pos, next),
            });
        }

        pos = next;
    }

    return tokens;
}

function tokenizeDecl(data: string): Token[] {
    const tokens: Token[] = [];

    // let pos = 0;
    // let next = 0;
    // const max = data.length;

    // while (pos < max) {
    //     if (data.indexOf(`(VAR_START__`, pos) === pos) {
    //         tokens.push({
    //             type: 'expression',
    //             value: ` + ${VAR_RESOLVER_IDENTIFIER}(`,
    //         });

    //         next += 12;
    //         pos = next;

    //         let dept = 0;


    //         while (
    //             data.indexOf(`__VAR_END)`, next) === next &&
    //             data.indexOf(`__VAR_DIVIDER__`, next) === next
    //         ) {
    //             next++;
    //         }

    //         tokens.push({
    //             type: 'text',
    //             value: data.slice(pos, next),
    //         });



    //     } else {
    //         next += 1;

    //         while (data.charAt(next) !== '[' && next < max) {
    //             next++;
    //         }

    //         tokens.push({
    //             type: 'text',
    //             value: data.slice(pos, next),
    //         });
    //     }

    //     pos = next;
    // }

    tokens.push({
        type: 'text',
        value: data,
    });

    return tokens;
}
