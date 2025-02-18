import { LightningElement } from 'lwc';

export default class Basic extends LightningElement {
    privateVariable = "'this' is the component"; // available only on the component not on the element

    /* eslint-disable no-console */
    eventHandlers = {
        click: function () {
            console.log('click handler called');
            console.log(this.privateVariable);
        },
        mouseover: function () {
            console.log('mouseover handler called');
        },
    };
    /* eslint-enable no-console */
}
