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
    <button name.bind="a" onclick.trigger="onclick">
        <span>something</span>
    </button>


    <foo if.something="a">something</foo>
    <span if.something="a">another</span>
</template>
```
