# Component Lifecycle

Only stateful components expose the lifecycle to developers. Raptor aligns with Web Components when it comes to important moments that can be observed by the default to carry on specific tasks, these are called lifecycle hooks.

## Lifecycle Hooks

Raptor components provide "lifecycle" hooks that allow us to respond to changes to a component, such as when it gets created, rendered, inserted or destroyed. To add a lifecycle hook to a component, implement the hook as a method on your component subclass.

For example, to be notified when Raptor has inserted your component in the DOM so you can attach a listener, and remove the listener when the component is removed from the DOM, implement the `connectedCallback()` and `disconnectedCallback()` methods:

```js
import Element from 'engine';

export default class Foo extends Element {
  connectedCallback() {
    this.addEventListener('mouseenter', this.lightUp);
    this.addEventListener('mouseleave', this.lightDown);
  }
  connectedCallback() {
    this.removeEventListener('mouseenter', this.lightUp);
    this.removeEventListener('mouseleave', this.lightDown);
  }
  lightUp() {
    this.classList.add('make-container-opaque');
  }
  lightDown() {
    this.classList.remove('make-container-opaque');
  }
}
```

> Note: removing listeners is a good practice, but not strictly necessary since the engine will clean all remaining listeners when destroying an HOST element.

> Note: these two hooks are well document as part of the Web Component specification.

Additinonally, the `renderedCallback()` is a Raptor's specific, and it is used to indicated that a component has finished the rendering phase, which can occur multiple times (due to mutations) during the lifespan of the component in the application.

For example, to be notified when Raptor has rendered your component so you can calculate the size of the HOST element, implement the `renderedCallback()` method:

```js
import Element from 'engine';

export default class Foo extends Element {
  renderedCallback() {
    const { left, top, right, bottom, width, height } = this.getBoundingClientRect();
    // then do something with the dimensions of the component
    // ...
  }
}
```

> Note: all hooks are guarantee to be called after all child elements of the component (based on its template) are created and inserted inside the HOST element.
