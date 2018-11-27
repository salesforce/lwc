# lwc-test-utils

A collection of utility functions to assist in unit testing Lightning web components.

## Usage

Usage of this library assumes you have the a Lightning Web Component development and test environment setup. To get started with testing your Lightning web components see the [documentation website](https://internal.lwcjs.org/guide/testing.html).

### Direct Import

Add this package as a devDependency and import the utils directly into your test.

```bash
yarn add -D '@lwc/test-utils'
```

In your test:

```js
import { getShadowRoot } from '@lwc/test-utils';

// create element under test and query for custom element in the Shadow DOM
const element = createElement('my-custom-component', { is: MyCustomComponent });
document.body.appendChild(element);
const shadowRoot = getShadowRoot(element);
const fancyButton = shadowRoot.querySelector('fancy-button');
```

### Jest Preset Configuration

This util also comes pre-packed in `lwc-jest-preset`.

```bash
yarn add -D 'lwc-jest-preset'
```

In your `package.json`:

```json
"jest": {
    "preset": "lwc-jest-preset",
    "moduleNameMapper": {
        "^(mynamespace)-(.+)$": "<rootDir>/src/$1/$2/$2"
    }
}
```

Or in `jest.config.js`:

```js
const PRESET_CONFIG = require('lwc-jest-preset');
module.exports = {
    ...PRESET_CONFIG,
    moduleNameMapper: {
        ...PRESET_CONFIG.moduleNameMapper,
        '^(mynamespace)-(.+)$': '<rootDir>/src/$1/$2/$2'
    },
};
```
