# Platform Metadata

## Goal

Define a way to signal when a Lightning Web Components bundle is global (platform available), plus the mimimum set of metadata required by our platform to operate.

## Requirements

* Description
* Minimum Version
* Maximum Version

## Proposals

### Proposal 1: Descriptor File `lightning.json`

```json
{
    "description": "some text",
    "minVersion": "1",
    "maxVersion": "2"
}
```

Pros:
* Simple
* Prior art on all tools who define their own file (e.g.: lerna.json)
* Can work well with other similar files in the future.

Cons:
* Propietary API, but we are talking about salesforce platform here, so?

### Proposal 2: Descriptor File package.json (no-go: too confusing)

```json
{
    "name": "something",
    "description": "some text",
    "module": "new.js",
    "salesforce": {
        "minVersion": "1",
        "maxVersion": "2"
    }
}
```

Cons:
* We want to eventually support `package.json` but not now.
* Potential conflicts with other tools.
* Hard to restrict what they can do in `package.json` since it is very well known.

###  Proposal 3: Comment on Class Declaration


```js
// @platform min=1, max=2
import { LightningElement } from "lwc";
export default class Foo extends Element {
    // ...
}
```

Similar to eslint flags:

Pros:
* easy to understand
* prior art

Cons:
* Hard to parse
* Hard to enforce
* Confusing (what if you have that in more than one file in the same bundle?)
* Error prompt (copy and paste files make you trip easily)

### Resolution

We have decided to go with Proposal 1.

## Versioning

It seems that somehow a runtime forking logic might be needed. We haven't found problems like this, but if they arrise, we better be prepared.

### Proposal 1: Runtime Logic Fork on Version

```js
import { LightningElement } from "lwc";
export default class Foo extends Element {
    handleClick() {
        if (this.version === 23) {
            this.dispatchEvent(new CustomEvent('expand', { bubbles: true }));
        }
    }
}
```

In this case, `Element` implements a getter for `version` that can come from the vnode instantiation process. This should be fairly simple to implement, we just need, somehow, that the compiler provides a `vnode.data.version` value as part of the instance creation mechanism for custom elements, so `Element` can surface that value at runtime, e.g.:

```js
export function html(cmp, api, slotset, memoizer) {
    return [
        api.c('x-foo', { data: { props: { x: 1 }, version: 30 } })
    ];
}
```

This will prevent false possitive breakages when a developer makes a mistake, or assumes that something is not defined, or do not expect events coming from a custom element, where a new version of the custom element, while still backward compatible, breaks the wrong assumptions of the consumer.

## Open Questions

* What about other extensions? `json` or `xml`, and in this case we favor `json`.
* What else is needed by Console and other tools? Nothing for 210 it seems.
* Can external developers define this metadata? Yes, something equivalent is needed. Version is stored today in the DB it seems.
* What about design metadata? It seems that it should be folded into `lightning.json`
* How to specify support level? It is only used by the docs at the moment, maybe we can keep it that way.
* What about pilot? It seems that pilot is not a support level, but an access check, you should only see certain components if you sign a piece of paper.

## Annexes

* [Lightning Web Components Access Checks](https://docs.google.com/document/d/1o6TJQ-rle-BLwOK7kh73lY5Um5O6lWM-sypOrJa0N68/edit#heading=h.x7bydnvqngs9)
