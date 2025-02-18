import { LightningElement } from 'lwc';

export default class Lifecycle extends LightningElement {
    /* eslint-disable no-console */
    eventHandlers = {
        test: function () {
            console.log('handled events dispatched from child connectedCallback');
        },
    };
    /* eslint-enable no-console */
}
