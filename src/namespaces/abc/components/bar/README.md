### Aura Markup

```html
<aura:markup>
    <button name="{! v.a }" onclick="{! c.onclick }">
        <span>something</span>
    </button>
</aura:markup>
```

### Standard Shadow DOM Template + Annotations

```html
<template>
    <style>
        button {
            color: red;
        }
    </style>
    <button name.bind="a" onclick.trigger="onclick">
        <span>something</span>
    </button>
</template>
```


## CSS

```css
button {
    color: red;
}
```

## Class

```js
import { attribute, method } from "aura";

export default class {
    @attribute();
    foo = 1;
    @attribute();
    bar = 2;

    constructor() {
        this.counter = 0;
    }

    onclick(event) {
        this.counter += 1;
    }

    @method()
    reset() {
        this.counter = 0;
    }
}
```

```html
<ns:some foo="3" />
```
