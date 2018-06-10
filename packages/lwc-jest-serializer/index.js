module.exports.test = function test(value) {
    if (!value) {
        return false;
    }

    const { nodeType } = value;
    if (!nodeType) {
        return false;
    }
    return (
        nodeType === 1 || // element
        nodeType === 3 || // text
        nodeType === 6    // comment
    )
}

const { getOwnPropertyDescriptor, defineProperty } = Object;
const childNodesGetter = getOwnPropertyDescriptor(Node.prototype, 'childNodes').get;

module.exports.serialize = function(node, config, ...everythingElse) {
    const htmlSerializer = config.plugins.filter((p) => {
        return p.test(node) && p.test !== test;
    })[0];

    const oldDescriptor = getOwnPropertyDescriptor(node, 'childNodes');
    if (oldDescriptor) {
        defineProperty(node, 'childNodes', {
            get() {
                return childNodesGetter.call(this);
            },
            configurable: true,
        });
    }
    const result = htmlSerializer.serialize(node, config, ...everythingElse);
    if (oldDescriptor) {
        defineProperty(node, 'childNodes', oldDescriptor);
    }

    return result;
}

