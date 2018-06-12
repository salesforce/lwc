const PrettyFormat = require('pretty-format');
const DOMElement = PrettyFormat.plugins.DOMElement;

function test({ nodeType, tagName } = {}) {
    return nodeType && (
        nodeType === 1 || // element
        nodeType === 3 || // text
        nodeType === 6    // comment
    );
}

const { getOwnPropertyDescriptor, defineProperty } = Object;
const childNodesGetter = getOwnPropertyDescriptor(Node.prototype, 'childNodes').get;

function escapeHTML(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function printNoopElement(printedChildren, config, indentation) {
    return (
        printedChildren +
        config.spacingOuter +
        indentation
    );

}

function printText(text, config) {
    const contentColor = config.colors.content;
    return contentColor.open + escapeHTML(text) + contentColor.close;
};

function printChildren(children, config, indentation, depth, refs, printer) {
    return children
    .map(
      child =>
        config.spacingOuter +
        indentation +
        (typeof child === 'string'
          ? printText(child, config)
          : printer(child, config, indentation, depth, refs)),
    )
    .join('');
}

function serialize(node, config, indentation, depth, refs, printer) {
    const oldDescriptor = getOwnPropertyDescriptor(node, 'childNodes');

    if (oldDescriptor) {
        defineProperty(node, 'childNodes', {
            get() {
                return childNodesGetter.call(this);
            },
            configurable: true,
        });
    }

    let result;
    if (node.tagName === 'SLOT') {
        const children = Array.prototype.slice.call(node.childNodes);
        result = printNoopElement(
            printChildren(children, config, indentation, depth, refs, printer),
            config,
            indentation
        );

    } else {
        result = DOMElement.serialize(node, config, indentation, depth, refs, printer);
    }

    if (oldDescriptor) {
        defineProperty(node, 'childNodes', oldDescriptor);
    }

    return result;
}

module.exports.test = test;
module.exports.serialize = serialize;
