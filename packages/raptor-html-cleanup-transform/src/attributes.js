const {
    DEFAULT_DIRECTIVE_PREFIX,
    DEFAULT_DIRECTIVE_SYMBOL,

    EVENT_HANDLER_DIRECTIVE_PREFIX,
    EVENT_HANDLER_SYMBOL,

    EXPRESSION_SYMBOL_START,
    EXPRESSION_SYMBOL_END,

    VALID_EXPRESSION_REGEX,
    POTENTIAL_EXPRESSION_REGEX,
} = require('./constants');

const {
    extractRaw,
} = require('./utils');

function normalizeAttrName(attr) {
    let { name, prefix } = attr;

    // :foo => d:foo
    if (name.charAt(0) === DEFAULT_DIRECTIVE_SYMBOL) {
        prefix = DEFAULT_DIRECTIVE_PREFIX;
        name = name.substring(1);
    }

    // @foo => bind:foo
    if (name.charAt(0) === EVENT_HANDLER_SYMBOL) {
        prefix = EVENT_HANDLER_DIRECTIVE_PREFIX;
        name = name.substring(1);
    }

    return prefix ? `${prefix}:${name}` : name;
}

function isQuotedAttribute(src, location) {
    const rawAttribute = extractRaw(src, location);
    const [, value] = rawAttribute.split('=');

    return value && value.startsWith('"') && value.endsWith('"');
}

function isEmptyValue(rawAttribute) {
    return rawAttribute.indexOf('=') === -1;
}

function normalizeAttrValue(attr, location, src) {
    const { prefix, name, value } = attr;
    const locKey = prefix ? `${prefix}:${name}` : name;
    /* We need `toLowerCase()` for special cases like svg viewBox */
    const attrLocation = location.attrs[locKey] || location.attrs[locKey.toLowerCase()];

    const rawAttribute = extractRaw(src, attrLocation);
    const { line, col } = attrLocation;

    if (isEmptyValue(rawAttribute)) {
        return null;
    }

    const isQuoted = isQuotedAttribute(src, attrLocation);
    const isValidExpression = value.match(VALID_EXPRESSION_REGEX);
    const isPotentialExpression = value.match(POTENTIAL_EXPRESSION_REGEX);



    if (isValidExpression) {
        if (isQuoted) {
            // <input value="{myValue}" />
            // -> ambiguity if the attribute value is a template identifier or a string literal.

            const unquoted = rawAttribute.replace(/"/g, '');
            const escaped = rawAttribute.replace('"{', '"\\{');

            const err = new Error([
                `Ambiguous attribute value ${rawAttribute}.`,
                `If you want to make it a valid identifier you should remove the surrounding quotes ${unquoted}.`,
                `If you want to make it a string you should escape it ${escaped}.`
            ].join(' '));
            err.loc = {
                line,
                column: col
            };

            throw err;
        }

        // <input value={myValue} />
        // -> Valid identifier.

        return value;
    } else if (isPotentialExpression) {
        const isExpressionEscaped = value.startsWith(`\\${EXPRESSION_SYMBOL_START}`);
        const isExpressionNextToSelfClosing = value.startsWith(EXPRESSION_SYMBOL_START)
            && value.endsWith(`${EXPRESSION_SYMBOL_END}/`)
            && !isQuoted
            && location.endOffset === attrLocation.endOffset + 1;

        if (isExpressionNextToSelfClosing) {
            // <input value={myValue}/>
            // -> By design the html parser consider the / as the last character of the attribute value.
            //    Make sure to remove strip the trailing / for self closing elements.

            return value.slice(0, -1);
        } else if (isExpressionEscaped) {
            // <input value="\{myValue}"/>
            // -> Valid escaped string literal

            return `"${value.slice(1)}"`;
        }

        let escaped = rawAttribute.replace(/="?/, '="\\');
        escaped += escaped.endsWith('"') ? '' : '"';

        // Throw if the attribute value looks like an expression, but it can't be resolved by the compiler.
        const err = new Error(`Ambiguous attribute value ${rawAttribute}. If you want to make it a string you should escape it ${escaped}`);
        err.loc = {
            line,
            column: col
        };

        throw err;
    }

    // <input value="myValue"/>
    // -> Valid string literal.

    return `"${value}"`;
}

function serializeAttributes(node, src) {
    const attributeList = node.attrs.map(attr => {
        const key = normalizeAttrName(attr);
        const value = normalizeAttrValue(attr, node.__location, src);
        return value !== null ? `${key}=${value}` : key;
    });

    return attributeList.join(' ');
}

module.exports = {
    serializeAttributes,
};
