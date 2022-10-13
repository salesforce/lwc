# @lwc/scoped-registry

Allows [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) to share the same tag name in the same DOM without conflicts. In a sense, it is a (partial) polyfill for [Scoped Custom Element Registries](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Scoped-Custom-Element-Registries.md).

Note that this library only supports [browsers that support custom elements](https://caniuse.com/custom-elementsv1).

## Installation

```sh
npm install @lwc/scoped-registry
```

## Usage

Import the library:

```js
import { createScopedRegistry } from '@lwc/scoped-registry';
```

Create a scoped registry:

```js
const createScopedConstructor = createScopedRegistry();
```

Next, create two separate "userland" constructors:

```js
class UserCtor1 extends HTMLElement {
    connectedCallback() {
        console.log('I am x-foo!');
    }
}

class UserCtor2 extends HTMLElement {
    connectedCallback() {
        console.log('I am also x-foo!');
    }
}
```

Then, create a "scoped constructor" (passing in any user constructor, which is used as an optimization hint):

```js
const ScopedCtor = createScopedConstructor('x-foo', UserCtor1);
```

Now you can create two elements with the same tag name, but different behavior!

```js
const elm1 = new ScopedCtor(UserCtor1);
const elm2 = new ScopedCtor(UserCtor2);

document.body.appendChild(elm1);
document.body.appendChild(elm2);
```

These two elements can coexistent in the same DOM, but with different functionality (constructor, `connectedCallback`, `observedAttributes`, etc.).

## How it works

The core concept behind this library is ["pivots"](https://github.com/caridy/redefine-custom-elements), based on [an implementation in Polymer's web components polyfills](https://github.com/webcomponents/polyfills/blob/ee1db33d70400c89f0c7255f78d889c9b8eb88a7/packages/scoped-custom-element-registry/src/scoped-custom-element-registry.js). The idea is twofold:

1. Have a mechanism to register a class extending `HTMLElement` that can dynamically change its behavior on-demand.
2. Patch all relevant globals (`customElements.define`, `customElements.get`, `HTMLElement`) so that, to the outside observer, native custom element registry behavior is still respected.

So for example, custom elements defined _outside_ of the scoped registry will still conflict:

```js
customElements.define('x-bar', class extends HTMLElement {});
customElements.define('x-bar', class extends HTMLElement {}); // Error
```

... but elements defined within the scoped registry can conflict with those outside of it:

```js
createScopedConstructor('x-bar', class extends HTMLElement {});
customElements.define('x-bar', class extends HTMLElement {}); // This is fine
```

... and elements defined internally are "hidden" to the outside observer (to some degree):

```js
createScopedConstructor('x-bar', class extends HTMLElement {});
customElements.get('x-bar'); // undefined
```

## Gotchas

You may want to cache the global `window.HTMLElement` after defining a scoped registry:

```js
const createScopedConstructor = createScopedRegistry();
const CachedHTMLElement = window.HTMLElement;
```

Then you would use this `CachedHTMLElement` when defining userland constructors:

```js
class UserCtor extends CachedHTMLElement {}
```

This is helpful if there are multiple copies of `@lwc/scoped-registry` on the same page. Otherwise,
you may end up with conflicting `HTMLElement` objects from different scoped registries, which can cause runtime errors.

Caching after calling `createScopedRegistry()` ensures you are using the right `HTMLElement` for your registry.

## Drawbacks

### Partial leakage of private components

In a sense, components created inside of the scoped registry are "invisible" to the outside observer. The abstraction does leak in some places – for instance, calling `document.createElement('x-foo')` when `x-foo` is registered by the scoped registry will necessarily create a custom element:

```js
createScopedConstructor('x-baz', class extends HTMLElement {});

const elm = document.createElement('x-baz');
console.log(elm.constructor); // "scoped" constructor
```

However, such an element is not completely upgraded (i.e. the userland `constructor`/`connectedCallback`/`disconnectedCallback`/etc will not apply). So it is effectively inert from the outside observer's perspective. In this way, elements defined inside the scoped registry are still private to a degree.

Note that `new`-ing the scoped constructor without the corresponding userland constructor also results in an "inert" component.

### Global patches

To preserve native custom element semantics to the outside world, many globals (e.g. `customElements.define`, `customElements.get`, `HTMLElement`) need to be patched. This introduces the potential for conflicts with native browser behavior, and in some cases the native browser behavior cannot be perfectly emulated.

One example is `observedAttributes` and `attributeChangedCallback`. Because a component only has one chance to communicate its `observedAttributes` to the browser (at `customElements.define()`), a second scoped element with its own `observedAttributes` cannot truly register those attributes to be observed.

However, this library emulates the native browser behavior by overriding `setAttribute` and `removeAttribute` on the second element. It's not a perfect emulation, but it is functionally equivalent.

### Not a "true" polyfill

The goal of this library is not to implement the [Scoped Custom Element Registries](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Scoped-Custom-Element-Registries.md) spec one-to-one. Instead, it tries to provide the minimum API surface necessary to support custom elements that share the same global tag name.

Potentially, you _could_ build a true polyfill on top of `@lwc/scoped-registry`. But that is considered out-of-scope for the library at this time.
