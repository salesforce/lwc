# Node.prototype.getRootNode() polyfill

This polyfill is needed to make getRootNode() respect the shadow dom boundaries of an LWC element. 

LWC engine uses a synthetic shadow dom for browser compatibility reasons. Since the SyntheticShadowRoot is a documentFragment which is only in memory and not connected to the document, it is invisible to the native getRootNode(). 
To resolve this, the getRootNode property is patched to be aware of the synthetic shadow created by the engine.

## Logic

If looking for a root node beyond shadow root by calling `node.getRootNode({composed: true})`, use the original `Node.prototype.getRootNode` method to return the root of the dom tree.

If looking for a shadow root of a node by calling `node.getRootNode({composed: false})` or `node.getRootNode()`,

    1. Identify the shadow tree that the node belongs to
    2. If the node belongs to a shadow tree created by engine, return the shadowRoot of the host element that owns the shadow tree
    3. If the node does not belong to a shadow tree created by engine, use the original Node.prototype.getRootNode to fetch the root node

Spec: https://dom.spec.whatwg.org/#dom-node-getrootnode