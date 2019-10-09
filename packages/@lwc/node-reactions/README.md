# node-reactions

node-reactions is a library, tailor made for lwc engine to react to lifecycle events of a DOM node. In the current state, the library allow a subscriber to react to a DOM node being connected and disconnected from the document.
Note: In its current state node-reactions is not meant to be used outside of the @lwc/engine package.

## APIs

reactWhenConnected(element, callback);
reactWhenDisconnected(element, callback);

## Example usage

```js
const element = document.createElement('lwc-foo');
reactWhenConnected(element, function(element, reactionType) {
    console.log(element.isConnected); // true
    console.log(element.tagName); // lwc-foo
    console.log(reactionType); // 1 (which indicates connected)
});
document.body.appendChild(element);
```

## Caveats

This library assumes certain DOM APIs to be available(or polyfilled). Here is the list of APIs:

1. [Node.isConnected](https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected)
2. [Element.shadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot)
