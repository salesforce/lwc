# Node.prototype.getRootNode() polyfill

This polyfill is needed to provide Node.prototype.getRootNode() in IE11 and Edge browsers. Also it makes getRootNode() respect the shadow dom boundaries of an LWC element. 

LWC engine uses a synthetic shadow dom for browser compatibility reasons. Since the SyntheticShadowRoot is a documentFragment which is only in memory and not connected to the document, it is invisible to the native getRootNode(). 
To resolve this, the getRootNode property is patched to be aware of the synthetic shadow created by the engine.

## Logic

If looking for a root node beyond shadow root by calling `node.getRootNode({composed: true})`, use the original `Node.prototype.getRootNode` method to return the root of the dom tree. In IE11 and Edge, Node.prototype.getRootNode is [not supported](https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode#Browser_compatibility). The root node is discovered by manually climbing up the dom tree.

If looking for a shadow root of a node by calling `node.getRootNode({composed: false})` or `node.getRootNode()`,

    1. Try to identify the host element that owns the give node.
        i. Identify the shadow tree that the node belongs to
        ii. If the node belongs to a shadow tree created by engine, return the shadowRoot of the host element that owns the shadow tree
    2. The host identification logic returns null in two cases: 
        i. The node does not belong to a shadow tree created by engine
        ii. The engine is running in native shadow dom mode
       If so, use the original Node.prototype.getRootNode to fetch the root node(or manually climb up the dom tree where getRootNode() is unsupported)

*Spec*: https://dom.spec.whatwg.org/#dom-node-getrootnode

*Browser compatibility*: https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode#Browser_compatibility