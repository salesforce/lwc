## Raptor.Element Component Definition

## Simple Example

File structure:

```bash
foo/foo.html
foo/foo.js
```

### Template (foo.html)

```html
<template>
    <a href={url}>{name}</a>
    <p>{tagline}</p>
</template>
```

### Declaration (foo.js)

```js
import html from "./foo.html"

export default class Foo {
    name: 'your name',
    url: '#',

    constructor() {
        this.tagline = 'you can click on the link above';
    }

    render() {
        return html;
    }
};
```

* Public fields (e.g.: `name` and `url`) are considered public properties in the component instance. They can also be used in the template.
* Regular properties defined in the constructor (e.g.: `tagline`) can also be used in the template.
* Changes in public properties (via mutations of the owner component), and changes regular properties might rehydrate the component if they were part of the previous rendering process.

## Example of extending Raptor.Element

If your component requires to touch the DOM, or fires events, or any other DOM specific functionality supported in Raptor Components, you have to extend `Element` from `"raptor"` or any other component that extends that, so you can get access to certain functionality provided by it.

### Declaration

```js
import html from "./foo.html"
import { Element } from "raptor";

export default class Foo extends Element {
    name = 'your name';
    url = '#';

    constructor() {
        super();
        this.tagline = 'you can click on the link above';
    }

    render() {
        return html;
    }

    handleClickEvent(e) {
        e.stopPropagation();
        const event = new CustomEvent('dismiss', {
            bubbles: true,
            cancelable: true,
        });
        this.dispatchEvent(event);
    }
};
```

## Public Properties

By default, if the class definition is going to be process by the Raptor Compiler, it can infer that all public fields are going to be used as the public properties of the component, and their corresponding default value. If the compiler is not available, a static member can be used to manually specify the public properties and their default values. Similarely, if you are extending another Component Definition, you can take care of the aggregation of public properties.

### Specifying Public Properties manually

```js
import html from "./foo.html"

export default class Foo {
    constructor() {
        this.tagline = 'you can click on the link above';
    }

    render() {
        return html;
    }
};

Foo.publicProps = {
    name: 'your name',
    url: '#',
};
```

## Public Methods

By default, if the class definition is going to be process by the Raptor Compiler, it can infer that all public properties decorated with `@method` are going to be used as the public methods of the component. If the compiler is not available, a static member can be used to manually specify the public methods. Similarely, if you are extending another Component Definition, you can take care of the aggregation of public methods.

### Specifying Public Methods manually

```js
import html from "./foo.html"
import { Element } from "raptor";

export default class Foo extends Element {
    constructor() {
        super();
    }

    render() {
        return html;
    }

    focus() {
        this.querySelector('textarea').focus();
    }
};

Foo.publicMethods = ['focus'];
```
