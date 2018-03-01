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

## Styles

### Styling distributed nodes

In WC, you can attempt to style root elements allocated inside an slot. In Raptor, that's considered a bad practice, and the `slotted` keyword is forbiden inside the CSS for the component. The reason for this is that overriding styles defined by the owner of the slotted element is considered instrospection, and therefore it is prompt for breakage.

### A closed shadow root

All Raptor components are aligned with the idea of a closed shadow root. Users don't have a way to create the shadowRoot, or attach it, that's done by the engine. And as part of the process, we do enforce it to be `closed`. The design goal of a `closed` mode is to disallow any access to content of the custom element from an outside world. As a result, the following APIs are subject to this kind of constraints, and cannot be used by consumers:

 * Element.shadowRoot
 * Element.assignedSlot
 * Event.composedPath()
