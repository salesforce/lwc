# Scoped Slots

## Status

_wip_

## Goals

* Provide a way to pass a _template_ into a slot, which would then have access to properties provided by the child component

## Prior Art

[Scoped Slots in Vue.js](https://vuejs.org/v2/guide/components.html#Scoped-Slots)

## Use cases

* As a component developer, I can provide a way for a consumer to pass templated slots
* As a component developer I can create a list component that allows templated items
* As an app developer I can use lightning components more flexibly

## Simple Example

This example is a list component that supports an optional template for the list item.

### Child Component

```html
<script>
import { LightningElement } from "lwc";
export default class MyComponent extends Element {
  state = {
    items: [
        {
            message: "hello"
            url: "http://salesforce.com"
        }
    ],
  };
}
</script>
<template>
    <ul>
        <li for:each={state.items} for:item="item">
            <slot scope-object={item}>
                {item.message} <!-- default template -->
            </slot>
        </li>
    </ul>
</template>
```

### Parent component

```html
<template>
    <my-component>
        <template scope="props">
            <a href={props.url}>{props.message}</a>
        </template>
    </my-component>
</template>
```

### Result

```html
<ul>
    <li>
        <a href="http://www.salesforce.com">hello</a>
    </li>
</ul>
```

