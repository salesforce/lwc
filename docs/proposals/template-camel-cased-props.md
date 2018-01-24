# Template Camel Cased Props

## The problem

With proposal [#14](https://github.com/salesforce/lwc/pull/14), all values defined in template will be applied to elements as props:

```html
<template>
    <!-- tittle is set via div.title = 'hello' -->
    <div title="hello"></div>
</template>
```

According to the HTML template spec and LWC conventions, all attributes must be lowercased. This means that the following will be converted to lowercase automatically by HTML parsers:
```html
<template>
    <div tabIndex="hello"></div>
    <!-- really becomes <div tabindex="hello"></div> -->
</template>
```

How then does the compiler know to set `tabindex` as `tabIndex` on the element?

### Proposal

- At the compiler level, convert all known attributes with corresponding camel cased prop names to their camel cased forms (`tabindex` => `tabIndex`). Call element setter with camel cased name.
- Compiler warns when a component author defines a public prop that maps to a lowercased prop name (for example, defines `tabindex` as opposed to `tabIndex`)

```html
<template>
    <!-- tittle is set via div.tabIndex = '1'. Need to map to camelCase -->
    <div tabindex="1"></div>

    <!-- max value is set via input.maxValue = '100'. -->
    <input maxvalue="100">

    <!-- max value is set via input.maxValue = '100'. -->
    <my-custom-input maxvalue="100"></my-custom-input>
</template>
```

```js
import { Element } from 'engine';

class MyCustomElement extends Element {
    // compiler warning stating that tabindex setter will never be called by the template. Consider renaming.
    @api set tabindex(value) {

    }
}
```

#### Pros
- Compatible with HTML template parsers
- Non-breaking change in template

#### Cons
- We can enforce public prop names in LWC, but if a custom HTML element defines a `tabindex` property, consumers will need to use imperative code to apply change
- More cognitive load on developers. `tabindex` called `tabIndex`?