# @lwc/style-compiler

Transform style sheet to be consumed by the LWC engine.

## Features

- Shadow DOM style scoping:
    - transform `:host` pseudo-class selectors
    - scope all the other selectors using CSS attribute selectors
- Custom Properties: inline replacement of `var()` CSS function
- Right-to-left: transform the `:dir` pseudo class selector to `[dir]` attribute selectors
- CSS import: resolve imports via static ES module imports

## Installation

```sh
yarn add --dev @lwc/style-compiler
```

## Usage

```js
const { transform } = require('@lwc/style-compiler');

const source = `
    :host {
        opacity: 0.4;
    }

    span {
        text-transform: uppercase;
    }
`;

const { code } = transform(source, 'example.css');
```

### API

#### `transform(source, id, options)`

**Options:**

- `source` (string, required) - the css source file to compiler
- `id` (string, required) - the css source file path, used by the compiler to produce errors with the file name
- `options` (object, optional)
    - `customProperties` (object, optional)
        - `resolverModule` (boolean, optional) - module name for the custom properties resolve
    - `scoped` (boolean, optional) - true if the styles are scoped (via Light DOM style scoping)
    - `disableSyntheticShadowSupport` (boolean, optional) - true if synthetic shadow DOM support is not needed, which can result in smaller output
    - `apiVersion` (number, optional) - API version to associate with the compiled stylesheet.

**Return:**

- `code` - the generated code

Note: The LWC style compiler doesn't preserve the authored format, and always produce compressed code.

## Selector scoping caveats

- No support for [`::slotted`](https://drafts.csswg.org/css-scoping/#slotted-pseudo) pseudo-element.
- No support for [`>>>`](https://drafts.csswg.org/css-scoping/#deep-combinator) deep combinator (spec still under consideration: [issue](https://github.com/w3c/webcomponents/issues/78)).
- No support for [`:host-context`](https://drafts.csswg.org/css-scoping/#selectordef-host-context) pseudo-selector (browser vendors are not able to agree: [webkit](https://bugs.webkit.org/show_bug.cgi?id=160038), [gecko](https://bugzilla.mozilla.org/show_bug.cgi?id=1082060))
- This transform duplicates the `:host` selector to able to use the generated style in both the synthetic and native shadow DOM. The duplication is necessary to support the functional form of `:host()`, `:host(.foo, .bar) {}` needs to get transformed into `.foo[x-btn-host], .bar[x-btn-host] {}` to work in the synthetic shadow DOM.
- Scoped CSS has a non-negligeable performance impact:
    - Each selector chain is scoped and each compound expression passed to the `:host()` need to be spread into multiple selectors. This transformation greatly increases the overall size and complexity of the generated CSS, leading to more bits on the wire, longer parsing time and longer style recalculation.
    - In order to ensure CSS encapsulation, each element needs to add an extra attribute. This increases the actual rendering time.
