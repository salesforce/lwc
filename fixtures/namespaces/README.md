### Aura Markup

```html
<aura:component>
    ...
    <button name="{! v.a }" onclick="{! c.clickHandler }">
        <span>something</span>
    </button>
</aura:component>
```

### Standard Shadow DOM Template + Annotations

```html
<template>
    <button set:name="a" bind:onclick="clickHandler">
        <span>something</span>
    </button>
</template>
```

### Standard Shadow DOM Template + Annotations + Inline Styles

```html
<template>
    <style>
        button {
            color: red;
        }
    </style>
    <button set:name="a" bind:onclick="clickHandler">
        <span>something</span>
    </button>
</template>
```

## CSS

## Standard Shadow DOM CSS

```css
button {
    color: red;
}
```

### Equivalent to existing CSS

```css
.THIS button {
    color: red;
}
```

## Class

```js
export default class {
    foo = 1;
    bar = 2;

    constructor() {
        this.counter = 0;
    }

    clickHandler(event) {
        this.counter += 1;
    }

    @method reset() {
        this.counter = 0;
    }
}
```

```html
<ns:some foo="3" />
```
