## Creating a customized built-in element

Raptor does not support customization of build-in elements. For example, the following code will not work in Raptor:

```js
class PlasticButton extends HTMLButtonElement {
  constructor() {
    super();
  }
}
customElements.define("plastic-button", PlasticButton, { extends: "button" });
```

The assumption here is that we might just wait until after v1 to add support for this. More details about this WC feature [here](
https://w3c.github.io/webcomponents/spec/custom/#custom-elements-customized-builtin-example).

This has implications when it comes to elements that should have certain behavior, from the interation and accessibility point of view. You can read more about this here: https://w3c.github.io/webcomponents/spec/custom/#custom-elements-autonomous-drawbacks

In the link above, you can see an example of thow to implement a custom element that behaves as a button, but still that's not possible in raptor because raptor doesn't offer control mechanism for tabIndex, and other host element properties.

## Life-cycle hooks

Life-cycle hooks in web components are executed sync, although done before returning control to user-code, so the order is not deterministic with respect to other operations in the same tick. In raptor, we explicitly decided to __diverge__ and do it async in the next microtask.

## Construction

Web Components can be created via document.createElement() of by just newing the class definintion: e.g.:

```js
customElements.define("bad-1", HTMLButtonElement);
new HTMLButtonElement();          // returns an element
document.createElement("bad-1");  // returns an element
```

In raptor, neither of those are available yet, instead, you have to use a temporary propietary API:

```js
Raptor.createElement('bad-1'); // returns an element
```
