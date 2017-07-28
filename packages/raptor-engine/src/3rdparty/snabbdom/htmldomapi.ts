const {
    createElement,
    createElementNS,
    createTextNode,
    createComment,
} = document;
const {
    insertBefore,
    removeChild,
    appendChild,
} = Node.prototype;
function parentNode(node) {
    return node.parentNode;
}
function nextSibling(node) {
    return node.nextSibling;
}
function tagName(elm) {
    return elm.tagName;
}
function setTextContent(node, text) {
    node.nodeValue = text;
}
function getTextContent(node) {
    return node.nodeValue;
}
function isElement(node) {
    return node.nodeType === 1;
}
function isText(node) {
    // Performance optimization over `return node.nodeType === 3;`
    return node.splitText !== undefined;
}
function isComment(node) {
    return node.nodeType === 8;
}
export var htmlDomApi = {
    createElement(tagName) {
        return createElement.call(document, tagName);
    },
    createElementNS(namespaceURI, qualifiedName) {
        return createElementNS.call(document, namespaceURI, qualifiedName);
    },
    createTextNode(text) {
        return createTextNode.call(document, text);
    },
    createComment(text) {
        return createComment.call(document, text);
    },
    insertBefore(parentNode, newNode, referenceNode) {
        insertBefore.call(parentNode, newNode, referenceNode);
    },
    removeChild(node, child) {
        removeChild.call(node, child);
    },
    appendChild(node, child) {
        appendChild.call(node, child);
    },
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    getTextContent: getTextContent,
    isElement: isElement,
    isText: isText,
    isComment: isComment,
};
export default htmlDomApi;
