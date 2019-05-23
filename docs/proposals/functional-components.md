## Status

_withdrawn_

This proposal has been _withdrawn_ with the following resolution:

> We came to the conclusion that functional components in the context of a WC are not valid because the element will still be present, and that element is stateful by nature. Instead, we think that there is still room to implement composition via functions, but those will have to happen at the component's body level rather than at the component level directly. e.g.: compose multiple functions in a custom render method to produce the final fragment that should be added to the body of the element.

## Lightning Web Components Functional Component Definition

Functional components are a considerable lean implementation of a Lightning web component. Its responsibilities are to receive some payload (public props), and should produce a new HTML fragment, which is usually the compiled `<template>` tag module.

## Simple Example

File structure:

```bash
modules/ns/foo/foo.html
modules/ns/foo/foo.js
```

### Template

```html
<template>
    <a href={url}>{name}</a>
    <p>{tagline}</p>
</template>
```

### Declaration

```js
import html from "./foo.html"

export default function (compiler, props) {
    const { name = 'your name', url = '#' } = props;
    return compiler({
        name,
        tagline: 'you can click on the link above',
        url,
    }, html);
}
```
