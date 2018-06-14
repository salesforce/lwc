# RFC: Locators

## Status

DRAFT

## Summary

We want to be able to track interactions such as clicks that take place within our wep apps and log them.
Those interactions should have some identifiers associated with them. Ideally this metadata should
be close to the ui element that's responsible for the interaction. We want to be able to uniquely
identify elements on a page

We could naively look at the DOM node hierarchy up to body from the element that was clicked on,
but that will be prone to changing more frequently. Any changes in the dom structure, or
components moved around on the page will make it fragile.

To resolve that, we introduced the concept of locators in aura. Locators exist in aura today.
They are meant for internal consumption only and are documented [here](https://docs.google.com/document/d/1dyoUJEmMAhUcth4NdSH65_yPlkjH0lZp_ABGeSxZWJI/view#heading=h.8am7sfx6jcfc).

The goal is that you can use a locator to uniquely identify an element on the page. This is
achieved by looking at up to 2 levels of components in the lexical scope of the html element
that was interacted with. The component at each level can contribute context information in the
form of string key value pairs.

The additional benefit is that we get a static inventory of locators and how the locators are
composed to form interactions. We can use this to generate a catalog and to track certain changes
to locators and their composition. This can help with governance for things such as naming schemes.
The table below shows the final interaction that's logged combining locator information from
components in the hierarchy

|Field      |Description                                                                                |
|---	    |---                                                                                        |
|target	    |ID of the element that handled the actual click event                                      |
|scope	    |ID of the shadow tree boundary host of target element set by the consumer of root host web component   |
|context	|An object of string-string key value pairs that include additional context for the interation. The target and scope can each contribute to the context	|



# Syntax

In this section we define some syntax for what it will look like to use locator

particularly the element that will handle the click will need to have a locator on it.
Also it's parent (shadow-tree boundary) must have a locator tag on it as well.

The locator tag is applied to an html / custom element. It has the following fields

* `locator:id`         - Short descriptive identifier for locator. E.g. `play-button`
* `locator:context`    - [Optional] Function to call to log additional
                            context about the interaction

[Not doing in 218 - Might consider in the future]
* `locator:contextvar` - [Optional] Useful when working with `for:each`.
                          Can be used to bind additional variable to be passed on to
                          the locator:context generation function.
                          Requires `locator:context` to be present

# Examples
## Example 1 - Basic

To track an interaction, locator information from 3 elements comes into play. In this
example we'll see how the components get involved

### x/player-control
```html
<template>
    <button locator:id="play-button" locator:context={buttonClickContext}
            onclick={handleButtonClick}>
        Click Me! {buttonType}
    </button>
<script>
import { LightningElement } from 'lwc';
export default class PlayerControl extends LightningElement {
    @api controlType;

    handleButtonClick(e) {
        console.log("Play button clicked", e);
    }

    buttonClickContext() {
        return {
            "devNameOrId": this.controlType.toString()
        };
    }
}
</script>
</template>
```

### x/player
```html
<template>
    <div>Video Player</div>
    <x-player-control controlType="Simple"
                      locator:id="left-control" locator:context={playerContext}>
    </x-player-control>
    <x-player-control controlType="Other"
                      locator:id="right-control" locator:context={playerContext}>
    </x-player-control>
<script>
import { LightningElement } from 'lwc';
export default class Player extends LightningElement {
    @api playerId;

    handleButtonClick(e) {
        console.log("Play button clicked", e);
    }

    buttonClickContext() {
        return {
            "playerId": this.playerId.toString()
        };
    }
}
</script>
</template>
```

When the `button` with locator:id `play-button` is clicked in `x-player-control`, on the left control,
the following elements are involved in generating the interaction

1. Locator on the `button` element.
2. Context provided by the `x-player-control`
3. Locator id and context set by `x-player` on `x-player-control`

The following resolved interaction is generated from that click
```json
{
    "target"  : "play-button", // locator:id of button in x-player-control
    "scope"   : "left-control", // locator:id of x-player-control in x-player
    "context" : {
        "devNameOrId" : "Simple", // context key from x-player-control
        "playerId"    : "1a2b3c" // context key from x-player
    }
}
```

### Compiled output

Let's focus in on parts of the compiled output of 2 elements
1. The button within `x-player-control` and
2. The use of `x-player-control` within `x-player`

```javascript
// button in x-player-control
api_element("button",
on: {
    "click": _m1 || ($ctx._m1 = locator_listener_bind("play-button", $cmp.handleClick, $cmp.buttonClickContext))
}
})

// x-player-control in x-player
api_custom_element("x-player-control", PlayerControl, {
props: {
  "__$$locator": _m0 ||
                ($ctx._m0 = locator_info_bind("container-parent", $cmp.containerParentContext))
}});
```

## Example 2 - Items within an iteration
In this example we have an item within an iteration that has a locator.

The context for the locator comes from the individual iteration item.
The handler on clickable item is at the component level
```html
<template> <!-- x-cmp -->
<ol>
    <template for:each={state.todos} for:item="todo" for:index="index">
        <li key={todo.id}>
            <!-- click handler is at component level. context is iteration item todo -->
            <button onclick={clickHandler}
                    locator:id="todo-item" locator:context={todo.locatorProvider}>
                {todo.text}
            </button>
        </li>
    </template>
</ol>
<script>
import { LightningElement } from 'lwc';
export default class Cmp extends LightningElement {
    state = {
        todos: [{ id: 1, text: "Todo Item 1",
                         locatorProvider: () => { return {"item": 1} } },
                { id: 2, text: "Todo Item 2",
                         locatorProvider: () => { return {"item": 2} } }]
    }

    clickHandler(e) {
        console.log("Todo item clicked", e);
    }
}
</script>
</template>
```
### Complied output
```javascript
api_iterator($cmp.state.todos, function (todo, index) {
    return api_element("li", {
        key: api_key(5, todo.id)
    }, [api_element("button", {
        props: {
            // not memoized just like click handlers because handler is
            // bound to an iteration item
            "__$$locator": locator_info_bind("todo-item", todo.locatorProvider)
        },
        key: 4,
        on: {
            // memoized as usual because it's bound to component handler
            "click": _m0 || ($ctx._m0 = locator_listener_bind($cmp.clickHandler))
        }
    }, [api_dynamic(todo.text)])]);
})
```

## Example 3 - Item within a slot
Here we will have 3 components that come into play
1. `x-child` it has a slot
2. `x-parent` which is using `x-child` and inserts a button in the slot of `x-child`
3. `x-grandparent` which is using `x-parent`

*Child*
```html
<template> <!-- x-child -->
    <div>Slot below in child</div>
    <slot></slot>
</template> <!-- js doesn't matter for this example -->
```

*Parent*
```html
<template> <!-- x-parent -->
    <x-child>
        <button onclick={parentButtonClick}
                locator:id="button-in-parent" locator:context={parentButtonContext}>
            Button in slot inside x-child
        </button>
    </x-child>
<script>
import { LightningElement } from 'lwc';
export default class Parent extends LightningElement {
    @api parentstate;

    parentButtonClick(e) {
        console.log("Button clicked in slot. parent has handler", e);
    }

    parentButtonContext() {
        return {
            "parentContext": this.parentstate.toString()
        };
    }
}
</script>
</template>
```

*Grandparent*
```html
<template> <!-- x-grandparent -->
    <x-parent parentstate="foo"
              locator:id="parent-gp" locator:context={grandParentContext}>
    </x-parent>
</template>
<script>
import { LightningElement } from 'lwc';
export default class Grandparent extends LightningElement {
    // ... this internal state var can change
    // ... how that happens isn't relevant to this example
    someInternalStateVar
    // ...
    grandParentContext() {
        return {
            "grandparentState": this.someInternalStateVar.toString()
        };
    }
}
</script>
```

The following resolved interaction is generated from clicking on the `button` in `x-child`
```json
{
    "target"  : "button-in-parent", // locator:id of injected into slot of x-child by x-parent
    "scope"   : "parent-gp", // locator:id of x-parent in x-grandparent
    "context" : {
        "parentContext" : "foo", // context key from x-parent
        "grandparentState"    : "someInternalStateVar string rep." // context key from x-grandparent
    }
}
```

_**Note**_: The child component doesn't participate in formation the iteraction. It's only the
button in the parent markup, the parent and the grandparent.

### Compiled output
Here we focus on passing in a button with a click handler to the slot in child
from parent
```javascript
// part of x-parent creating x-child and passing in a button with a click
// handler to the slot
api_custom_element("x-child", Root, {}, [api_element("button", {
  props: {
    "__$$locator": _m0 ||
    ($ctx._m0 = locator_info_bind("button-in-parent", $cmp.parentButtonContext))
  },
  key: 2,
  on: {
    "click": _m1 || ($ctx._m1 = locator_listener_bind($cmp.parentButtonClick))
  }
}, [api_text("Button in slot inside x-child")])])
```

## Compiled engine functions

The particular parts here are `[l]ocator_[i]nfo_bind` and `[l]ocator_[l]istener_bind`

## locator_info_bind
This creates a function closure that has information on all the `locator:` tags from the markup.

Calling that function will return an object with the id and context calculated by calling the
locator:context function.

## locator_listener_bind

If a onclick handler is present along with a locator:id tag, then the onclick
handler needs to be intercepted.

`locator_listener_bind` first fires a `LWCLocator` CustomEvent on the document node
with locator information from the target and host element.

It then calls the original `api_bind` wrapped onclick handler function.

### LWCLocator CustomEvent - Communicating generated locator

This allows logic to log interaction events to exist outside of the LWC Engine.
The `LWCLocator` event should be handled at the document level. It's dispatched on the document
element and it does not bubble.

The event contains the following detail payload

```javascript
{
    target,// target element with onclick handler
    host, // host element for target
    key // locator function lookup key on the element
}
```

