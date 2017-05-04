const parse5 = require('parse5');
const { serializeAttributes } = require('./attributes');

const { isUnaryTag, EXPRESSION_SYMBOL_END } = require('./constants');

function serializeArrayNode(nodes, src) {
    return nodes.reduce((acc, child) => (
        acc + serializeTreeNode(child, src)
    ), '');
}

function serializeTag(node, src) {
    const { nodeName } = node;

    let attrs = '';
    if (node.attrs.length) {
        attrs = ' ' + serializeAttributes(node, src);
    }

    if (isUnaryTag(nodeName)) {
        // Add a whitespace between the last attribute and the self closing tag
        // to remove any ambiguity when parsing: <input value={myValue}/>
        if (attrs.charAt(attrs.length - 1) === EXPRESSION_SYMBOL_END) {
            attrs += ' ';
        }

        return `<${nodeName}${attrs}/>`
    } else {
        const children = nodeName === 'template' ?
            serializeTreeNode(node.content, src) :
            serializeArrayNode(node.childNodes, src);

        return `<${nodeName}${attrs}>${children}</${nodeName}>`;
    }
}

function serializeTreeNode(node, src) {
    switch (node.nodeName) {
        case '#comment':
            return ''; // Strip the comment intentionally

        case '#text':
            return node.value;

        case '#document-fragment':
            return serializeArrayNode(node.childNodes, src);

        default:
            return serializeTag(node, src);
    }
}

module.exports = {
    transform (src) {
        const parsed = parse5.parseFragment(src, { locationInfo: true });
        return serializeTreeNode(parsed, src);
    }
};
