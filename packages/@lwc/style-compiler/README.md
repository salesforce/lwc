# lwc-style-compiler

Transform style sheet to be consumed by the LWC engine.

<!-- [Postcss](https://github.com/postcss/postcss) plugin for LWC components styles.

## Features

* Selectors
    * Scoping CSS selectors to enforce Shadow DOM style encapsulation
    * Transform `:host` pseudo-class selectors
* Custom Properties
    * Inline replacement of `var()` CSS function

## Installation

```
npm install --save-dev postcss-plugin-lwc
```

## Usage

```js
const postcss = require('postcss');
const lwcPlugin = require('postcss-plugin-lwc');

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
        hostSelector: '[x-btn-host]',
        shadowSelector: '[x-btn]',
    })
]).process(source).then(res => {
    console.log(res)
    /*
        :host {
            opacity: 0.4;
        }

        [x-btn-host] {
            opacity: 0.4;
        }

        span[x-btn] {
            text-transform: uppercase;
        }
    */
});
```

## Options

#### `hostSelector`

Type: `string`
Required: `true`

A unique selector to scope the styles on the host element.

#### `shadowSelector`

Type: `string`
Required: `true`

A unique selector to scope the styles on the shadow DOM content.

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

* CSS selectors using [Global HTML attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes), [data-* attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-*) and [aria-* attributes](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) are allowed.
* Usage of attributes are only allowed in compound selectors with known tag selectors.

```css
[hidden] {}                 /* ✅ OK - global HTML attribute selector */
x-btn[hidden] {}            /* ✅ OK - global HTML attribute selector */

[data-foo] {}               /* ✅ OK - data-* attribute selector */

[aria-hidden="true"] {}     /* ✅ OK - aria-* attribute selector */

[min=0] {}                  /* 🚨 ERROR - the compound selector is not specific enough */
input[min=0] {}             /* ✅ OK - "min" attribute is a known special attribute on the "input" element */
x-btn[min=0] {}             /* 🚨 ERROR - invalid usage "min" attribute on "x-btn" */
```

## Selector scoping caveats

* No support for [`::slotted`](https://drafts.csswg.org/css-scoping/#slotted-pseudo) pseudo-element.
* No support for [`>>>`](https://drafts.csswg.org/css-scoping/#deep-combinator) deep combinator (spec still under consideration: [issue](https://github.com/w3c/webcomponents/issues/78)).
* No support for [`:host-context`](https://drafts.csswg.org/css-scoping/#selectordef-host-context) pseudo-selector (browser vendors are not able to agree: [webkit](https://bugs.webkit.org/show_bug.cgi?id=160038), [gecko](https://bugzilla.mozilla.org/show_bug.cgi?id=1082060))
* This transform duplicates the `:host` selector to able to use the generated style in both the synthetic and native shadow DOM. The duplication is necessary to support the functional form of `:host()`, `:host(.foo, .bar) {}` needs to get transformed into `.foo[x-btn-host], .bar[x-btn-host] {}` to work in the synthetic shadow DOM.
* Scoped CSS has a non-negligeable performance impact:
    * Each selector chain is scoped and each compound expression passed to the `:host()` need to be spread into multiple selectors. This transformation greatly increases the overall size and complexity of the generated CSS, leading to more bits on the wire, longer parsing time and longer style recalculation.
    * In order to ensure CSS encapsulation, each element needs to add an extra attribute. This increases the actual rendering time. -->
