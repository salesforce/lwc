# LWC Attribute listening and reflection

## Status

_consensus_

## TL;DR
- `static observableAttributes` and `attributeChangedCallback` removal
- Allow Component authors to define public getter/setter for global HTML attributes
- Opt-out of attribute reflection
- `data-` and `aria-` attributes can no longer be accessed inside of components. They only reflect back to the DOM.

## Description
Global HTML Attributes and public props are often a source of confusion for for LWC developers (and LWC maintainers!). This proposal seeks to remove the concept of attributes in LWC and treat all incoming data as props, regardless of whether they are HTML global attributes. With this goal in mind, below are the proposals for listening to prop changes, reflecting props on the custom element(or not!) and handling of `data-` and `aria-`.

### Attribute reactivity
LWC Attributes are not reactive today. In order to trigger a re-render from an attribute change, component authors have to jump through several hoops to make it happen:

```
export default class MyComponent extends Element {
    @track privateTitle;
    attributeChangedCallback(attrName, oldValue, nextValue) {
        if (attrName === 'title') {
            this.privateTitle = nextValue;
        }
    }

    static observedAttributes = ['title'];
}
```

To fix this, LWC should make HTML attributes reactive by _default_ by creating getters/setters for all global HTML attribute names on the Element prototype (sans data- and aria-, which will be later on in this document):

```
// my-component.js
export default class MyComponent extends Element {

}

// my-component.html
<template>
    <div id={id} title={title}></div>
</template>
```

#### Pros
- No code needed to make attributes reactive

#### Cons
- Requires updating existing components

### Detecting changes to attributes
Today, component authors can.. listen to attribute changes by defining `attributeChangedCallback` coupled with a static `observedAttributes` property:
```
import { LightningElement } from 'lwc';

export default class MyComponent extends LightningElement {
    attributeChangedCallback(attrName, oldValue, nextValue) {
        // some logic here
    }

    static observedAttributes = ['title'];
}
```

With getters and setters defined on the Element prototype, it becomes possible instead for component authors to define their own setters to listen to component changes. It also avoids inheritance-related hazards with `attributeChangedCallback` usage.

```
import { LightningElement } from 'lwc';

export default class MyComponent extends LightningElement {
    @track privateTitle;

    @api
    get title() {
        return this.privateTitle;
    }
    set title(value) {
        // perform side effects
        this.privateTitle = value;
    }
}
```

This completely removes the need for `attributeChangedCallback` at all.

#### Pros
- Uses same approach for detecting changes to attributes and props
- No more long switch statements

#### Cons
- Component authors have to unlearn attributeChangedCallback
- Requires updating existing components
- Non-backwards compatible change that cannot be applied with codemod

### HTML Attribute reflection
There are cases where it is desirable to prevent automatic reflection back to the custom element. If a component author does not define a custom getter/setter for an attribute, the attribute will be reflected back to the custom element by default:

Automatic reflection:
```
export default class MyComponent extends Element { }

// template.html
<template>
    <my-component title="foo"></my-component>
</template>

// output
<div>
    <my-component title="foo"></my-component>
</div>
```

If a component author does define a custom getter/setter for an attribute, then the attribute _will not_ be reflected by default:

```
import { LightningElement } from 'lwc';
export default class MyComponent extends LightningElement {
    @track privateTitle;

    @api
    get title() {
        return this.privateTitle;
    }
    set title(value) {
        // perform side effects
        this.privateTitle = value;
    }
}

// template.html
<template>
    <my-component title="foo"></my-component>
</template>

// output
<div>
    <my-component></my-component>
</div>
```

~~In order to enable attribute reflection for that property, component author can import `@attribute` decorator and apply it to the getter/setter:~~

In order to enable attribute reflection for that property, component author can use `setAttribute` directly in their getter/setter:

```
import { LightningElement } from 'lwc';
export default class MyComponent extends LightningElement {
    @track privateTitle;

    @api
    get title() {
        return this.privateTitle;
    }
    set title(value) {
        // perform side effects
        this.privateTitle = value;
        this.setAttribute('title', value);
    }
}

// template.html
<template>
    <my-component title="foo"></my-component>
</template>

// output
<div>
    <my-component title="foo"></my-component>
</div>
```

#### Pros
- Declarative way to opt-out of attribute reflection
- Much improved accessibility ergonomics

#### Cons
- New decorator
- Possible landmine when defining custom getter/setter with no automatic reflection

### data- and aria- attributes
Defining getters and setters for all possible data- and aria- attributes is not possible, especially since data- attributes are arbitrary. Also, because component authors have access to `@api` to expose setters, `data-` attributes are unnecessary. With this proposal, it will be _impossible_ for component authors to listen and use values from `data-` and `aria-` attributes. They will, however, still reflect out to the DOM:

```
import { LightningElement } from 'lwc';
export default class MyComponent extends LightningElement {
    @api
    get dataFoo() {
        console.log('here');
    }
}

// template.html
<template>
    <my-component data-foo="bar"></my-component>
</template>

// output
<div>
    <my-component data-foo="bar"></my-component>
</div>

// no console
```

#### Pros
- Component authors rely more on `@api` instead of `data-` and `aria-`
- No need to implement `dataSet` inside components
- `data-` and `aria-` can still be passed to native elements/non-LWC custom elements

#### Cons
- New decorator
- Possible landmine when defining custom getter/setter with no automatic reflection


----

## Conclusion:
- Global attribute getters/setters defined on Element.prototype for automatic reactivity and reflection
- Allow component authors to define global attribute getters/setters to detect changes, opt out of reflection
- Removal of `attributeChangedCallback` and `observedAttributes`
- Introduce `setAttribute` and `removeAttribute`
- `data-` and `aria-` attributes cannot be listened to, but accessed via `getAttribute`

