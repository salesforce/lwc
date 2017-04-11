# Services in Raptor

Just like the virtual DOM implementation (currently snabbdom) provides some hooks for controlling part of the diffing process for vnodes, we need a similar infrastructure for component instances. Keep in mind that this API is not intended to be used by Components Authors, this is intended to be used by the App Developer, and it is a high-privilegue low-level API.

__This is the first draft of what we call Raptor Services.__

## Use Cases

* As an app developer, I can measure the time to create and render per component.
* As an app developer, I can provide extension points for the default component declaration format to support new features.

## Proposal


### Registration

There is a need for a Service Registration process, this process is particular interesting because it is something that you do once, by adding has many services as you want when the app is booting, and you never change it again. In fact, services cannot be unregistered, and if a service wants to be flagged, the service itself can implement its own mechanism to intervene in the component's life-cycle or not. The following code represents the registration of a new service:

```js
Raptor.service({
    declared: (Ctor, def) => {}, // removed from first implementation
    constructed: (cmp, def) => {}, // removed from first implementation
    appended: (cmp, def) => {},
    removed: (cmp, def) => {},
    rehydrated: (cmp, def) => {}
});
```

_note: the registration order do matters, and dictates the order in which the different services' hooks will be invoked._

### Hooks

Each of the hooks provided via the registration process will be invoked at some point during the life-cycle of each component:

* `declared(Ctor, def)`: Invoked once, the first time a component declaration is inspected by the raptor engine during the internal call to `getComponentDef(Ctor)`. As a result, the `declaration` hook will be invoked right after by passing the component declaration (Ctor) and the default definition (`def`) of the component declaration after the engine inspect it. This `def` object is mutable, and can be used by the service to store more meta information about the declaration.
* `constructed(cmp, def)`: after the component instance is created by invoking its constructor, this hook will be invoked, passing the component instance, and the definition object `def` that can be use to access metadata about the component declaration.
* `appended(cmp, def)`: after the component instance is appended to the DOM, this hook will be invoked, passing the component instance, and the definition object `def` that can be use to access metadata about the component declaration.
* `removed(cmp, def)`: after the component instance is removed from the DOM, this hook will be invoked, passing the component instance, and the definition object `def` that can be use to access metadata about the component declaration.
* `rehydrated(cmp, def)`: after the component instance is re-rendered due to a mutation on its state or its props, this hook will be invoked, passing the component instance, and the definition object `def` that can be use to access metadata about the component declaration.

_note: this hooks are stateless, they return nothing, and they store nothing since they are spliced into functions that will be called directly without context._

### Examples

#### 1. Focusable Decorator

```js
Raptor.service({
    declared: (Ctor, def) => {
        if (!Ctor.x) {
            return; // exist fast if there is nothing to do
        }
        // Act if the constructor is marked to be decorated with `x`
        // Assert: Ctor must extends Raptor.Element.
        const selector = Ctor.x.selector;
        Ctor.prototype.focus = transferableFocusFactory(selector);
        Ctor.prototype.focus = transferableBlurFactory(selector);
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
Raptor.service({
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
    appended: (Ctor, data, def, context) => {
        if (!def.locker) {
            return;
        }
        ...
    },
    removed: (Ctor, data, def, context) => {
        if (!def.locker) {
            return;
        }
        ...
    },
});
```

#### 3. Metric Service

TBD
