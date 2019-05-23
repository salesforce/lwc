# Engine.LightningElement API

## getBoundingClientRect()

The returned value is a DOMRect object which is the union of the rectangles returned by getClientRects() for the HOST element, i.e., the CSS border-boxes associated with the element. This object is computed everytime you call this API.

Official Documentation: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect

The DOMRect is an object that contains various properties that can be used to determine the exact location of the HOST element in the page, and the size of the HOST element. The object looks like the following example:

```js
{
    bottom: 717.9545288085938,
    height: 717.9545288085938,
    left: 7.997159004211426,
    right: 424.7301025390625,
    top: 0,
    width: 416.7329406738281,
}
```
