# Wire Service

This is the implementation of Raptor's wire service. It enables declarative binding of services to a Raptor component using the `@wire` decorator.

A common usage is for a component to declare the data it requires. For example, a component may load data of type `todo` like so:

```js
import { Element, api, wire } from 'engine';
export default class WiredComponent extends Element {
    @api todoId;
    @wire('todo', { id: '$todoId' })
    todo
}
```

Refer to the [Raptor developer guide](https://docs.lwcjs.org/guide/data.html) for full documentation.

## Build & run the playground

For your development convenience, you can build the playground files and launch a Node server:

```bash
yarn start
```

Load the examples in a browser:

```bash
open http://localhost:3000/
```
