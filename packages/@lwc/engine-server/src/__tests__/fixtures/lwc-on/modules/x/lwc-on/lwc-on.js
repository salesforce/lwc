import { LightningElement } from 'lwc';

export default class LwcOn extends LightningElement {
    eventListeners = {
        click: () => {
            console.log('click');
        },
        foo: () => {
            console.log('foo');
        },
    };
}
