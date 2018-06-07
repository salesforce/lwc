# postcss-plugin-lwc

[Postcss](https://github.com/postcss/postcss) plugin to parse and add scoping to CSS rules for Raptor components.

## Features

* Selector scoping to respect Shadow DOM style encapsulation
* Transform `:host` and `:host-context` pseudo-class selectors

## Installation

```
npm install --save-dev postcss-plugin-lwc
```

## Usage

```js
const postcss = require('postcss');
const source = `
:host {
    opacity: 0.4;
}

span {
    text-transform: uppercase;
}
`;

postcss([
    lwcPlugin({
        token: 'x-btn_tmpl'
    })
]).process(source).then(res => {
    console.log(res)
    /*
    [x-btn_tmpl-host] {
        opacity: 0.4;
    }

    span[x-btn_tmpl] {
        text-transform: uppercase;
    }
    */
});
```

## Options

#### `token`

Type: `string`
Required: `true`

A unique token to scope the CSS rules. The rules will apply only to element having the token as attribute.

## Caveats

* No support for [`::slotted`](https://drafts.csswg.org/css-scoping/#slotted-pseudo) pseudo-element.
* No support for [`>>>`](https://drafts.csswg.org/css-scoping/#deep-combinator) deep combinator (spec still under consideration: [issue](https://github.com/w3c/webcomponents/issues/78)).
* Scoped CSS has a non-negligeable performance impact:
    * Each selector chain is scoped and each compound expression passed to the `:host()` and `:host-context()` need to be spread into multiple selectors. This tranformation greatly increases the overall size and complexity of the generated CSS, leading to more bits on the wire, longer parsing time and longer style recalculation.
    * In order to ensure CSS encapsulation, each element needs to add an extra attribute. This increases the actual rendering time.
