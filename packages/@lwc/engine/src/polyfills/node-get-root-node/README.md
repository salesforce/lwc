# Node.prototype.getRootNode() polyfill


This polyfill is needed to makes getRootNode() respect the shadow dom boundaries of an LWC element. 
LWC engine uses a synthetic shadow dom for browser compatibility reasons. Since the SyntheticShadowRoot is a documentFragment which is only in memory and not connected to the document, it is invisible to the native getRootNode(). To resolve this, the getRootNode property is patched to be aware of the SyntheticShadowRoot created by the engine.

Spec: https://dom.spec.whatwg.org/#dom-node-getrootnode