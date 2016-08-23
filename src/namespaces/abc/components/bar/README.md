### Aura Markup

```html
<aura:component>
    <button name="{! v.a }" onclick="{! c.onclick }">
        <span>something</span>
    </button>
</aura:component>
```

### Standard Shadow DOM Template + Annotations

```html
<template>
    <button name.bind="a" onclick.trigger="onclick">
        <span>something</span>
    </button>
</template>
```
