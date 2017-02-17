## Raptor Functional Component Definition

Functional components are a considerable lean implementation of a Raptor Component. Its responsibilities are to receive some payload (public props), and should produce a new HTML fragment, which is usually the compiled `<template>` tag module.

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

export default function (props) {
    const { name = 'your name', url = '#' } = props;
    return html({
        name,
        tagline: 'you can click on the link above',
        url,
    });
}
```
