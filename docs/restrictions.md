# Raptor Restrictions

This document describes a series of restrictions, and limitations of Raptor Elements, and why they are in place. This is mostly intended for authors of LWC components.

## Constructor

When authoring custom element constructors, authors are bound by the following conformance requirements:

* A parameter-less call to `super()` must be the first statement in the constructor body, to establish the correct prototype chain and this value before any further code is run.
* A return statement must not appear anywhere inside the constructor body, unless it is a simple early-return (return or return this).
* The constructor must not use the `document.write()` or `document.open()` methods.
* The element's attributes and children must not be inspected (in some cases none will be present).

In general, work should be deferred to `connectedCallback` as much as possible—especially work involving fetching resources or rendering. However, note that `connectedCallback` can be called more than once, so any initialization work that is truly one-time will need a guard to prevent it from running twice.

In general, the constructor should be used to set up initial state and default values, and to set up event listeners.

## DOM Traversing Restrictions

These are the restrictions that we are imposing up top of the standard set of restrictions imposed by Shadow DOM:

### Nodes

* [x] `node.childNodes` is discouraged since it returns a LiveNode collection. In raptor we force it to return an Array snapshot.

### Elements

* [x] `elm.setAttribute(name, value)` is discouraged if the element is controlled by a template, while `this.setAttribute()` in the component is allowed to add new attributes to the host element.

### Custom Elements

* [x] `this.addEventListener(elm, type, options)` is discouraged if `options` is present because passive and once are not supported at the moment.
* [x] `this.attachShadow()` is executed in the super during construction, and cannot be invoked more than once on the same element.

### Slots

* [ ] `slot.childNodes` is discouraged since it is probably a mistake, instead we recommend using `assignedNodes` or `assignedElements`.

### Shadow Roots

* [x] `this.template.host` is disallowed. This is to prevent walking up the DOM.
* [x] `this.template.ownerDocument` is disallowed. This is to prevent accessing the global document via dot notation.`);
* [x] methods `appendChild`, `removeChild`, `replaceChild`, `cloneNode`, `insertBefore`, `getElementById`, `getSelection`, `elementFromPoint` and `elementsFromPoint` are disallowed.
* [x] `this.template.addEventListener(elm, type, options)` is discouraged if `options` is present because passive and once are not supported at the moment.

All Raptor components are aligned with the idea of a closed shadow root. Users don't have a way to create the shadowRoot, or attach it, that's done by the engine. And as part of the process, we do enforce it to be `closed` otherwise specified. The design goal of a `closed` mode is to disallow any access to content of the custom element from an outside world. As a result, the following APIs are subject to this kind of constraints, and cannot be used by consumers:

 * [x] Element.shadowRoot
 * [x] Element.assignedSlot
 * [ ] Event.composedPath()

## Styles

### Styling Restrictions

* [x] `:root` selector is disallowed inside the component's css.
* [ ] `:slotted` selector is disallowed inside the component's css.
* [ ] `:host-context()` selector is disallowed inside the component's css.

### Styling distributed nodes

In WC, you can attempt to style root elements allocated inside an slot. In Raptor, that's considered a bad practice, and the `slotted` keyword is forbidden inside the CSS for the component. The reason for this is that overriding styles defined by the owner of the slotted element is considered introspection, and therefore it is prompt for breakage.
