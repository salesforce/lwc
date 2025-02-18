import { LightningElement } from 'lwc';

export default class Spread extends LightningElement {
    /* eslint-disable no-console */
    spreadObject = {
        onclick: function () {
            console.log('lwc:spread handler called');
        },
    };

    eventHandlers = {
        click: function () {
            console.log('lwc:on handler called');
        },
    };
    /* eslint-enable no-console */
}
