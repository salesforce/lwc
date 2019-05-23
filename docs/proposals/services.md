# Services in Lightning Web Components

Just like the virtual DOM implementation (currently snabbdom) provides hooks for controlling the diffing process of vnodes, we need similar capabilities for component instances. This API is not intended for component authors; it is a high-privilege low-level API for application developers.

__This is the first draft of what we call Lightning Web Components Services.__

## Use Cases

* As an app developer, I can measure the runtime of creation and rendering per component.
* As an app developer, I can provide extension points for the default component declaration format to support new features.

## Proposal

### Registration

Services must be registered to participate in the lifecycle of components. Services must register during application boot so they may be involved in all stages of all components. Because services are an application concern it is expected the application defines which services are available within it.

Services may not be unregistered. A sevice may instead choose not to exhibit behavior at any time.

The following code demonstrates the registration of a new service:

```js
Engine.register({
    declared: (Ctor, def) => {}, // removed from first implementation
    constructed: (cmp, data, def, context) => {}, // removed from first implementation
    connected: (cmp, data, def, context) => {},
    disconnected: (cmp, data, def, context) => {},
    rehydrated: (cmp, data, def, context) => {}
});
```

_Note: the order of registration is important: it dictates the order in which the different services' hooks will be invoked._

### Hooks

Each of the hooks provided via the registration process will be invoked for each component at the relevant lifecycle stage. All hooks are provided the following parameters (except the `declared` hook):

* `cmp`: the component instance
* `data`: TODO
* `def`: the component definition
* `context`: TODO

The available hooks are:

* `declared(Ctor, def)`: Invoked once, the first time a component declaration is inspected by the LWC engine during the internal call to `getComponentDef(Ctor)`. As a result, the `declared` hook will be invoked right after by passing the component declaration (`Ctor`) and the default definition (`def`) of the component declaration after the engine inspects it. This `def` object is mutable and can be used by the service to store more metadata about the declaration.
* `constructed(cmp, data, def, context)`: invoked after the component instance is created by invoking its constructor.
* `connected(cmp, data, def, context)`: invoked after the component instance is appended to the DOM.
* `disconnected(cmp, data, def, context)`: invoked after the component instance is removed from the DOM.
* `rehydrated(cmp, data, def, context)`: invoked after the component instance is re-rendered due to a mutation on its state or its props.

_Note: the hooks are stateless, they return nothing, and they store nothing since they are spliced into functions that will be called directly without context._

### Examples

#### 1. Focusable Decorator

```js
Engine.service({
    declared: (Ctor, def) => {
        if (!Ctor.x) {
            return; // exit fast if there is nothing to do
        }
        // Act if the constructor is marked to be decorated with `x`
        // Assert: Ctor must extends Engine.LightningElement.
        const selector = Ctor.x.selector;
        Ctor.prototype.focus = transferableFocusFactory(selector);
        Ctor.prototype.blur = transferableBlurFactory(selector);
        // expose the two new public methods
        def.publicMethods.push('focus', 'blur');
    },
    constructed: (cmp, data, def, context) => {
        // make sure that the custom element has the right tabindex attribute otherwise add it manually (TBD)
    },
});
```

#### 2. Locker Service

```js
Engine.service({
    declared: (Ctor, def) => {
        if (!CheckIfLockerShouldBeAdded(Ctor)) {
            return;
        }
        // store metadata in def.locker for locker hooks
        // change Ctor.prototype to accomodate locker membrane
    },
    constructed: (Ctor, data, def, context) => {
        if (!def.locker) {
            return;
        }
        ...
    },
    connected: (Ctor, data, def, context) => {
        if (!def.locker) {
            return;
        }
        ...
    },
    disconnected: (Ctor, data, def, context) => {
        if (!def.locker) {
            return;
        }
        ...
    },
});
```

#### 3. Metrics Service

TBD
