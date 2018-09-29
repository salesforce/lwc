# Status
This is a `draft`, brainstorm is needed

# Error Boundary Components in LWC
JavaScript errors inside components corrupt LWC internal state and cause UI errors visible to users.

## Use Cases
- As an app developer, I can structure my component logic to metigate rendering failures
- As an app developer, I can render an alternative view in the event of component failure
- As an app developer, I will have a piece of mind that corrupted components are not rendered nor interacted with.  Great example from react:
> in a product like Messenger leaving the broken UI visible could lead to somebody sending a message to the wrong person. Similarly, it is worse for a payments app to display a wrong amount than to render nothing


## Proposal

To prevent breakage of an entire UI and to allow component logic to take advantage of alternative view rendering, LWC introduces Error Boundaries. Error Boundaries are LWC's components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback/alternative UI instead of the component tree that crashed. Error boundaries only catch error occured in lifecycle method, such as constructor, render, connectedCallback, renderedCallback, and attributeChangedCallback.

Note that error boundary only catches errors in its children and not in the error boundary itself. If a component fails to catch rendering failure, the error will propagate to the closest error boundary component above. This, too, is similar to how catch {} block works in JavaScript. It is important to note that error caused outside of the lifecycle hooks, such as errors occurring when handling click event, will not result in compoment removal from the DOM.


Error Boundary functionality is inspired by [React 16 new error handling mechanism]:(https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html)
Conditions


```js
## boundary.js

import { LightningElement } from 'lwc';

export default class Boundary extends LightningElement {
    @track error;
    @track info;

    renderedError(error, info) {
        this.error = error;
        this.info = info;
    }
}
```
The renderedError() method works like a JavaScript catch {} block, but for components. Only class components can be error boundaries.


```html
## boundary.html

<template>
    <template if:true={this.error}>
        <x-alternative-view error={this.error} info={this.info}></x-alternative-view>
    </template>
    <template if:false={this.error}>
        <x-offender-component></x-offender-comonent>
    </template>
</template>
```
Then use Boundary component as a wrapper
```html
<x-boundary>
    <x-child></x-child>
</x-boundary>
```


## Examples below illustrate two type of component errors: within rendering lifecycle errors and out-of rendering lifecycle errors.

### Within rendering lifecycle error examples:

#### Error during construction wrapped in Boundary
```html
<template>
    <x-component-a>
        <x-boundary>
            <x-component-b></x-component-b>
        </x-boundary>
    </x-component-a>
</template>
```
Error during construction of  'x-component-b' will result in rendering of an alternative view specified by 'x-boundary', which is x-alternative-view in the example above.
`NOTE: same result will be observed for all rendering cycle methods: renderedCallback, render, attributeChangedCallback.`

#### Error uncaught by the parent component will be propogated to the closest Boundary component
```html
<template>
    <x-component-a>
        <x-boundary>
            <x-component-b>
                <x-component-c></x-component-c>
            </x-component-b>
        </x-boundary>
    </x-component-a>
</template>
```
Rendering Lifecycle error in x-component-c will result in removing of its entire DOM subtree and its wrapping parent. x-alternative-view will be rendered instead of x-component-b and c.

#### Error during construction wrapped in Boundary will not affect boundary siblings
```html
<template>
    <x-component-a>
        <x-boundary>
            <x-component-b></x-component-b>
        </x-boundary>
        <x-component-c></x-component-c>
    </x-component-a>
</template>
```
Error in x-component-b does not affect the rendering of x-component-c. Any sibling of x-boundary component is unaffected.

#### Error during construction of the component not wrapped in the Boundary component
```html
<template>
    <x-component-a>
        <x-component-c></x-component-c>
    </x-component-a>
</template>
```
Default throw behavior will be observed. Component will not be unmounted.


### Out-of rendering lifecycle error example:

#### Error from clicking on the link that causes a crash
```html
<template>
    <x-component-a>
         <x-component-b></x-component-b>
    </x-component-a>
</template>
```
An error caused outside of the rendering cycle, such as event error, either in x-component-a or b, will be observed in the console only. Component will not be unmounted`

NOTE: This behavior is the same regardless if x-component is wrapped in Boundary component or not. Errors outside of rendering cycle do not behave as caught errors.

