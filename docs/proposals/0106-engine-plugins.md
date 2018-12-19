# RFC: Engine Plugins

## Status

- Start Date: 2018-12-18

## Summary

LWC engine's support for plugging in custom functionality is fragmented today. We have special code paths for wire, locators, and lwc:dom directives. This creates unnecessary code and more importantly, does not give us a good base for opening up user plugins in the future. This proposal aims to consolidate service-related run time protocols.

#### Approaches

### Plugin Data

The first part of this document deals with how the engine consumes wire, locators and lwc:dom data.

Today, locators and lwc:dom directives are defined in the component template and are initialized with the `context` property on the VNode. The `context` property contains all the data needed for the directive to run. Wire, on the other hand, is defined on the component class and is initialized with the `wire` property on the Component Definition.

We should be able to move `ComponentDefinition.wire` into a class context property that serves the same purpose as the VNode context. Consolidating `context` objects from the template and from the component class will be beneficial for the protocol definition.

### Plugin Protocol

The second part of this document lays out the details for the Engine Plugin Protocol.

The engine currently has 5 service hooks:

```
interface ServiceDef {
    wiring?: ServiceCallback;
    locator?: ServiceCallback;
    connected?: ServiceCallback;
    disconnected?: ServiceCallback;
    rendered?: ServiceCallback;
}
```

- `wiring` - invoked at component creationg time
- `locator` - invoked before element "click" handler is executed
- `connected` - invoked sync after a component element has been appended, but before component has rendered (lifecycle service for wire)
- `disconnected` - invoked sync after a component has been disconnected (lifecycle service for wire)
- `rendered` - invoked sync after a component has rendered, but before `renderedCallback` had been called (lifecycle service for wire)

All services hooks are called with the following arguments:
    - component instance
    - VNode data
    - Component Definition
    - VNode Context

The following is a summary of how each service hook uses the arguments passed to it:

## wiring

### component instance
- passed to WireEventTarget
- Invokes methods and populates properties

### vnode data
- Unused

### component definition
- Initialize

### VNode context
- Adds `@Wire` property
    - Adds `CONTEXT_CONNECTED` listener array
        - Array of `connected` event handlers
    - Adds `CONTEXT_DISCONNECTED` listener array
        - Array of `disconnected` event handlers
    - Adds `CONTEXT_UPDATED` Object
        - Array of listeners and values

## locator

### component instance
- unused

### vnode data
- Unused

### component definition
- unused

### VNode context
- accesses `context.locator.resolved` which contains:
    - target: a string identifier, equal to `context.locator.id`
    - host: a string identifier, equal to the locator id for the host element
    - targetContext: return value from specified instance method (optional)
    - hostContext: return value from instance method specified on host (optional)


## connected (wire service lifecycle method)

### component instance
- unused

### vnode data
- Unused

### component definition
- Used to filter components that do not have `wire` defined

### VNode context
- gets `CONTEXT_CONNECTED` callbacks off of `context.@wire`

## disconnected (wire service lifecycle method)

### component instance
- unused

### vnode data
- Unused

### component definition
- Used to filter components that do not have `wire` defined

### VNode context
- gets `CONTEXT_DISCONNECTED` callbacks off of `context.@wire`


Based on existing usages, we can generalize plugins to use the following protocol:

```elementCreated?(element: HTMLElement, context: ServiceContext)```
 - Invoked after the DOM element has been created

```elementWillConnect?(element: HTMLElement, context: ServiceContext)```
 - Invoked immediately before the element will be inserted into the DOM

```elementDidConnect?(element: HTMLElement, context: ServiceContext)```
 - Invoked immediately after the element has been inserted into the DOM

```elementWillDisconnect?(element: HTMLElement, context: ServiceContext)```
 - Invoked immediately before the element will be removed from the DOM

```elementDidDisconnect?(element: HTMLElement, context: ServiceContext)```
 - Invoked immediately after the element has been removed from the DOM

```elementWillRender?(element: HTMLElement, context: ServiceContext)```
 - Invoked immediarely before component renders

```elementDidRender?(element: HTMLElement, context: ServiceContext)```
 - Invoked immediately after the component renders

The first argument for each of these methods is the actual element that is created by the engine. It does not matter if this is a native element or a custom element. They are treated the same.

The second argument, `context` is grabbed from either the template context or the component context detailed in the previous section. This object can be read and mutated by the service as much as it wants. The engine simply controls when the lifecycle methods are called and passes the arguments accordingly.


None of the existing plugins need `elementWillConnect` or `elementWillDisconnect`, but adding these would allow us to generalize engine functionality event more. For example, we could move the performance measurements and potentially component lifecycle callbacks into a plugin themselves. This would essentially make the engine simply the diffing algo + plugins.


### Registering Services

The only change in registering services would require a service id argument. With the service id argument, the engine can make a decision about calling an external service based on data being present:

```
import { register } from 'lwc';
register('locator', { ... });
register('wire', { ... });
```

If an element does not have `locator` data on its context, the locator protocol is never invoked. Likewisem if no `wire` data is defined on context, the protocol will not be invoked. This will simplify plugin code that has to do manual checks today.


## Examples

The following are examples on how existing services might use the plugin protocol:


### Locators
```
import { register } from 'lwc';
const contextMap = new WeakMap();

register('locator', {
    elementCreated(element, locatorContext) {
        contextMap.set(element, locatorContext);
    },
    elementWillConnect(element, locatorContext) {
        const orig = element.addEventListener;
        const hostElement = getHost(element);
        const hostContext = getHost();

        element.addEventListener = function (type, handler, options) {
            if (type === 'click') {
                orig.call(element, type, (evt) => {
                    const resolved = {
                        target        : locatorContext.id,
                        host          : hostContext.id,
                        targetContext : isFunction(context) && context(),
                        hostContext   : isFunction(hostElement.context) && hostElement.context()
                    };
                }, options);
            }

            orig.call(element, type, handler, options);

        }
    }
})

```

### LWC:DOM
```
import { register } from 'lwc';


register('lwc', {
    elementWillConnect(element, locatorContext) {
        if (lwcContext.dom && lwcContext.dom === 'manual') {
            markElementAsPortal(element)
        }
    },
    elementWillDisconnect(element, locatorContext) {
        if (lwcContext.dom && lwcContext.dom === 'manual') {
            disconnectPortal(element);
        }
    }
})

```

### Benchmarks
```
import { register } from 'lwc';

if (process.env.NODE_ENV !== 'production') {
    register('benchmark', {
        elementWillRender(element, locatorContext) {
            startMeasure(element, 'render');
        },
        elementDidRender(element, locatorContext) {
            endMeasure(element, 'render');
        }
    })
}

```
