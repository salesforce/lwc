function isTag(node) {
    return node && node.type === 'tag';
}

function isPseudo(node) {
    return node && node.type === 'pseudo';
}

function isCombinator(node) {
    return node && node.type === 'combinator';
}

function findNode(container, predicate) {
    return container && container.nodes && container.nodes.find(predicate);
}

function replaceNodeWith(oldNode, ...newNodes) {
    if (newNodes.length) {
        newNodes.forEach(node => {
            oldNode.parent.insertBefore(oldNode, node);
        });

        oldNode.remove();
    }
}

function trimNodeWhitespaces(node) {
    if (node && node.spaces) {
        node.spaces.before = '';
        node.spaces.after = '';
    }
}

module.exports = {
    isTag,
    isPseudo,
    isCombinator,
    findNode,
    replaceNodeWith,
    trimNodeWhitespaces,
}
