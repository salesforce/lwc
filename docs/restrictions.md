 # Lightning Web Components Restrictions

This document describes a series of restrictions, and limitations of Lightning Web Components Elements, and why they are in place. This is mostly intended for authors of LWC components.

## Components Restrictions

When authoring a component, authors are bound by the following conformance requirements:

### Constructor

* A parameter-less call to `super()` must be the first statement in the constructor body, to establish the correct prototype chain and this value before any further code is run.
* A return statement must not appear anywhere inside the constructor body, unless it is a simple early-return (return or return this).
* The constructor must not use the `document.write()` or `document.open()` methods.
* The element's attributes and children must not be inspected (none will be present).

In general, work should be deferred to `connectedCallback` as much as possible—especially work involving fetching resources or rendering. However, note that `connectedCallback` can be called more than once, so any initialization work that is truly one-time will need a guard to prevent it from running twice.

In general, the constructor should be used to set up initial state and default values, and to set up event listeners.

### Global HTML Attributes and Properties

* [x] `this.setAttribute()` is discouraged for non-standard or experimental attribute names.
* [x] ambiguous properties that are equal to standard properties (when comparison is not case-sensitive) will not be allowed. (E.g.: `tagindex`, because the standard `tagIndex` is implemented by `LightningElement`).
* [ ] `className` property is banned in favor of `this.classList`.
* [ ] interacting with `class` attribute via `this.setAttribute`, `this.getAttribute` and `this.removeAttribute` is banned in favor of `this.classList`.
* [x] `this.shadowRoot` in the component is always `null` in favor of `this.template`.

### LightingElement Public API

* [x] When extending `LightningElement`, you can use the following methods: `dispatchEvent`, `addEventListener`, `removeEventListener`, `setAttributeNS`, `removeAttributeNS`, `removeAttribute`, `setAttribute`, `getAttribute`, `getAttributeNS`, `getBoundingClientRect`, `querySelector` and `querySelectorAll`
* When extending `LightningElement`, you can use the following accessor: `tagName` and `classList`, plus all global HTML properties, and all aria properties specified by AOM.

## DOM Traversing Restrictions

These are the restrictions that we are imposing up top of the standard set of restrictions imposed by Shadow DOM:

### Nodes

* [x] `node.childNodes` is discouraged since it returns a LiveNode collection. In LWC we force it to return an Array snapshot.

### Elements

* [x] `elm.setAttribute(name, value)` is discouraged if the element is controlled by a template, while `this.setAttribute()` in the component is allowed to add new attributes to the host element.

### Custom Elements

* [x] `this.addEventListener(elm, type, options)` is discouraged if `options` is present because passive and once are not supported at the moment.
* [x] `this.attachShadow()` is executed in the super during construction, and cannot be invoked more than once on the same element.
* [ ] enable `this.getElementByTagName`.

### Slots

* [ ] `slot.childNodes` is discouraged since it is probably a mistake, instead we recommend using `assignedNodes` or `assignedElements`.

### Shadow Roots

* [x] `this.template.ownerDocument` is disallowed. This is to prevent accessing the global document via dot notation.`);
* [x] methods `appendChild`, `removeChild`, `replaceChild`, `cloneNode`, `insertBefore`, `getElementById`, and `getSelection` are disallowed.
* [x] `this.template.addEventListener(elm, type, options)` is discouraged if `options` is present because passive and once are not supported at the moment.
* [ ] enable `this.template.getElementByTagName`.
* [ ] `this.template.firstChild` and `this.template.lastChild` are disallowed to support auto-insertion of styles when needed.

LWC components will not allow users to manually create or attach shadow roots, that's done by the engine. And as part of the process, we will create the shadow root with `open` mode unless otherwise specified. As a result of disallowing manual creation, the following APIs cannot be used by consumers:

 * [x] Element.attachShadowRoot
 * [ ] Event.composedPath()

## Styles

### Styling Restrictions

* [x] `:root` selector is disallowed inside the component's css.
* [ ] `:slotted` selector is disallowed inside the component's css.
* [ ] `:host-context()` selector is disallowed inside the component's css.

### Styling distributed nodes

In WC, you can attempt to style root elements allocated inside an slot. In Lightning Web Components, that's considered a bad practice, and the `slotted` keyword is forbidden inside the CSS for the component. The reason for this is that overriding styles defined by the owner of the slotted element is considered introspection, and therefore it is prompt for breakage.

## Events Restrictions

* [ ] `event.currentTarget` when currentTarget is the `shadowRoot` instance, it disallowed.
