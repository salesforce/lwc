import { LightningElement } from 'lwc';

export default class ReturningScript extends LightningElement {
    constructor() {
        super();
        const script = document.createElement('script');
        LightningElement.call(script);
        return script;
    }
}
