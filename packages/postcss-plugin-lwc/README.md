# postcss-plugin-lwc

[Postcss](https://github.com/postcss/postcss) plugin for LWC components styles.

## Features

* Selectors
    * Scoping CSS selectors to enforce Shadow DOM style encapsulation
    * Transform `:host` and `:host-context` pseudo-class selectors
* Custom Properties
    * Inline replacement of `var()` CSS function

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

### `customProperties`

Type: `object`
Required: `false`

#### `customProperties.allowDefinition`

Type: `boolean`
Required: `false`
Default: `true`

When `false` the plugin will throw an error if a custom property is defined in the stylesheet.

```js
lwcPlugin({
    // ... other options
    customProperties: {
        allowDefinition: false
    }
});
```

```css
:host {
    --bg-color: red;
/*  ^ PostCSS Error - Invalid custom property definition for "--bg-color" */
}
```

#### `customProperties.transformVar`

Type: `(name: string, fallback?: string): string`
Required: `false`
Default: `undefined`

Hook that allows to replace `var()` function usage in the stylesheet. The `transformVar` function receives a custom property name and a fallback value, to be used when custom property does not exist. The resulting string is then inserted into generated stylesheet.

```js
lwcPlugin({
    // ... other options
    customProperties: {
        transformVar(name, fallback) {
            if (name === '--lwc-bg') {
                return 'red';
            } else {
                return fallback;
            }
        }
    }
});
```

```css
div {
    background-color: var(--lwc-bg);
    color: var(--lwc-color, purple);
}

/* becomes */

div {
    background-color: red;
    color: purple;
}
```

## Attribute usage restrictions

Since LWC uses the HTML attribute syntax to define properties on components, it will be misleading to use attribute selectors when styling a component. For this reason the CSS transform restricts the usage of CSS attribute selectors.

* CSS selectors using [Global HTML attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes) are allowed.
* Usage of attributes are only allowed in compound selectors with known tag selectors

```css
[hidden] {}         /* ✅ OK - global HTML attribute selector */
x-btn[hidden] {}    /* ✅ OK - global HTML attribute selector */

[min=0] {}          /* 🚨 ERROR - the compound selector is not specific enough */
input[min=0] {}     /* ✅ OK - "min" attribute is a known special attribute on the "input" element */
x-btn[min=0] {}     /* 🚨 ERROR - invalid usage "min" attribute on "x-btn" */
```

## Selector scoping caveats

* No support for [`::slotted`](https://drafts.csswg.org/css-scoping/#slotted-pseudo) pseudo-element.
* No support for [`>>>`](https://drafts.csswg.org/css-scoping/#deep-combinator) deep combinator (spec still under consideration: [issue](https://github.com/w3c/webcomponents/issues/78)).
* Scoped CSS has a non-negligeable performance impact:
    * Each selector chain is scoped and each compound expression passed to the `:host()` and `:host-context()` need to be spread into multiple selectors. This tranformation greatly increases the overall size and complexity of the generated CSS, leading to more bits on the wire, longer parsing time and longer style recalculation.
    * In order to ensure CSS encapsulation, each element needs to add an extra attribute. This increases the actual rendering time.
