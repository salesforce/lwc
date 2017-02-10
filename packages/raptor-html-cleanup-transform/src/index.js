/* eslint-env node */
'use strict';

const parse5 = require('parse5');
const jsDiff = require('diff');
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
    // sax.on('comment', comment => {/* skip commnents */});
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

// TODO: This is a temporal hack until we find a better and more reliable way to validate HTML
function validateHTML(original, parsed) {
    if (original !== parsed) {
        const strDiff = jsDiff.diffChars(original, parsed);
        let errors = {};
        let lines = 1;

        strDiff.forEach(function(part) {
            const added = part.added;
            const removed = part.removed;
            const newLines = part.value.match(/\n/g);

            if (!added) {
                lines += newLines ? newLines.length : 0;
            }

            if (removed) {
                errors[lines] = true;
            }
        });

        const errLines = Object.keys(errors).join(', ');
        const errMsg = errLines.length ? `Errors found in lines: ${errLines}` : '';
        throw new Error(`\nError validating HTML:\n ${original}\nNot valid HTML (invalid self-closing tags?)\n${errMsg}`);
    }
}

module.exports = {
    transform (buffer) {
        const src = buffer.toString();
        // We do a first pass so we get the "correct" beahviour when dealing with broken self-closing/missing tags.
        const parsed = parse5.serialize(parse5.parseFragment(src));
        validateHTML(src, parsed);

        // Now we do our own transformations to make it "JSX" compliant
        return new Promise(function (resolve) {
            const output = [];
            const parser = createStreamParser(output);
            const sourceStream = new HTMLReadable(parsed);

            sourceStream.pipe(parser);
            parser.on('end', () => resolve(output.join('')));
        });
    }
};
