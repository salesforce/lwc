
The suspend protocol can be baked into the wire protocol initially, so a wire adapter can signal to suspense the component's rendering mechanism (via the `SuspenseEvent`), to force the component to wait until the data
is available to render the first time. 

```js
import { register, SuspenseEvent } from 'wire-service';
register(getTodo, function getTodoWireAdapterFactory(eventTarget) {
    let config;

    eventTarget.addListener('config', (newConfig) => {
        if (config === undefined) {
            // this will force the component to wait until the data is set via ValueChangedEvent
            eventTarget.dispatchEvent(new SuspenseEvent());
        }
        config = newConfig;
    });

    // ....
});
```

Of course, this new feature not only enable the `SuspenseEvent` to be used on the server side, but anywhere else where the adapter decides to rely on it, it could also be configured by the consumer of the adapter somehow, this seems to be very flexible to begin with.

A potential problem here is that by using a particular adapter, the component author will have to protect itself, making the component a lot more defensive because public API calls, and connected callback are not longer enough signal to determine whether or not the shadow was already populated with the selected template. Something to keep in mind.

Open Questions:

* How is in control of the suspense configuration? the global configuration? the component author? the adapter author?

### Proposal: WireAdapter Configuration (and default configuration)

These has two folds, a) how a wire adapter can be configured in a way that the user has more control over the wire flow, and b) how a wire adapter can have more control over the component?

```js
import { LightningElement, wire } from '@lwc';
import { getTodo, refreshTodo } from 'todo-wire-adapter';
export default class TodoViewer extends LightningElement {
    @api id;
    // Wire identifier is the imported callable getTodo
    @wire(getTodo, { id: '$id' }, {
        timeout: 1000, // should default to 1 second
        attemptToRefresh: 36000, // in ms, should default to 0
    })
    wiredTodo;
}
```

The high-order bit here is how an adapter can be tailor-made for a particular environment, (e.g.: server side) while defining the default configuration for that medium, while still accepting certain configurations from users.

The actual problem here is how to keep all adapters in sync with it comes to implement these configurations. Passing the configuration to the adapter, and letting the adapter to do the right thing will not fit the bill here, it is way to easy to mess up, and users have no way to make a determination of who is at fault. For those reasons, expending the wire protocol to notify adapters when a timeout has occur, or when the data should be re-fetched is easier and safer. E.g.:

```js
function getTodoWireAdapterFactory(eventTarget) {
    let subscription;
    let config;

    eventTarget.addListener('timeout', (config) => {
        // the adapter receives a report that a timeout was issue by the component
        // due to inactivity
    });

    eventTarget.addListener('refresh', (config) => {
        // the adapter receives a report that a component will like to refresh
        // the wired data if possible
    });

    // ...

}
```

As for the default configuration, I think the APP owner should have the control. And alternative here is to use the `LWC_config` global variable to have a section about the wire, e.g.:

```js
LWC_config = {
    synthetic: true,
    wire: {
        block: 'always', // defaults to "never"
        timeout: 300,
    },
};
```

On the server side, you might want to suspense the wire call every time, forcing all components to render once the data has arrived, or timeout if the request takes more than 300 ms.

Note: `timeout` and `attemptToRefresh` are not needed as a configuration option per adapter instance when wiring it, that could come later. Same for the suspense configuration, we could support that only via the global config to begin with.