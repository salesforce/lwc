# Wire Service

This is the implementation of Raptor's wire service. It enables declarative binding of services to a Raptor component using `@wire` decorator.

A common usage is for a component to declare the data it requires. For example, a component may load data of type `record` like so:

```js
import { Element } from 'engine';
export default class WiredComponent extends Element {
    @api recordId;
    @wire('record', { recordId: '$recordId' })
    record
}
```

Refer to the [Raptor developer guide](https://raptor.sfdc.es/guide/data.html) for full documentation.

## Build & run the playground

For your development convenience, you can build the playground files and launch a Node server:

```bash
yarn start
```

Load the examples in a browser:

```bash
open http://localhost:3000/
```
