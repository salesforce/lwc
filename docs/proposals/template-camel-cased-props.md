# Template Camel Cased Props

## The problem

With proposal [#14](https://github.com/salesforce/lwc/pull/14), all values defined in template will be applied to elements as props:

```html
<template>
    <!-- tittle is set via div.title = 'hello' -->
    <div title="hello"></div>
</template>
```

According to the HTML template spec and LWC conventions, all attributes must be lowercased. This means that the following will throw a parse error:
```html
<template>
    <div tabIndex="hello"></div>
    <!-- error -->
</template>
```

How then does the compiler know to set `tabindex` as `tabIndex` on the element?

### Proposal

- At the compiler level, convert all attributes to their camel cased form (including AOM properties). This will happen via a lookup (`tabindex` => `tabIndex`, `aria-describedby` => `ariaDescribedBy`) or calculation (`accept-charset` => `acceptCharset`). The prop name setter is what will get called at run time.
- Compiler warns when a component author defines a public prop that maps to a known attribute name (for example, defines `tabindex` as opposed to `tabIndex`)

```html
<template>
    <!-- title is set via div.tabIndex = '1'. Need to map to camelCase -->
    <div tabindex="1"></div>

    <!-- max value is set via input.maxValue = '100'. -->
    <input maxvalue="100">

    <!-- max value is set via input.maxValue = '100'. -->
    <my-custom-input maxvalue="100"></my-custom-input>
</template>
```

```js
import { LightningElement } from 'lwc';

class MyCustomElement extends LightningElement {
    // runtime warning stating that tabindex setter will never be called by the template. Consider renaming.
    @api set tabindex(value) {

    }
}
```
### Gotchas
- data-* attributes are not to be converted to camel case. These attributes will never execute a setter.

#### Pros
- Compatible with HTML template parsers
- Non-breaking change in template

#### Cons
- We can enforce public prop names in LWC, but if a custom HTML element defines a `tabindex` property, consumers will need to use imperative code to apply change
- More cognitive load on developers. `tabindex` called `tabIndex`?
