/* eslint-env node */
'use strict';

const parse5 = require('parse5');
const Readable = require('stream').Readable;
const constants = require('./constants');
const isUnaryTag = constants.isUnaryTag;

function normalizeAttrName(name) {
    // :foo => d:foo
    if (name[0] === constants.DIRECTIVE_SYMBOL) {
        return constants.DEFAULT_DIRECTIVE_PREFIX + name;
    }
    // @foo => bind:foo
    if (name[0] === constants.EVENT_HANDLER_SYMBOL) {
        return constants.EVENT_HANDLER_DIRECTIVE_PREFIX + constants.DIRECTIVE_SYMBOL + name.substring(1);
    }
    return name;
}

function generateHTMLAttr(attr) {
    return `${attr.name}="${attr.value}"`;
}

function parseAttrs(attrs) {
    const normalizedAttrs = attrs.map((attr) => {
        return { name: normalizeAttrName(attr.name), value : attr.value }
    });
    return normalizedAttrs.map(generateHTMLAttr);
}

function createStreamParser(output) {
    const sax = new parse5.SAXParser();
    sax.on('startTag', (tagName, rawAttrs) => {
        const attrs = rawAttrs && rawAttrs.length ? ' ' + parseAttrs(rawAttrs).join(' ') : '';
        const tag = isUnaryTag(tagName) ? `<${tagName}${attrs}/>` : `<${tagName}${attrs}>`;
        output.push(tag);
    });

    //sax.on('comment', comment => {/*skip commnents*/});
    sax.on('endTag', (tag) => output.push(`</${tag}>`));
    sax.on('text', (text) => output.push(text));

    return sax;
}

class HTMLReadable extends Readable {
    constructor(src) {
        super();
        this.src = src;
    }
    _read() {
        this.push(this.src);
        this.push(null);
    }
}

module.exports = {
    transform(src) {
        return new Promise(function (resolve) {
            const output = [];
            const parser = createStreamParser(output);
            const sourceStream = new HTMLReadable(src);

            sourceStream.pipe(parser);
            parser.on('end', () => resolve(output.join('')));
        });
    }
};