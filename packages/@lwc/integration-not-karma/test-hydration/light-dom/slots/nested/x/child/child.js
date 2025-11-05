import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    static renderMode = 'light';

    _executedHandlerCounter = 0;
    @api
    get timesHandlerIsExecuted() {
        return this._executedHandlerCounter;
    }

    handleClick() {
        this._executedHandlerCounter++;
    }
}
